import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { PermissionService } from "../../permission/service";
import { prisma } from "../../prisma";
import { seedPermissions } from "../../permission/seed";

describe("Permission Service", () => {
    let testUser: any;
    let testProject: any;
    let testModule: any;
    let testDocument: any;

    beforeEach(async () => {
        // Clean up
        await prisma.userGrant.deleteMany();
        await prisma.document.deleteMany();
        await prisma.module.deleteMany();
        await prisma.project.deleteMany();
        await prisma.user.deleteMany();
        await prisma.role.deleteMany();
        await prisma.permission.deleteMany();

        // Seed base permissions and roles
        await seedPermissions();

        // Create Test User
        testUser = await prisma.user.create({
            data: {
                username: "perm-test-user",
                email: "perm-test@example.com",
                password: "password",
            },
        });

        // Create Hierarchy: Project -> Module -> Document
        testProject = await prisma.project.create({
            data: {
                name: "perm-test-project",
                path: "/perm-test",
                ownerId: testUser.id,
            },
        });

        testModule = await prisma.module.create({
            data: {
                name: "perm-test-module",
                projectId: testProject.id,
            },
        });

        testDocument = await prisma.document.create({
            data: {
                name: "perm-test-doc",
                moduleId: testModule.id,
            },
        });
    });

    afterEach(async () => {
        PermissionService.invalidateCache(testUser.id);
    });

    describe("Direct Grants", () => {
        it("should allow access when user has direct permission on resource", async () => {
            // Grant "Editor" on Document
            const editorRole = await prisma.role.findFirst({ where: { name: "Editor", projectId: null } });
            expect(editorRole).toBeDefined();

            await prisma.userGrant.create({
                data: {
                    userId: testUser.id,
                    roleId: editorRole!.id,
                    resourceType: "Document",
                    resourceId: testDocument.id,
                },
            });

            const canRead = await PermissionService.check(testUser.id, "document:read", "Document", testDocument.id);
            const canUpdate = await PermissionService.check(testUser.id, "document:update", "Document", testDocument.id);
            const canDelete = await PermissionService.check(testUser.id, "document:delete", "Document", testDocument.id);

            expect(canRead).toBe(true);
            expect(canUpdate).toBe(true);
            expect(canDelete).toBe(false); // Editor doesn't have delete
        });
    });

    describe("Inheritance", () => {
        it("should inherit permissions from Module to Document", async () => {
            // Grant "Editor" on Module
            const editorRole = await prisma.role.findFirst({ where: { name: "Editor", projectId: null } });
            
            await prisma.userGrant.create({
                data: {
                    userId: testUser.id,
                    roleId: editorRole!.id,
                    resourceType: "Module",
                    resourceId: testModule.id,
                },
            });

            // Check permission on Child Document
            const canReadDoc = await PermissionService.check(testUser.id, "document:read", "Document", testDocument.id);
            expect(canReadDoc).toBe(true);
        });

        it("should inherit permissions from Project to Module and Document", async () => {
            // Grant "Owner" on Project
            const ownerRole = await prisma.role.findFirst({ where: { name: "Owner", projectId: null } });
            
            await prisma.userGrant.create({
                data: {
                    userId: testUser.id,
                    roleId: ownerRole!.id,
                    resourceType: "Project",
                    resourceId: testProject.id,
                },
            });

            // Check permission on Child Module
            const canCreateDoc = await PermissionService.check(testUser.id, "document:create", "Module", testModule.id);
            expect(canCreateDoc).toBe(true);

            // Check permission on Grandchild Document
            const canDeleteDoc = await PermissionService.check(testUser.id, "document:delete", "Document", testDocument.id);
            expect(canDeleteDoc).toBe(true); // Owner has *
        });
    });

    describe("Global Roles", () => {
        it("should allow Super Admin to access everything", async () => {
            // Grant "Super Admin" (Global)
            const superAdminRole = await prisma.role.findFirst({ where: { name: "Super Admin", projectId: null } });
            
            await prisma.userGrant.create({
                data: {
                    userId: testUser.id,
                    roleId: superAdminRole!.id,
                    resourceType: "System",
                    resourceId: 0,
                },
            });

            const canDeleteProject = await PermissionService.check(testUser.id, "project:delete", "Project", testProject.id);
            expect(canDeleteProject).toBe(true);
        });
    });

    describe("Caching", () => {
        it("should cache permissions and avoid DB calls", async () => {
            // Grant "Viewer" on Project
            const viewerRole = await prisma.role.findFirst({ where: { name: "Viewer", projectId: null } });
            
            await prisma.userGrant.create({
                data: {
                    userId: testUser.id,
                    roleId: viewerRole!.id,
                    resourceType: "Project",
                    resourceId: testProject.id,
                },
            });

            // First call - hits DB
            const start = performance.now();
            await PermissionService.check(testUser.id, "project:read", "Project", testProject.id);
            const firstCallDuration = performance.now() - start;

            // Second call - hits Cache
            const start2 = performance.now();
            await PermissionService.check(testUser.id, "project:read", "Project", testProject.id);
            const secondCallDuration = performance.now() - start2;

            // Expect second call to be significantly faster (though in test env it might be close, logic holds)
            // We can also verify by checking if we can modify DB and still get old result (if we didn't invalidate)
            
            // Remove grant directly in DB
            await prisma.userGrant.deleteMany({ where: { userId: testUser.id } });

            // Should still return true due to cache
            const cachedResult = await PermissionService.check(testUser.id, "project:read", "Project", testProject.id);
            expect(cachedResult).toBe(true);

            // Invalidate Cache
            PermissionService.invalidateCache(testUser.id);

            // Should now return false
            const freshResult = await PermissionService.check(testUser.id, "project:read", "Project", testProject.id);
            expect(freshResult).toBe(false);
        });
    });
});
