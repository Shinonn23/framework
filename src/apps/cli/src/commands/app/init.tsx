import { Command } from "commander";
import { render } from "ink";
import { InitApp } from "./components/init";
import { InitOptions } from "./type";

const init = new Command()
    .name("init")
    .description("Initialize a new application")
    .option("--name <name>", "Name of the application")
    .option("--path <path>", "Path to create the application")
    .option("--app-version <app-version>", "Version of the application")
    .option("--yes", "Skip confirmation prompt")
    .action(async (options: InitOptions) => {
        const { waitUntilExit } = render(<InitApp options={options} />);
        await waitUntilExit();
    });

export default init;
