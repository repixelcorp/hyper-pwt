import getWidgetPackageJson from "./getWidgetPackageJson";

const getWidgetName =
  async (): Promise<string> => {
    const widgetPackageJson =
      await getWidgetPackageJson();

    if (
      !widgetPackageJson.widgetName
    ) {
      throw new Error(
        "widget name is missing, please check your package.json file.",
      );
    }

    return widgetPackageJson.widgetName;
  };

export default getWidgetName;
