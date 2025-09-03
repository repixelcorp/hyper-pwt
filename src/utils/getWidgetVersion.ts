import getWidgetPackageJson from "./getWidgetPackageJson";

const getWidgetVersion =
  async (): Promise<string> => {
    const widgetPackageJson =
      await getWidgetPackageJson();

    if (
      !widgetPackageJson.version
    ) {
      throw new Error(
        "widget version is missing, please check your package.json file.",
      );
    }

    return widgetPackageJson.version;
  };

export default getWidgetVersion;
