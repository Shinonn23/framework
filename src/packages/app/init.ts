import fs from "fs-extra";
import { execSync } from "child_process";
import path from "path";
import { StateCallback } from "./type";
import {
    resolveProjectPath,
    checkDirectoryExists,
} from "../utils";

/**
 * Initializes a new project by creating a directory, setting up a template, and updating the package.json file.
 *
 * @param targetPath - The target directory path where the project will be created. If null, the current working directory is used.
 * @param name - The name of the project. Defaults to "my-app" if not provided.
 * @param version - The version of the template to use. Defaults to "main" if not provided.
 * @param onStateChange - Optional callback function to track the current state of the initialization process.
 * @param shouldOverwrite - Optional callback to ask user if they want to overwrite existing directory. Returns true to overwrite, false to cancel.
 *
 * @returns A promise that resolves to an object containing:
 * - `success`: A boolean indicating whether the project was created successfully.
 * - `path`: The full path to the created project.
 * - `name`: The name of the created project.
 *
 * @throws Will throw an error if the project creation fails, such as when the `bun create` command fails or the `package.json` file is not found.
 *
 * @example
 * ```typescript
 * const result = await init(null, "example-app", "1.0.0", (state) => {
 *   console.log(`Current step: ${state.step} - ${state.message}`);
 * });
 * console.log(result);
 * ```
 */

async function initNewProject(
    targetPath: string | null,
    name: string | null,
    version: string | null,
    onStateChange?: StateCallback,
    shouldOverwrite?: () => Promise<boolean>,
) {
    try {
        // Validate input
        onStateChange?.({
            step: "validating",
            message: "Validating input...",
        });

        // Use default values if not provided
        const projectPath =
            targetPath === "" || targetPath === null ? "./" : targetPath;
        const projectName = name === "" || name === null ? "my-app" : name;
        const templateVersion =
            version === "" || version === null ? "dev" : version;

        // Create the project path
        onStateChange?.({
            step: "creating_path",
            message: "Creating project path...",
        });

        // Resolve the full path (handles ./ to append project name)
        const fullPath = resolveProjectPath(projectPath, projectName);

        // Check if directory already exists
        const dirExists = await checkDirectoryExists(fullPath);
        if (dirExists) {
            // Ask user if they want to overwrite
            const overwrite = shouldOverwrite ? await shouldOverwrite() : false;

            if (!overwrite) {
                throw new Error(
                    `Directory ${fullPath} already exists. Operation cancelled.`,
                );
            }

            // Remove existing directory
            await fs.remove(fullPath);
        }

        // Clone the template from GitHub
        onStateChange?.({
            step: "cloning_template",
            message: "Cloning template from GitHub...",
        });

        const templateUrl = `https://github.com/Shinonn23/framework-template.git`;
        const cloneCommand = `git clone --branch ${templateVersion} --depth 1 ${templateUrl} "${fullPath}"`;

        execSync(cloneCommand, { stdio: "ignore" });

        // Install dependencies
        onStateChange?.({
            step: "installing_dependencies",
            message: "Installing dependencies...",
        });

        execSync("bun install", { cwd: fullPath, stdio: "inherit" });

        const gitPath = path.join(fullPath, ".git");
        await fs.remove(gitPath);

        execSync("git init", { cwd: fullPath, stdio: "ignore" });
        execSync("git checkout -b dev", { cwd: fullPath, stdio: "ignore" });

        // Read the package.json file
        onStateChange?.({
            step: "updating_package",
            message: "Updating package.json...",
        });

        const packageJsonPath = path.join(fullPath, "package.json");

        if (!(await fs.pathExists(packageJsonPath))) {
            throw new Error(`package.json not found at ${packageJsonPath}`);
        }

        const packageJson = await fs.readJson(packageJsonPath);

        // Update the name and version
        packageJson.name = projectName;
        if (version) {
            packageJson.version = version;
        }

        // Save the updated package.json file
        await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

        // Complete
        onStateChange?.({
            step: "completed",
            message: `Project creation completed successfully at ${fullPath}`,
        });

        return {
            success: true,
            path: fullPath,
            name: projectName,
        };
    } catch (error) {
        onStateChange?.({
            step: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "An unknown error occurred.",
        });
        throw error;
    }
}

export { initNewProject };
