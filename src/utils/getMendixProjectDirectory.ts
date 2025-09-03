import path from "path";

import { PROJECT_DIRECTORY } from "../constants";
import getWidgetPackageJson from "./getWidgetPackageJson";

const getMendixProjectDiectory =
  async () => {
    const packageJson =
      await getWidgetPackageJson();
    const widgetPath =
      PROJECT_DIRECTORY;

    return path.join(
      widgetPath,
      packageJson
        .config
        .projectPath,
    );
  };

export default getMendixProjectDiectory;
