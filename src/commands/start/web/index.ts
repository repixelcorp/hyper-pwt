import fs from 'fs/promises';
import path from 'path';
import { UserConfig, build as viteBuild } from 'vite';

import { COLOR_ERROR, PROJECT_DIRECTORY } from "../../../constants";
import showMessage from "../../../utils/showMessage";
import getViteWatchOutputDirectory from "../../../utils/getViteWatchOutputDirectory";
import pathIsExists from "../../../utils/pathIsExists";
import { getViteDefaultConfig } from '../../../configurations/vite';

const startWebCommand = async () => {
  try {
    showMessage('Ready for watch');

    const distDir = await getViteWatchOutputDirectory();
    const distIsExists = await pathIsExists(distDir);

    if (distIsExists) {
      await fs.rm(distDir, { recursive: true, force: true });
    }

    await fs.mkdir(distDir, { recursive: true });

    const customViteConfigPath = path.join(PROJECT_DIRECTORY, 'vite.config.ts');
    const viteConfigIsExists = await pathIsExists(customViteConfigPath);
    let resultViteConfig: UserConfig;

    if (viteConfigIsExists) {
      const userConfig: UserConfig = await import(customViteConfigPath);

      resultViteConfig = await getViteDefaultConfig(userConfig);
    } else {
      resultViteConfig = await getViteDefaultConfig();
    }

    showMessage('Start watch');

    await viteBuild({
      ...resultViteConfig,
      build: {
        ...resultViteConfig.build,
        outDir: distDir,
        watch: {},
      }
    })
  } catch (error) {
    showMessage(`${COLOR_ERROR('Build failed.')}\nError occurred: ${COLOR_ERROR((error as Error).message)}`);
  }
};

export default startWebCommand;