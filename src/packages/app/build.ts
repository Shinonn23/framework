import { Command } from "commander";

const Build = new Command().name("build").description("Manage applications").action(index)

function index() {
    console.log("Building app...");
}

Build.command("build").action(index);

export default Build
