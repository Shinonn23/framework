import { Command } from "commander";
import Build from "./build";
import Init from "./init";

const App = new Command().name("app").description("Manage applications");

App.addCommand(Build);
App.addCommand(Init);

export default App;
