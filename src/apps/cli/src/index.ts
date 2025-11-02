import { Command } from "commander";

import { generateCommand } from "./commands/generate.tsx";
import { migrateCommand } from "./commands/migrate.tsx";

const program = new Command();

program.name("myapp").description("CLI tool for My App").version("1.0.0");

program
    .command("generate")
    .description("Generate code from templates")
    .argument("[type]", "Type of code to generate")
    .action(generateCommand);

program
    .command("migrate")
    .description("Run database migrations")
    .action(migrateCommand);

program.parse();
