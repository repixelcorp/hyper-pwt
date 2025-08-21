import path from "path";

import { PROJECT_DIRECTORY } from "../constants";
import getWidgetPackageJson from "./getWidgetPackageJson";

const getViteOutputDirectory = async (): Promise<string> => {
  const packageJson = await getWidgetPackageJson();
  const packagePath = packageJson.packagePath;
  const widgetName = packageJson.widgetName;
  const packageDirectories = packagePath.split('.');
  const outputDir = path.join(PROJECT_DIRECTORY, '/dist/tmp/widgets', ...packageDirectories, widgetName.toLowerCase(), widgetName);

  return outputDir;
};

export default getViteOutputDirectory;