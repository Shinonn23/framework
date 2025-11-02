import type {
    templateValues as templateValuesType,
    templatePath,
} from "./types";
import { ensureDir, writeFile } from "fs-extra";
import type { Path } from "typescript";
import prettier from "prettier";
import prettier_conf from "@/root/.prettierrc.json";
import { fillDocumentTemplate } from "./template";

async function generateFile(
    template_path: templatePath,
    outputDir: Path,
    outputFileName: Path,
    templateValues: templateValuesType,
) {
    try {
        // Replace placeholders
        const filledTemplate = await fillDocumentTemplate(
            template_path,
            templateValues,
        );

        // Format with Prettier
        const formattedTemplate = await prettier.format(filledTemplate, {
            ...prettier_conf,
            parser: "typescript",
        });

        // Ensure output directory exists
        await ensureDir(outputDir);

        // Write formatted content to file
        await writeFile(outputFileName, formattedTemplate, "utf8");

        console.log("File generated and formatted:", outputFileName);
    } catch (err) {
        console.error("Error generating file:", err);
    }
}

export { generateFile };
