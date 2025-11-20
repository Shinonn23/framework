import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { Project, Projects } from "../../prisma/model/project";
import { prisma } from "../../prisma";
import type { Project as ProjectType } from "../../prisma/generated/client";
import { seedPermissions } from "../../permission/seed";
import { PermissionService } from "../../permission/service";

describe("Project Class", () => {
    let testProject: ProjectType;
    let testUser: any;

    beforeEach(async () => {
        // Clean up any existing test data
        await prisma.userGrant.deleteMany();
        await prisma.project.deleteMany({
            where: { name: { startsWith: "test-project" } },
        });
        await prisma.user.deleteMany({
            where: { username: { startsWith: "test-user" } },
        });
        await prisma.role.deleteMany();
        await prisma.permission.deleteMany();

        await seedPermissions();

        testUser = await prisma.user.create({
            data: {
                username: "test-user",
                email: "test@example.com",
                password: "password",
            },
        });

        // Grant Super Admin to testUser for setup (or specific permissions)
        // For "create", we need system permission.
        const superAdminRole = await prisma.role.findFirst({ where: { name: "Super Admin" } });
        await prisma.userGrant.create({
            data: {
                userId: testUser.id,
                roleId: superAdminRole!.id,
                resourceType: "System",
                resourceId: 0
            }
        });
        PermissionService.invalidateCache(testUser.id);

        // Create a test project
        // We use the Project class to create it to ensure permissions are checked/assigned
        const projectInstance = new Project(testUser.id);
        testProject = await projectInstance.create({
            name: "test-project-1",
            ownerId: testUser.id,
            path: "/test/path",
            metaData: { test: true },
        });
    });

    afterEach(async () => {
        // Clean up test data
        await prisma.project.deleteMany({
            where: { name: { startsWith: "test-project" } },
        });
        await prisma.user.deleteMany({
            where: { username: { startsWith: "test-user" } },
        });
        PermissionService.invalidateCache(testUser.id);
    });

    describe("constructor", () => {
        it("should create instance with projectId", () => {
            const project = new Project(testUser.id, { projectId: testProject.id });
            expect(project).toBeDefined();
        });

        it("should create instance with projectName", () => {
            const project = new Project(testUser.id, { projectName: "test-project-1" });
            expect(project).toBeDefined();
        });

        it("should create instance without parameters", () => {
            const project = new Project(testUser.id);
            expect(project).toBeDefined();
        });
    });

    describe("get", () => {
        it("should get project by ID", async () => {
            const project = new Project(testUser.id, { projectId: testProject.id });
            const result = await project.get();

            expect(result.id).toBe(testProject.id);
            expect(result.name).toBe("test-project-1");
            expect(result.ownerId).toBe(testUser.id);
            expect(result.path).toBe("/test/path");
        });

        it("should get project by name", async () => {
            const project = new Project(testUser.id, { projectName: "test-project-1" });
            const result = await project.get();

            expect(result.id).toBe(testProject.id);
            expect(result.name).toBe("test-project-1");
        });

        it("should cache project after first fetch", async () => {
            const project = new Project(testUser.id, { projectId: testProject.id });
            const result1 = await project.get();
            const result2 = await project.get();

            expect(result1).toBe(result2); // Same object reference
        });

        it("should throw error when neither ID nor name is set", async () => {
            const project = new Project(testUser.id);
            await expect(project.get()).rejects.toThrow(
                "Project ID or Name must be set"
            );
        });

        it("should throw error when project not found", async () => {
            const project = new Project(testUser.id, { projectId: 999999 });
            await expect(project.get()).rejects.toThrow(
                "Failed to get project details"
            );
        });

        it("should throw error when permission denied", async () => {
            // Create another user without permission
            const otherUser = await prisma.user.create({
                data: { 
                    username: "other-" + Date.now(), 
                    email: "other-" + Date.now() + "@example.com", 
                    password: "pw" 
                }
            });
            const project = new Project(otherUser.id, { projectId: testProject.id });
            await expect(project.get()).rejects.toThrow("Permission denied");
        });
    });

    describe("create", () => {
        it("should create a new project", async () => {
            const project = new Project(testUser.id);
            const result = await project.create({
                name: "test-project-new",
                ownerId: testUser.id,
                path: "/new/path",
            });

            expect(result.name).toBe("test-project-new");
            expect(result.ownerId).toBe(testUser.id);
            expect(result.path).toBe("/new/path");
            expect(result.id).toBeDefined();
        });

        it("should create project with metadata", async () => {
            const project = new Project(testUser.id);
            const metaData = { version: "1.0", tags: ["test", "demo"] };
            const result = await project.create({
                name: "test-project-metadata",
                ownerId: testUser.id,
                path: "/meta/path",
                metaData,
            });

            expect(result.metaData).toEqual(metaData);
        });

        it("should cache created project", async () => {
            const project = new Project(testUser.id);
            const created = await project.create({
                name: "test-project-cached",
                ownerId: testUser.id,
                path: "/cached/path",
            });

            const fetched = await project.get();
            expect(created.id).toBe(fetched.id);
        });

        it("should throw error for duplicate project name", async () => {
            const project = new Project(testUser.id);
            await expect(
                project.create({
                    name: "test-project-1", // Already exists
                    ownerId: testUser.id,
                    path: "/duplicate/path",
                })
            ).rejects.toThrow("Failed to create project");
        });
    });

    describe("update", () => {
        it("should update project by ID", async () => {
            const project = new Project(testUser.id, { projectId: testProject.id });
            const newUser = await prisma.user.create({
                data: {
                    username: "updated-owner-" + Date.now(),
                    email: "updated-" + Date.now() + "@example.com",
                    password: "password",
                },
            });
            const result = await project.update({
                ownerId: newUser.id,
                path: "/updated/path",
            });

            expect(result.ownerId).toBe(newUser.id);
            expect(result.path).toBe("/updated/path");
            expect(result.name).toBe("test-project-1"); // Unchanged
        });

        it("should update project by name", async () => {
            const project = new Project(testUser.id, { projectName: "test-project-1" });
            const newUser = await prisma.user.create({
                data: {
                    username: "updated-owner-2-" + Date.now(),
                    email: "updated2-" + Date.now() + "@example.com",
                    password: "password",
                },
            });
            const result = await project.update({
                ownerId: newUser.id,
            });

            expect(result.ownerId).toBe(newUser.id);
        });

        it("should update cached project", async () => {
            const project = new Project(testUser.id, { projectId: testProject.id });
            await project.get(); // Cache the project
            
            const newUser = await prisma.user.create({
                data: {
                    username: "cached-owner-" + Date.now(),
                    email: "cached-" + Date.now() + "@example.com",
                    password: "password",
                },
            });

            const updated = await project.update({ ownerId: newUser.id });
            const fetched = await project.get();

            expect(updated.ownerId).toBe(newUser.id);
            expect(fetched.ownerId).toBe(newUser.id);
        });

        it("should update metadata", async () => {
            const project = new Project(testUser.id, { projectId: testProject.id });
            const newMetadata = { updated: true, version: "2.0" };
            const result = await project.update({ metaData: newMetadata });

            expect(result.metaData).toEqual(newMetadata);
        });

        it("should throw error when neither ID nor name is set", async () => {
            const project = new Project(testUser.id);
            await expect(
                project.update({ ownerId: 123 })
            ).rejects.toThrow("Project ID or Name must be set");
        });

        it("should throw error when project not found", async () => {
            const project = new Project(testUser.id, { projectId: 999999 });
            // We need to mock permission check passing for non-existent project? 
            // Actually get() throws "Failed to get project details" (which wraps "Project not found")
            // But update() calls get() internally if ID is missing.
            // If ID is present, update() calls check() then prisma.update().
            // check() will fail if project doesn't exist? No, check() checks DB for grant.
            // If project doesn't exist, grant doesn't exist. So check() returns false.
            // So it throws "Permission denied".
            
            // Wait, if I am Super Admin, check() returns true even if project doesn't exist (resourceId check is just a number).
            // So if I am Super Admin, check() passes.
            // Then prisma.update() throws "Record to update not found".
            
            await expect(
                project.update({ ownerId: 123 })
            ).rejects.toThrow(); // Could be permission or update failed
        });
    });

    describe("delete", () => {
        it("should delete project by ID", async () => {
            const project = new Project(testUser.id, { projectId: testProject.id });
            await project.delete();

            const count = await prisma.project.count({
                where: { id: testProject.id },
            });
            expect(count).toBe(0);
        });

        it("should delete project by name", async () => {
            const project = new Project(testUser.id, { projectName: "test-project-1" });
            await project.delete();

            const count = await prisma.project.count({
                where: { name: "test-project-1" },
            });
            expect(count).toBe(0);
        });

        it("should clear instance state after delete", async () => {
            const project = new Project(testUser.id, { projectId: testProject.id });
            await project.get(); // Cache the project
            await project.delete();

            await expect(project.get()).rejects.toThrow(
                "Project ID or Name must be set"
            );
        });

        it("should throw error when neither ID nor name is set", async () => {
            const project = new Project(testUser.id);
            await expect(project.delete()).rejects.toThrow(
                "Project ID or Name must be set"
            );
        });

        it("should throw error when project not found", async () => {
            const project = new Project(testUser.id, { projectId: 999999 });
            await expect(project.delete()).rejects.toThrow();
        });
    });
});

