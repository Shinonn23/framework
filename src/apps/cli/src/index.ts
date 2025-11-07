#!/usr/bin/env bun

import { Command } from "commander";
import app from "./commands/app";

const framework = new Command();

framework
    .name("frw")
    .description("CLI tool for Framework")
    .version("0.0.0.1-beta-1762316947");

framework.addCommand(app);

framework.parse();
