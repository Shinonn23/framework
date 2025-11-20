import { prisma } from "../prisma";

export type ResourceType =
    | "System"
    | "Project"
    | "Module"
    | "Document"
    | "Report"
    | "Workspace";

interface PermissionCacheEntry {
    actions: Set<string>;
    expiresAt: number;
}

const permCache = new Map<string, PermissionCacheEntry>();
const CACHE_TTL = 60 * 1000; // 1 minute

export class PermissionService {
    /**
     * Check if a user has a specific permission on a resource.
     */
    static async check(
        userId: number,
        action: string,
        resourceType: ResourceType,
        resourceId: number,
    ): Promise<boolean> {
        const actions = await this.resolvePermissions(
            userId,
            resourceType,
            resourceId,
        );
        return actions.has(action) || actions.has("*");
    }

    /**
     * Resolve all permissions for a user on a resource, including inherited ones.
     */
    private static async resolvePermissions(
        userId: number,
        resourceType: ResourceType,
        resourceId: number,
    ): Promise<Set<string>> {
        const cacheKey = `${userId}:${resourceType}:${resourceId}`;
        const now = Date.now();

        // 1. Check Cache
        const cached = permCache.get(cacheKey);
        if (cached && cached.expiresAt > now) {
            return cached.actions;
        }

        const actions = new Set<string>();

        // 2. Get Direct Grants
        const grants = await prisma.userGrant.findMany({
            where: { userId, resourceType, resourceId },
            include: {
                role: {
                    include: { permissions: { include: { permission: true } } },
                },
            },
        });

        for (const grant of grants) {
            for (const rp of grant.role.permissions) {
                actions.add(rp.permission.action);
            }
        }

        // 3. Inherit from Parent
        if (resourceType === "System") {
            // Top level, no parent.
        } else if (resourceType === "Project") {
            // Parent is System
            const systemActions = await this.resolvePermissions(
                userId,
                "System",
                0,
            );
            for (const a of systemActions) actions.add(a);
        } else if (resourceType === "Module") {
            // Parent is Project
            const projectId = await this.getParentProjectId(resourceId);
            if (projectId) {
                const projectActions = await this.resolvePermissions(
                    userId,
                    "Project",
                    projectId,
                );
                for (const a of projectActions) actions.add(a);
            }
        } else if (["Document", "Report", "Workspace"].includes(resourceType)) {
            // Parent is Module
            const moduleId = await this.getParentModuleId(
                resourceType,
                resourceId,
            );
            if (moduleId) {
                const moduleActions = await this.resolvePermissions(
                    userId,
                    "Module",
                    moduleId,
                );
                for (const a of moduleActions) actions.add(a);
            }
        }

        // 4. Update Cache
        permCache.set(cacheKey, {
            actions: actions,
            expiresAt: now + CACHE_TTL,
        });

        return actions;
    }

    private static async getParentModuleId(
        type: ResourceType,
        id: number,
    ): Promise<number | null> {
        if (type === "Document") {
            const doc = await prisma.document.findUnique({
                where: { id },
                select: { moduleId: true },
            });
            return doc?.moduleId || null;
        }
        if (type === "Report") {
            const rep = await prisma.report.findUnique({
                where: { id },
                select: { moduleId: true },
            });
            return rep?.moduleId || null;
        }
        if (type === "Workspace") {
            const ws = await prisma.workspace.findUnique({
                where: { id },
                select: { moduleId: true },
            });
            return ws?.moduleId || null;
        }
        return null;
    }

    private static async getParentProjectId(
        moduleId: number,
    ): Promise<number | null> {
        const mod = await prisma.module.findUnique({
            where: { id: moduleId },
            select: { projectId: true },
        });
        return mod?.projectId || null;
    }

    /**
     * Invalidate cache for a user. Call this when roles change.
     */
    static invalidateCache(userId: number) {
        for (const key of permCache.keys()) {
            if (key.startsWith(`${userId}:`)) {
                permCache.delete(key);
            }
        }
    }
}