describe("Projects Class", () => {
    let ownerA: any;
    let ownerB: any;

    beforeEach(async () => {
        // Clean up existing test data
        await prisma.userGrant.deleteMany();
        await prisma.project.deleteMany({
            where: { name: { startsWith: "test-list-" } },
        });
        await prisma.user.deleteMany({
            where: { username: { startsWith: "owner-" } },
        });
        await prisma.role.deleteMany();
        await prisma.permission.deleteMany();
        await seedPermissions();

        ownerA = await prisma.user.create({
            data: {
                username: "owner-a",
                email: "owner-a@example.com",
                password: "password",
            },
        });

        ownerB = await prisma.user.create({
            data: {
                username: "owner-b",
                email: "owner-b@example.com",
                password: "password",
            },
        });

        // Grant Super Admin to owners so they can create projects
        const superAdminRole = await prisma.role.findFirst({ where: { name: "Super Admin" } });
        await prisma.userGrant.create({ data: { userId: ownerA.id, roleId: superAdminRole!.id, resourceType: "System", resourceId: 0 } });
        await prisma.userGrant.create({ data: { userId: ownerB.id, roleId: superAdminRole!.id, resourceType: "System", resourceId: 0 } });
        PermissionService.invalidateCache(ownerA.id);
        PermissionService.invalidateCache(ownerB.id);

        // Create multiple test projects using Project class to ensure grants
        const p1 = new Project(ownerA.id);
        await p1.create({ name: "test-list-1", ownerId: ownerA.id, path: "/path/a" });

        const p2 = new Project(ownerB.id);
        await p2.create({ name: "test-list-2", ownerId: ownerB.id, path: "/path/b" });

        const p3 = new Project(ownerA.id);
        await p3.create({ name: "test-list-3", ownerId: ownerA.id, path: "/path/c" });
    });

    afterEach(async () => {
        await prisma.project.deleteMany({
            where: { name: { startsWith: "test-list-" } },
        });
        await prisma.user.deleteMany({
            where: { username: { startsWith: "owner-" } },
        });
    });

    describe("list", () => {
        it("should list all projects without filters (Super Admin sees all)", async () => {
            const projects = new Projects(ownerA.id);
            const result = await projects.list();

            expect(result.projects.length).toBeGreaterThanOrEqual(3);
            expect(result.pagination.total).toBeGreaterThanOrEqual(3);
        });

        it("should list only accessible projects for normal user", async () => {
            // Create a normal user with access to only one project
            const normalUser = await prisma.user.create({
                data: { 
                    username: "normal-" + Date.now(), 
                    email: "normal-" + Date.now() + "@example.com", 
                    password: "pw" 
                }
            });
            
            // Grant Viewer on test-list-1
            const viewerRole = await prisma.role.findFirst({ where: { name: "Viewer" } });
            const p1 = await prisma.project.findFirst({ where: { name: "test-list-1" } });
            
            await prisma.userGrant.create({
                data: {
                    userId: normalUser.id,
                    roleId: viewerRole!.id,
                    resourceType: "Project",
                    resourceId: p1!.id
                }
            });
            PermissionService.invalidateCache(normalUser.id);

            const projects = new Projects(normalUser.id);
            const result = await projects.list();

            expect(result.projects.length).toBe(1);
            expect(result.projects[0].name).toBe("test-list-1");
        });

        it("should filter projects by name", async () => {
            const projects = new Projects(ownerA.id);
            const result = await projects.list({ name: "test-list-1" });

            expect(result.projects.length).toBe(1);
            expect(result.projects[0].name).toBe("test-list-1");
        });

        it("should filter projects by owner", async () => {
            const projects = new Projects(ownerA.id);
            const result = await projects.list({ ownerId: ownerA.id });

            expect(result.projects.length).toBe(2);
            expect(result.projects.every(p => p.ownerId === ownerA.id)).toBe(true);
        });

        it("should filter projects by path", async () => {
            const projects = new Projects(ownerA.id);
            const result = await projects.list({ path: "/path/a" });

            expect(result.projects.length).toBeGreaterThanOrEqual(1);
            expect(result.projects.some(p => p.path === "/path/a")).toBe(true);
        });

        it("should support pagination", async () => {
            const projects = new Projects(ownerA.id);
            const page1 = await projects.list({}, { page: 1, pageSize: 2 });
            const page2 = await projects.list({}, { page: 2, pageSize: 2 });

            expect(page1.projects.length).toBe(2);
            expect(page1.pagination.page).toBe(1);
            expect(page1.pagination.pageSize).toBe(2);
            
            // Verify different projects on different pages
            const page1Ids = page1.projects.map(p => p.id);
            const page2Ids = page2.projects.map(p => p.id);
            expect(page1Ids).not.toEqual(page2Ids);
        });

        it("should sort projects ascending", async () => {
            const projects = new Projects(ownerA.id);
            const result = await projects.list(
                {},
                { sortBy: "name", sortOrder: "asc" }
            );

            const names = result.projects.map(p => p.name);
            const sortedNames = [...names].sort();
            expect(names).toEqual(sortedNames);
        });

        it("should sort projects descending", async () => {
            const projects = new Projects(ownerA.id);
            const result = await projects.list(
                {},
                { sortBy: "name", sortOrder: "desc" }
            );

            const names = result.projects.map(p => p.name);
            const sortedNames = [...names].sort().reverse();
            expect(names).toEqual(sortedNames);
        });

        it("should calculate pagination correctly", async () => {
            const projects = new Projects(ownerA.id);
            const result = await projects.list({}, { pageSize: 2 });

            expect(result.pagination.totalPages).toBe(
                Math.ceil(result.pagination.total / 2)
            );
        });

        it("should combine filters and pagination", async () => {
            const projects = new Projects(ownerA.id);
            const result = await projects.list(
                { ownerId: ownerA.id },
                { page: 1, pageSize: 1 }
            );

            expect(result.projects.length).toBe(1);
            expect(result.projects[0].ownerId).toBe(ownerA.id);
            expect(result.pagination.total).toBe(2);
        });
    });

    describe("getInstance", () => {
        it("should return Project instance with correct ID", async () => {
            const projects = new Projects(ownerA.id);
            const testProject = await prisma.project.findFirst({
                where: { name: "test-list-1" },
            });

            const instance = projects.getInstance(testProject!.id);
            const result = await instance.get();

            expect(result.id).toBe(testProject!.id);
            expect(result.name).toBe("test-list-1");
        });
    });
});
