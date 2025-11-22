import { prisma } from "@/prisma";
import type {
    PrismaClient,
    Project as ProjectType,
    Prisma,
} from "@/prisma/generated/client";

export class Project {
    private prisma: PrismaClient = prisma;
    private projectId: number | null;
    private projectName: string | null;
    private userId: number;

    private cachedProject: ProjectType | null = null;

    constructor(
        userId: number,
        {
            projectId = null,
            projectName = null,
        }: { projectId?: number | null; projectName?: string | null } = {},
    ) {
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
        try {
            const project = await this.prisma.project.create({ data });

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
    async update(
        data: Prisma.ProjectUncheckedUpdateInput,
    ): Promise<ProjectType> {
        if (!this.projectId && !this.projectName) {
            throw new Error("Project ID or Name must be set");
        }

        // Ensure we have the ID
        if (!this.projectId) await this.get();

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

        // Ensure we have the ID
        if (!this.projectId) await this.get();

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

        const where = {
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
