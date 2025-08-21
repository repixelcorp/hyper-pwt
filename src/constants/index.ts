import chalk from "chalk";
import path from "path";

export const PROJECT_DIRECTORY = process.cwd();

export const CLI_DIRECTORY = path.join(PROJECT_DIRECTORY, 'node_modules/@repixelcorp/hyper-pwt');

export const WEB_OUTPUT_DIRECTORY = path.join(PROJECT_DIRECTORY, '/dist/tmp/widgets');

export const COLOR_NAME = chalk.bold.blueBright;

export const COLOR_ERROR = chalk.bold.red;