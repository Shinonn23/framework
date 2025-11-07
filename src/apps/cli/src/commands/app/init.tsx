import { Command } from "commander";
import { render } from "ink";
import { InitApp } from "./components/init";
import { InitOptions } from "./type";

const init = new Command()
    .name("init")
    .description("Initialize a new application")
    .option("--name <name>", "Name of the application")
    .option("--path <path>", "Path to create the application")
    .action(async (options: InitOptions) => {
        render(<InitApp options={options} />);
    });

export default init;
