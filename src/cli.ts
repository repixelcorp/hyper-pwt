#!/usr/bin/env node

import { program } from "commander";

import packageJson from "../package.json";
import buildWebCommand from "./commands/build/web";

program.version(packageJson.version, '-v, --version', 'display current version');

program
  .command('build:web')
  .summary('build web widget')
  .action(buildWebCommand);

program.parse();