import type { templateValues, templatePath } from "./types";
import { readFile } from "fs-extra";
import mustache from "mustache";
import { join } from "path";

// Function to replace placeholders in template
async function fillDocumentTemplate(
    templateFile: templatePath,
    values: templateValues,
): Promise<string> {
    const rawTemplate = join(__dirname, "templates", templateFile);
    const template = await readFile(rawTemplate, "utf8");
    try {
        // เรียกใช้ mustache.render แบบมาตรฐาน
        return mustache.render(template, values);
    } catch (error) {
        console.error("Error while filling template with Mustache:", error);
        throw error; // propagate error
    }
}

export { fillDocumentTemplate };
