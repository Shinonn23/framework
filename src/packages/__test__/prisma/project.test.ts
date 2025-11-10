import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { Project, Projects } from "@/prisma/model/project";
import { prisma } from "@/prisma";
import type { Project as ProjectType } from "@/prisma/generated/client";

describe("Project Class", () => {
    let testProject: ProjectType;

    beforeEach(async () => {
        // Clean up any existing test data
        await prisma.project.deleteMany({
            where: { name: { startsWith: "test-project" } },
        });

        // Create a test project
        testProject = await prisma.project.create({
            data: {
                name: "test-project-1",
                owner: "test-user",
                path: "/test/path",
                metadata: { test: true },
            },
        });
    });

    afterEach(async () => {
        // Clean up test data
        await prisma.project.deleteMany({
            where: { name: { startsWith: "test-project" } },
        });
    });

    describe("constructor", () => {
        it("should create instance with projectId", () => {
            const project = new Project({ projectId: testProject.id });
            expect(project).toBeDefined();
        });

        it("should create instance with projectName", () => {
            const project = new Project({ projectName: "test-project-1" });
            expect(project).toBeDefined();
        });

        it("should create instance without parameters", () => {
            const project = new Project();
            expect(project).toBeDefined();
        });
    });

    describe("get", () => {
        it("should get project by ID", async () => {
            const project = new Project({ projectId: testProject.id });
            const result = await project.get();

            expect(result.id).toBe(testProject.id);
            expect(result.name).toBe("test-project-1");
            expect(result.owner).toBe("test-user");
            expect(result.path).toBe("/test/path");
        });

        it("should get project by name", async () => {
            const project = new Project({ projectName: "test-project-1" });
            const result = await project.get();

            expect(result.id).toBe(testProject.id);
            expect(result.name).toBe("test-project-1");
        });

        it("should cache project after first fetch", async () => {
            const project = new Project({ projectId: testProject.id });
            const result1 = await project.get();
            const result2 = await project.get();

            expect(result1).toBe(result2); // Same object reference
        });

        it("should throw error when neither ID nor name is set", async () => {
            const project = new Project();
            await expect(project.get()).rejects.toThrow(
                "Project ID or Name must be set"
            );
        });

        it("should throw error when project not found", async () => {
            const project = new Project({ projectId: "non-existent-id" });
            await expect(project.get()).rejects.toThrow(
                "Failed to get project details"
            );
        });
    });

    describe("create", () => {
        it("should create a new project", async () => {
            const project = new Project();
            const result = await project.create({
                name: "test-project-new",
                owner: "new-owner",
                path: "/new/path",
            });

            expect(result.name).toBe("test-project-new");
            expect(result.owner).toBe("new-owner");
            expect(result.path).toBe("/new/path");
            expect(result.id).toBeDefined();
        });

        it("should create project with metadata", async () => {
            const project = new Project();
            const metadata = { version: "1.0", tags: ["test", "demo"] };
            const result = await project.create({
                name: "test-project-metadata",
                owner: "test-owner",
                path: "/meta/path",
                metadata,
            });

            expect(result.metadata).toEqual(metadata);
        });

        it("should cache created project", async () => {
            const project = new Project();
            const created = await project.create({
                name: "test-project-cached",
                owner: "test-owner",
                path: "/cached/path",
            });

            const fetched = await project.get();
            expect(created.id).toBe(fetched.id);
        });

        it("should throw error for duplicate project name", async () => {
            const project = new Project();
            await expect(
                project.create({
                    name: "test-project-1", // Already exists
                    owner: "test-owner",
                    path: "/duplicate/path",
                })
            ).rejects.toThrow("Failed to create project");
        });
    });

    describe("update", () => {
        it("should update project by ID", async () => {
            const project = new Project({ projectId: testProject.id });
            const result = await project.update({
                owner: "updated-owner",
                path: "/updated/path",
            });

            expect(result.owner).toBe("updated-owner");
            expect(result.path).toBe("/updated/path");
            expect(result.name).toBe("test-project-1"); // Unchanged
        });

        it("should update project by name", async () => {
            const project = new Project({ projectName: "test-project-1" });
            const result = await project.update({
                owner: "updated-owner-2",
            });

            expect(result.owner).toBe("updated-owner-2");
        });

        it("should update cached project", async () => {
            const project = new Project({ projectId: testProject.id });
            await project.get(); // Cache the project
            
            const updated = await project.update({ owner: "cached-owner" });
            const fetched = await project.get();

            expect(updated.owner).toBe("cached-owner");
            expect(fetched.owner).toBe("cached-owner");
        });

        it("should update metadata", async () => {
            const project = new Project({ projectId: testProject.id });
            const newMetadata = { updated: true, version: "2.0" };
            const result = await project.update({ metadata: newMetadata });

            expect(result.metadata).toEqual(newMetadata);
        });

        it("should throw error when neither ID nor name is set", async () => {
            const project = new Project();
            await expect(
                project.update({ owner: "fail" })
            ).rejects.toThrow("Project ID or Name must be set");
        });

        it("should throw error when project not found", async () => {
            const project = new Project({ projectId: "non-existent-id" });
            await expect(
                project.update({ owner: "fail" })
            ).rejects.toThrow("Failed to update project");
        });
    });

    describe("delete", () => {
        it("should delete project by ID", async () => {
            const project = new Project({ projectId: testProject.id });
            await project.delete();

            const count = await prisma.project.count({
                where: { id: testProject.id },
            });
            expect(count).toBe(0);
        });

        it("should delete project by name", async () => {
            const project = new Project({ projectName: "test-project-1" });
            await project.delete();

            const count = await prisma.project.count({
                where: { name: "test-project-1" },
            });
            expect(count).toBe(0);
        });

        it("should clear instance state after delete", async () => {
            const project = new Project({ projectId: testProject.id });
            await project.get(); // Cache the project
            await project.delete();

            await expect(project.get()).rejects.toThrow(
                "Project ID or Name must be set"
            );
        });

        it("should throw error when neither ID nor name is set", async () => {
            const project = new Project();
            await expect(project.delete()).rejects.toThrow(
                "Project ID or Name must be set"
            );
        });

        it("should throw error when project not found", async () => {
            const project = new Project({ projectId: "non-existent-id" });
            await expect(project.delete()).rejects.toThrow(
                "Failed to delete project"
            );
        });
    });
});

