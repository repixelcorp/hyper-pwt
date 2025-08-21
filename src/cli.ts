import { program } from "commander";

import packageJson from "../package.json";
import buildCommand from "./commands/build";

program.version(packageJson.version, '-v, --version', 'display current version');

program
  .command('build')
  .summary('build widget')
  .action(buildCommand);

program.parse();