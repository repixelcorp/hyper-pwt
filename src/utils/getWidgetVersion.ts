import fs from 'fs/promises';
import path from 'path';

import { PROJECT_DIRECTORY } from '../constants';
import { WidgetPackageJson } from '../types';

const getWidgetVersion = async (): Promise<string> => {
  try {
    const packageJsonPath = path.join(PROJECT_DIRECTORY, 'package.json');
    const packageJsonFile = await fs.readFile(packageJsonPath, 'utf-8');
    const packageJsonData: WidgetPackageJson = JSON.parse(packageJsonFile);

    if (!packageJsonData.version) {
      throw new Error('widget version is missing, please check your package.json file.');
    }

    return packageJsonData.version;
  } catch (error) {
    throw new Error('package.json file is not exists.');
  }
};

export default getWidgetVersion;