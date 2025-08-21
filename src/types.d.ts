import { PackageJson } from "type-fest";

type WidgetConfig = {
  projectPath: string;
  mendixHost: string;
  developmentPort: number;
}

export type WidgetPackageJson = PackageJson & {
  widgetName: string;
  config: WidgetConfig;
  packagePath: string;
};