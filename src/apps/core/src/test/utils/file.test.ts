import { writeFile, readFile, ensureDir } from "fs-extra";
import path from "path";
// import prettier from "prettier";

// Values to replace in template
const templateValues = {
    YEAR: "2025",
    CONTRIBUTORS: "Siwat Sroisuwan",
    LICENSE: "MIT",
    DoctypeName: "StockItems",
};

// Paths
const templateFile = path.join(__dirname, "templates", "doctype_ts.txt");
const outputDir = path.join(__dirname, "generated");
const outputFile = path.join(outputDir, `${templateValues.DoctypeName}.ts`);

// Function to replace placeholders in template
function fillTemplate(
    template: string,
    values: Record<string, string>,
): string {
    try {
        return template.replace(
            /\{(\w+)\}/g,
            (_, key) => values[key] ?? `{${key}}`,
        );
    } catch (err) {
        console.error("Error while filling template:", err);
        throw err; // propagate error
    }
}
async function generateFile() {
    try {
        // Read template content
        const template = await readFile(templateFile, "utf8");

        // Replace placeholders
        const filledTemplate = fillTemplate(template, templateValues);

        // Format with Prettier
        // const formattedTemplate = prettier.format(filledTemplate, { parser: "typescript" });

        // Ensure output directory exists
        await ensureDir(outputDir);

        // Write formatted content to file
        await writeFile(outputFile, filledTemplate, "utf8");

        console.log("File generated and formatted:", outputFile);
    } catch (err) {
        console.error("Error generating file:", err);
    }
}

generateFile();
