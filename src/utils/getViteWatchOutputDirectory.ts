import path from "path";

import { DIST_DIRECTORY_NAME, PROJECT_DIRECTORY } from "../constants";
import getWidgetPackageJson from "./getWidgetPackageJson";

const getViteWatchOutputDirectory = async (): Promise<string> => {
  const packageJson = await getWidgetPackageJson();
  const packagePath = packageJson.packagePath;
  const widgetName = packageJson.widgetName;
  const packageDirectories = packagePath.split('.');
  const outputDir = path.join(
    PROJECT_DIRECTORY, 
    packageJson.config.projectPath, 
    'deployment/web/widgets', 
    ...packageDirectories, 
    widgetName.toLowerCase()
  );

  return outputDir;
};

export default getViteWatchOutputDirectory;