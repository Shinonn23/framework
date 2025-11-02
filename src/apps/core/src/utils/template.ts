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
    } catch (err) {
        console.error("Error while filling template with Mustache:", err);
        throw err; // propagate error
    }
}

export { fillDocumentTemplate };
