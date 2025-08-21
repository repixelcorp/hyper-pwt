import chalk from "chalk";
import path from "path";

export const PROJECT_DIRECTORY = process.cwd();

export const CLI_DIRECTORY = path.join(PROJECT_DIRECTORY, 'node_modules/@repixelcorp/hyper-pwt');

export const DIST_DIRECTORY_NAME = 'dist';

export const WEB_OUTPUT_DIRECTORY = path.join(PROJECT_DIRECTORY, `/${DIST_DIRECTORY_NAME}/tmp/widgets`);

export const COLOR_NAME = chalk.bold.blueBright;

export const COLOR_ERROR = chalk.bold.red;

export const COLOR_GREEN = chalk.bold.greenBright;