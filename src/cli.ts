#!/usr/bin/env node

import { program } from "commander";

import packageJson from "../package.json";
import buildWebCommand from "./commands/build/web";
import showMessage from "./utils/showMessage";
import { COLOR_ERROR } from "./constants";

try {
  program.version(packageJson.version, '-v, --version', 'display current version');

  program
    .command('build:web')
    .summary('build web widget')
    .action(buildWebCommand);

  program.parse();
} catch (error) {
  showMessage(`Error occurred: ${COLOR_ERROR((error as Error).message)}`);
}