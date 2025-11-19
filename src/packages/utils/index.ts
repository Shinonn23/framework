import fs from "fs-extra";
import path from "path";

type AnyObject = { [key: string]: any };

/**
 * Recursively converts empty or whitespace-only strings to `null` within a value.
 *
 * This function traverses through the provided value and replaces any string that
 * contains only whitespace characters with `null`. It handles primitive types,
 * arrays, and plain objects recursively while preserving special object types
 * (Date, RegExp, Function, Map, Set, Promise) without modification.
 *
 * @template T - The type of the input value
 * @param value - The value to process (can be a primitive, array, or object)
 * @returns A new value of type T with empty strings replaced by null
 */
function convertEmptyStringsToNull<T>(value: T): T {
    // If it's a string and contains only whitespace → return null
    if (typeof value === "string") {
        return (value.trim() === "" ? null : value) as unknown as T;
    }

    // Skip primitive types that don't need conversion
    if (
        value === null ||
        value === undefined ||
        typeof value === "number" ||
        typeof value === "boolean" ||
        typeof value === "symbol" ||
        typeof value === "bigint"
    ) {
        return value;
    }

    // Skip special objects like Date, RegExp, Function, Map, Set, Promise
    if (
        value instanceof Date ||
        value instanceof RegExp ||
        typeof value === "function" ||
        value instanceof Map ||
        value instanceof Set ||
        typeof (value as any).then === "function" // promise-like
    ) {
        return value;
    }

    // Handle arrays recursively
    if (Array.isArray(value)) {
        return value.map((element) => convertEmptyStringsToNull(element)) as unknown as T;
    }

    // Handle plain objects recursively
    if (typeof value === "object") {
        const sourceObject = value as AnyObject;
        const result: AnyObject = Array.isArray(sourceObject) ? [] : {};
        for (const key of Object.keys(sourceObject)) {
            result[key] = convertEmptyStringsToNull(sourceObject[key]);
        }
        return result as T;
    }

    // Fallback (should not be reached)
    return value;
}
/**
 * Resolves a target path to an absolute path, handling special path formats and project naming.
 *
 * @param targetPath - The path to resolve. Can include:
 *   - `~` prefix for home directory
 *   - `.` or `./` for current directory (will append project name)
 *   - Relative or absolute paths
 * @param projectName - The name of the project to append when the path is current directory
 *
 * @returns The resolved absolute path
 *
 * @throws {Error} When home directory cannot be determined (when using `~` prefix)
 */

function resolveProjectPath(targetPath: string, projectName: string): string {
    let resolvedPath = targetPath;

    // Handle ~ for home directory
    if (resolvedPath.startsWith("~")) {
        const homeDir =
            process.platform === "win32"
                ? process.env.USERPROFILE
                : process.env.HOME;

        if (!homeDir) {
            throw new Error("Unable to determine home directory");
        }

        resolvedPath = path.join(homeDir, resolvedPath.slice(1));
    }

    // Normalize the path
    const normalized = path.normalize(resolvedPath);

    // If path is just './' or '.', append project name
    if (normalized === "." || normalized === "./") {
        resolvedPath = `./${projectName}`;
    }

    // Resolve to absolute path
    const fullPath = path.isAbsolute(resolvedPath)
        ? path.resolve(resolvedPath)
        : path.resolve(process.cwd(), resolvedPath);

    return fullPath;
}

/**
 * Checks if a directory exists at the specified path.
 *
 * @param dirPath - The path to the directory to check
 * @returns A promise that resolves to `true` if the directory exists, `false` otherwise
 *
 * @example
 * ```typescript
 * const exists = await checkDirectoryExists('/path/to/directory');
 * if (exists) {
 *   console.log('Directory exists');
 * }
 * ```
 */
async function checkDirectoryExists(dirPath: string): Promise<boolean> {
    try {
        const stats = await fs.stat(dirPath);
        return stats.isDirectory();
    } catch {
        return false;
    }
}

export { convertEmptyStringsToNull, resolveProjectPath, checkDirectoryExists };
