import { prisma } from "@/prisma";
import type { PrismaClient, Project as ProjectType, Prisma } from "@/prisma/generated/client";
import { PermissionService } from "@/permission/service";

export class Project {
    private prisma: PrismaClient = prisma;
    private projectId: number | null;
    private projectName: string | null;
    private userId: number;

    private cachedProject: ProjectType | null = null;

    constructor(userId: number, {
        projectId = null,
        projectName = null,
    }: { projectId?: number | null; projectName?: string | null } = {}) {
        this.userId = userId;
        this.projectId = projectId;
        this.projectName = projectName;
    }

    /**
     * Get project details, cached after first fetch
     */
    async get(): Promise<ProjectType> {
        if (!this.projectId && !this.projectName) {
            throw new Error("Project ID or Name must be set");
        }

        if (this.cachedProject) return this.cachedProject;

        try {
            const project = this.projectId
                ? await this.prisma.project.findUniqueOrThrow({
                      where: { id: this.projectId },
                  })
                : await this.prisma.project.findFirst({
                      where: { name: this.projectName! },
                  });

            if (!project) throw new Error("Project not found");

            // Check Permission
            const canRead = await PermissionService.check(this.userId, "project:read", "Project", project.id);
            if (!canRead) throw new Error("Permission denied");

            this.cachedProject = project;
            // Ensure ID is set if we fetched by name
            this.projectId = project.id;
            
            return project;
        } catch (error: any) {
            if (error.message === "Permission denied") throw error;
            throw new Error("Failed to get project details", { cause: error });
        }
    }

    /**
     * Create a new project
     */
    async create(data: {
        name: string;
        ownerId: number;
        path: string;
        metaData?: any;
    }): Promise<ProjectType> {
        // Check Global Permission (e.g. "project:create" on System)
        // Or we assume anyone can create a project?
        // Let's enforce "project:create" on System level.
        const canCreate = await PermissionService.check(this.userId, "project:create", "System", 0);
        if (!canCreate) throw new Error("Permission denied: Cannot create project");

        try {
            const project = await this.prisma.project.create({ data });
            
            // Auto-assign Owner Role to the creator
            const ownerRole = await this.prisma.role.findFirst({ where: { name: "Owner", projectId: null } });
            if (ownerRole) {
                await this.prisma.userGrant.create({
                    data: {
                        userId: this.userId,
                        roleId: ownerRole.id,
                        resourceType: "Project",
                        resourceId: project.id
                    }
                });
            }

            this.projectId = project.id;
            this.projectName = project.name;
            this.cachedProject = project;
            return project;
        } catch (error) {
            throw new Error("Failed to create project", { cause: error });
        }
    }

    /**
     * Update project fields
     */
    async update(data: Prisma.ProjectUncheckedUpdateInput): Promise<ProjectType> {
        if (!this.projectId && !this.projectName) {
            throw new Error("Project ID or Name must be set");
        }

        // Ensure we have the ID to check permission
        if (!this.projectId) await this.get();

        const canUpdate = await PermissionService.check(this.userId, "project:update", "Project", this.projectId!);
        if (!canUpdate) throw new Error("Permission denied");

        try {
            const project = await this.prisma.project.update({
                where: { id: this.projectId! },
                data,
            });

            // Keep cachedProject and instance properties in sync
            this.projectId = project.id;
            this.projectName = project.name;
            this.cachedProject = project;

            return project;
        } catch (error) {
            throw new Error("Failed to update project", { cause: error });
        }
    }

    /**
     * Delete project
     */
    async delete(): Promise<void> {
        if (!this.projectId && !this.projectName) {
            throw new Error("Project ID or Name must be set");
        }

        // Ensure we have the ID to check permission
        if (!this.projectId) await this.get();

        const canDelete = await PermissionService.check(this.userId, "project:delete", "Project", this.projectId!);
        if (!canDelete) throw new Error("Permission denied");

        try {
            await this.prisma.project.delete({
                where: { id: this.projectId! },
            });

            // Clear instance state
            this.projectId = null;
            this.projectName = null;
            this.cachedProject = null;
        } catch (error) {
            throw new Error("Failed to delete project", { cause: error });
        }
    }
}


export class Projects {
    private prisma: PrismaClient = prisma;
    private userId: number;

    constructor(userId: number) {
        this.userId = userId;
    }

    async list(
        filters: Partial<
            Pick<
                ProjectType,
                | "name"
                | "id"
                | "ownerId"
                | "path"
                | "metaData"
                | "createdAt"
                | "updatedAt"
            >
        > = {},
        options: {
            sortBy?: keyof ProjectType;
            sortOrder?: "asc" | "desc";
            page?: number;
            pageSize?: number;
        } = {},
    ): Promise<{
        projects: ProjectType[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }> {
        const {
            sortBy = "createdAt",
            sortOrder = "desc",
            page = 1,
            pageSize = 10,
        } = options;
        const skip = (page - 1) * pageSize;

        // Filter by Permission: User must have "project:read" on the project.
        // This is complex to do in a single query without a join on UserGrant.
        // Strategy:
        // 1. Find all Project IDs where user has a grant (Direct or via Role).
        // 2. Or if user is Super Admin, they see all.
        
        const isSuperAdmin = await PermissionService.check(this.userId, "*", "System", 0);
        
        let permissionWhere: any = {};

        if (!isSuperAdmin) {
            // Find grants for this user on Projects
            const grants = await this.prisma.userGrant.findMany({
                where: {
                    userId: this.userId,
                    resourceType: "Project"
                },
                select: { resourceId: true }
            });
            const projectIds = grants.map(g => g.resourceId);
            permissionWhere = { id: { in: projectIds } };
        }

        const where = {
            ...permissionWhere,
            ...(filters.name && { name: { contains: filters.name } }),
            ...(filters.ownerId && { ownerId: filters.ownerId }),
            ...(filters.path && { path: { contains: filters.path } }),
        };

        try {
            const [projects, total] = await Promise.all([
                this.prisma.project.findMany({
                    where,
                    orderBy: { [sortBy]: sortOrder },
                    skip,
                    take: pageSize,
                }),
                this.prisma.project.count({ where }),
            ]);

            return {
                projects,
                pagination: {
                    page,
                    pageSize,
                    total,
                    totalPages: Math.ceil(total / pageSize),
                },
            };
        } catch (error) {
            throw new Error("Failed to list projects", { cause: error });
        }
    }

    getInstance(id: number): Project {
        return new Project(this.userId, { projectId: id });
    }
}
