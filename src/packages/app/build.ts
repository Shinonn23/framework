import { Command } from "commander";

const Build = new Command().name("build").description("Manage applications").action(buildApp)

function buildApp() {
    console.log("Building app...");
}

Build.command("build").action(buildApp);

export default Build