describe("Projects Class", () => {
    beforeEach(async () => {
        // Clean up existing test data
        await prisma.project.deleteMany({
            where: { name: { startsWith: "test-list-" } },
        });

        // Create multiple test projects
        await Promise.all([
            prisma.project.create({
                data: {
                    name: "test-list-1",
                    owner: "owner-a",
                    path: "/path/a",
                },
            }),
            prisma.project.create({
                data: {
                    name: "test-list-2",
                    owner: "owner-b",
                    path: "/path/b",
                },
            }),
            prisma.project.create({
                data: {
                    name: "test-list-3",
                    owner: "owner-a",
                    path: "/path/c",
                },
            }),
        ]);
    });

    afterEach(async () => {
        await prisma.project.deleteMany({
            where: { name: { startsWith: "test-list-" } },
        });
    });

    describe("list", () => {
        it("should list all projects without filters", async () => {
            const projects = new Projects();
            const result = await projects.list();

            expect(result.projects.length).toBeGreaterThanOrEqual(3);
            expect(result.pagination.total).toBeGreaterThanOrEqual(3);
        });

        it("should filter projects by name", async () => {
            const projects = new Projects();
            const result = await projects.list({ name: "test-list-1" });

            expect(result.projects.length).toBe(1);
            expect(result.projects[0].name).toBe("test-list-1");
        });

        it("should filter projects by owner", async () => {
            const projects = new Projects();
            const result = await projects.list({ owner: "owner-a" });

            expect(result.projects.length).toBe(2);
            expect(result.projects.every(p => p.owner === "owner-a")).toBe(true);
        });

        it("should filter projects by path", async () => {
            const projects = new Projects();
            const result = await projects.list({ path: "/path/a" });

            expect(result.projects.length).toBeGreaterThanOrEqual(1);
            expect(result.projects.some(p => p.path === "/path/a")).toBe(true);
        });

        it("should support pagination", async () => {
            const projects = new Projects();
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
            const projects = new Projects();
            const result = await projects.list(
                {},
                { sortBy: "name", sortOrder: "asc" }
            );

            const names = result.projects.map(p => p.name);
            const sortedNames = [...names].sort();
            expect(names).toEqual(sortedNames);
        });

        it("should sort projects descending", async () => {
            const projects = new Projects();
            const result = await projects.list(
                {},
                { sortBy: "name", sortOrder: "desc" }
            );

            const names = result.projects.map(p => p.name);
            const sortedNames = [...names].sort().reverse();
            expect(names).toEqual(sortedNames);
        });

        it("should calculate pagination correctly", async () => {
            const projects = new Projects();
            const result = await projects.list({}, { pageSize: 2 });

            expect(result.pagination.totalPages).toBe(
                Math.ceil(result.pagination.total / 2)
            );
        });

        it("should combine filters and pagination", async () => {
            const projects = new Projects();
            const result = await projects.list(
                { owner: "owner-a" },
                { page: 1, pageSize: 1 }
            );

            expect(result.projects.length).toBe(1);
            expect(result.projects[0].owner).toBe("owner-a");
            expect(result.pagination.total).toBe(2);
        });
    });

    describe("getInstance", () => {
        it("should return Project instance with correct ID", async () => {
            const projects = new Projects();
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
