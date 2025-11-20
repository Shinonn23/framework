import fs from "fs";
import path from "path";
import ignore from "ignore";

const OUTPUT_FILE = path.resolve(process.cwd(), "output.tree");

// -------------------------------------------------------------
// Load .gitignore patterns
// -------------------------------------------------------------
function loadGitignore(root: string) {
    const gitignorePath = path.join(root, ".gitignore");
    const ig = ignore();

    if (fs.existsSync(gitignorePath)) {
        const content = fs.readFileSync(gitignorePath, "utf8");
        ig.add(content.split("\n"));
    }

    ig.add([
        ".git",
        ".next",
        ".swc",
        "node_modules",
        ".gitignore",
        "**/prisma/generated/**",
        "**/prisma/migrations/**"
    ]); // Add prisma

    return ig;
}

// -------------------------------------------------------------
// Recursively build tree (respecting .gitignore)
// -------------------------------------------------------------
function buildTree(
    dir: string,
    ig: ReturnType<typeof ignore>,
    baseDir: string = dir,
): Record<string, any> {
    const tree: Record<string, any> = {};

    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
        const relativePath = path.relative(baseDir, path.join(dir, item.name));

        if (ig.ignores(relativePath.replace(/\\/g, "/"))) {
            continue;
        }

        if (item.isDirectory()) {
            tree[item.name] = buildTree(path.join(dir, item.name), ig, baseDir);
        } else {
            tree[item.name] = {};
        }
    }

    return tree;
}

// -------------------------------------------------------------
// Render tree into text
// -------------------------------------------------------------
function renderTree(node: Record<string, any>, prefix = ""): string[] {
    const lines: string[] = [];
    const keys = Object.keys(node).sort();
    const last = keys[keys.length - 1];

    for (const key of keys) {
        const connector = key === last ? "└── " : "├── ";
        lines.push(prefix + connector + key);

        const child = node[key];
        if (child && Object.keys(child).length > 0) {
            const nextPrefix = key === last ? prefix + "    " : prefix + "│   ";
            lines.push(...renderTree(child, nextPrefix));
        }
    }

    return lines;
}

// -------------------------------------------------------------
// Main
// -------------------------------------------------------------
function main() {
    const root = process.cwd();
    const ig = loadGitignore(root);

    const tree = buildTree(root, ig);

    const outputText = renderTree(tree).join("\n");
    fs.writeFileSync(OUTPUT_FILE, outputText, "utf8");

    console.log(`Tree generated → ${OUTPUT_FILE}`);
}

main();
