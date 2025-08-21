#!/usr/bin/env node

import { program } from "commander";

import packageJson from "../package.json";
import buildWebCommand from "./commands/build/web";
import startWebCommand from "./commands/start/web";

program.version(packageJson.version, '-v, --version', 'display current version');

program
  .command('build:web')
  .summary('build web widget')
  .action(buildWebCommand);

program
  .command('start:web')
  .summary('start web widget live reload')
  .action(startWebCommand);

program.parse();