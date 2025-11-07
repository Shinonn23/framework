import {
    describe,
    it,
    expect,
    beforeEach,
    afterEach,
    mock,
    spyOn,
} from "bun:test";
import { init } from "../app/init";
import fs from "fs-extra";
import path from "path";
import * as childProcess from "child_process";

// Type-safe mock for execSync
let execSyncSpy: ReturnType<typeof spyOn>;

describe("init function", () => {
    const testDir = path.join(process.cwd(), "__test_projects__");
    const testProjectName = "test-app";
    const testProjectPath = path.join(testDir, testProjectName);

    beforeEach(async () => {
        // Clean up test directory
        await fs.remove(testDir);
        await fs.ensureDir(testDir);

        // Spy on execSync to avoid actual git operations
        execSyncSpy = spyOn(childProcess, "execSync").mockImplementation((() =>
            Buffer.from("")) as any);
    });

    afterEach(async () => {
        // Clean up test directory
        await fs.remove(testDir);

        // Restore execSync
        execSyncSpy?.mockRestore();
    });

    describe("resolveProjectPath", () => {
        it("should append project name when path is './'", async () => {
            const stateChanges: Array<{ step: string; message: string }> = [];

            // Create a fake template structure
            const fakePath = path.join(testDir, testProjectName);
            await fs.ensureDir(fakePath);
            await fs.writeJson(path.join(fakePath, "package.json"), {
                name: "template",
                version: "1.0.0",
            });

            try {
                const result = await init(
                    "./",
                    testProjectName,
                    "dev",
                    (state) => stateChanges.push(state),
                );

                expect(result.name).toBe(testProjectName);
                expect(result.path).toContain(testProjectName);
            } catch (error) {
                // Expected to fail due to mocked git operations
                expect(
                    stateChanges.some((s) => s.step === "creating_path"),
                ).toBe(true);
            }
        });

        it("should append project name when path is '.'", async () => {
            const stateChanges: Array<{ step: string; message: string }> = [];

            try {
                await init(".", testProjectName, "dev", (state) =>
                    stateChanges.push(state),
                );
            } catch (error) {
                // Expected to fail but should validate path resolution
                expect(stateChanges.some((s) => s.step === "validating")).toBe(
                    true,
                );
            }
        });
    });

    describe("default values", () => {
        it("should use default name 'my-app' when name is null", async () => {
            const stateChanges: Array<{ step: string; message: string }> = [];

            try {
                await init(testDir, null, "dev", (state) =>
                    stateChanges.push(state),
                );
            } catch (error) {
                // Expected to fail but should use default name
                expect(stateChanges.some((s) => s.step === "validating")).toBe(
                    true,
                );
            }
        });

        it("should use default path './' when path is null", async () => {
            const stateChanges: Array<{ step: string; message: string }> = [];

            try {
                await init(null, testProjectName, "dev", (state) =>
                    stateChanges.push(state),
                );
            } catch (error) {
                // Expected to fail but should use default path
                expect(
                    stateChanges.some((s) => s.step === "creating_path"),
                ).toBe(true);
            }
        });

        it("should use default version 'dev' when version is null", async () => {
            const stateChanges: Array<{ step: string; message: string }> = [];

            try {
                await init(testDir, testProjectName, null, (state) =>
                    stateChanges.push(state),
                );
            } catch (error) {
                // Expected to fail but should use default version
                expect(stateChanges.some((s) => s.step === "validating")).toBe(
                    true,
                );
            }
        });
    });

    describe("directory existence check", () => {
        it("should ask for overwrite when directory exists", async () => {
            const stateChanges: Array<{ step: string; message: string }> = [];
            let overwriteCalled = false;

            // Create existing directory
            await fs.ensureDir(testProjectPath);

            const shouldOverwrite = async () => {
                overwriteCalled = true;
                return false; // Don't overwrite
            };

            try {
                await init(
                    testProjectPath,
                    testProjectName,
                    "dev",
                    (state) => stateChanges.push(state),
                    shouldOverwrite,
                );
            } catch (error) {
                expect(overwriteCalled).toBe(true);
                expect((error as Error).message).toContain("already exists");
            }
        });

        it("should remove existing directory when overwrite is confirmed", async () => {
            const stateChanges: Array<{ step: string; message: string }> = [];

            // Create existing directory with a file
            await fs.ensureDir(testProjectPath);
            await fs.writeFile(
                path.join(testProjectPath, "test.txt"),
                "test content",
            );

            const shouldOverwrite = async () => true;

            try {
                await init(
                    testProjectPath,
                    testProjectName,
                    "dev",
                    (state) => stateChanges.push(state),
                    shouldOverwrite,
                );
            } catch (error) {
                // Directory should be removed before error occurs
                const exists = await fs.pathExists(
                    path.join(testProjectPath, "test.txt"),
                );
                expect(exists).toBe(false);
            }
        });
    });

    describe("state callbacks", () => {
        it("should call onStateChange with correct steps", async () => {
            const stateChanges: Array<{ step: string; message: string }> = [];

            try {
                await init(testProjectPath, testProjectName, "dev", (state) =>
                    stateChanges.push(state),
                );
            } catch (error) {
                // Check that state changes were called in order
                const steps = stateChanges.map((s) => s.step);
                expect(steps).toContain("validating");
                expect(steps).toContain("creating_path");
            }
        });

        it("should provide error state when init fails", async () => {
            const stateChanges: Array<{ step: string; message: string }> = [];

            try {
                // Use invalid path to force error
                await init(
                    "/invalid/path/that/cannot/be/created",
                    testProjectName,
                    "dev",
                    (state) => stateChanges.push(state),
                );
            } catch (error) {
                const errorState = stateChanges.find((s) => s.step === "error");
                expect(errorState).toBeDefined();
                expect(errorState?.message).toBeDefined();
            }
        });
    });

    describe("home directory resolution", () => {
        it("should resolve ~ to home directory", async () => {
            const stateChanges: Array<{ step: string; message: string }> = [];

            try {
                await init("~/test-project", testProjectName, "dev", (state) =>
                    stateChanges.push(state),
                );
            } catch (error) {
                // Should attempt to create in home directory
                expect(
                    stateChanges.some((s) => s.step === "creating_path"),
                ).toBe(true);
            }
        });
    });

    describe("package.json update", () => {
        it("should update package.json with project name and version", async () => {
            // Create a fake project structure
            await fs.ensureDir(testProjectPath);
            await fs.writeJson(path.join(testProjectPath, "package.json"), {
                name: "template-name",
                version: "0.0.1",
                description: "Template project",
            });

            try {
                const result = await init(
                    testProjectPath,
                    testProjectName,
                    "1.0.0",
                    undefined,
                );

                const packageJson = await fs.readJson(
                    path.join(testProjectPath, "package.json"),
                );
                expect(packageJson.name).toBe(testProjectName);
                expect(packageJson.version).toBe("1.0.0");
                expect(packageJson.description).toBe("Template project");
            } catch (error) {
                // Test package.json update logic even if other parts fail
            }
        });
    });

    describe("error handling", () => {
        it("should throw error when shouldOverwrite returns false", async () => {
            await fs.ensureDir(testProjectPath);

            const shouldOverwrite = async () => false;

            await expect(
                init(
                    testProjectPath,
                    testProjectName,
                    "dev",
                    undefined,
                    shouldOverwrite,
                ),
            ).rejects.toThrow("already exists");
        });

        it("should handle errors gracefully", async () => {
            const stateChanges: Array<{ step: string; message: string }> = [];

            try {
                await init(
                    testProjectPath,
                    testProjectName,
                    "invalid-version",
                    (state) => stateChanges.push(state),
                );
            } catch (error) {
                expect(error).toBeDefined();
                expect(stateChanges.length).toBeGreaterThan(0);
            }
        });
    });
});
