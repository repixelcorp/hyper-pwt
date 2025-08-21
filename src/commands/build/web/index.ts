import fs from 'fs/promises';
import path from 'path';
import { InlineConfig, UserConfig, build as viteBuild } from 'vite';
import { zip } from 'zip-a-folder';

import { COLOR_ERROR, COLOR_GREEN, DIST_DIRECTORY_NAME, PROJECT_DIRECTORY, WEB_OUTPUT_DIRECTORY } from '../../../constants';
import pathIsExists from '../../../utils/pathIsExists';
import getWidgetVersion from '../../../utils/getWidgetVersion';
import showMessage from '../../../utils/showMessage';
import { getEditorConfigDefaultConfig, getEditorPreviewDefaultConfig, getViteDefaultConfig } from '../../../configurations/vite';
import getWidgetName from '../../../utils/getWidgetName';
import getWidgetPackageJson from '../../../utils/getWidgetPackageJson';
import getMendixWidgetDirectory from '../../../utils/getMendixWidgetDirectory';

const buildWebCommand = async (isProduction: boolean = false) => {
  try {
    showMessage('Remove previous builds');

    const distDir = path.join(PROJECT_DIRECTORY, DIST_DIRECTORY_NAME);
    const distIsExists = await pathIsExists(distDir);

    if (distIsExists) {
      await fs.rm(distDir, { recursive: true, force: true });
    }

    await fs.mkdir(distDir);

    showMessage('Copy resources');

    const widgetVersion = await getWidgetVersion();
    const outputDir = path.join(distDir, widgetVersion);

    await fs.mkdir(outputDir);
    await fs.mkdir(WEB_OUTPUT_DIRECTORY, { recursive: true });

    const customViteConfigPath = path.join(PROJECT_DIRECTORY, 'vite.config.ts');
    const viteConfigIsExists = await pathIsExists(customViteConfigPath);
    let resultViteConfig: UserConfig;

    if (viteConfigIsExists) {
      const userConfig: UserConfig = await import(customViteConfigPath);

      resultViteConfig = await getViteDefaultConfig(isProduction, userConfig);
    } else {
      resultViteConfig = await getViteDefaultConfig(isProduction);
    }

    const widgetName = await getWidgetName();
    const originPackageXmlPath = path.join(PROJECT_DIRECTORY, 'src/package.xml');
    const destPackageXmlPath = path.join(WEB_OUTPUT_DIRECTORY, 'package.xml');
    const originWidgetXmlPath = path.join(PROJECT_DIRECTORY, `src/${widgetName}.xml`);
    const destWidgetXmlPath = path.join(WEB_OUTPUT_DIRECTORY, `${widgetName}.xml`);

    await fs.copyFile(originPackageXmlPath, destPackageXmlPath);
    await fs.copyFile(originWidgetXmlPath, destWidgetXmlPath);

    showMessage('Start build');
    
    const editorConfigViteConfig = await getEditorConfigDefaultConfig(isProduction);
    const editorPreviewViteConfig = await getEditorPreviewDefaultConfig(isProduction);
    const viteBuildConfigs: InlineConfig[] = [
      {
        ...resultViteConfig,
        configFile: false,
        root: PROJECT_DIRECTORY
      },
      {
        ...editorConfigViteConfig,
        configFile: false,
        root: PROJECT_DIRECTORY
      },
      {
        ...editorPreviewViteConfig,
        configFile: false,
        root: PROJECT_DIRECTORY
      }
    ];

    await Promise.all(viteBuildConfigs.map(async (config) => {
      await viteBuild(config);
    }));

    showMessage('Generate mpk file');

    const packageJson = await getWidgetPackageJson();
    const packageName = packageJson.packagePath;
    const mpkFileName = `${packageName}.${widgetName}.mpk`;
    const mpkFileDestPath = path.join(outputDir, mpkFileName);
    const mendixWidgetDirectory = await getMendixWidgetDirectory();
    const mendixMpkFileDestPath = path.join(mendixWidgetDirectory, mpkFileName);

    await zip(WEB_OUTPUT_DIRECTORY, mpkFileDestPath);
    await fs.copyFile(mpkFileDestPath, mendixMpkFileDestPath);

    showMessage(`${COLOR_GREEN('Build complete.')}`);
  } catch (error) {
    showMessage(`${COLOR_ERROR('Build failed.')}\nError occurred: ${COLOR_ERROR((error as Error).message)}`);
  }
};

export default buildWebCommand;