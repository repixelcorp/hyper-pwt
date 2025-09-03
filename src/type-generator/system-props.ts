import type { GenerateTargetPlatform } from "./mendix-types";
import type { Property, PropertyGroup, SystemProperty } from "./types";

export interface SystemPropsConfig {
  hasLabel?: boolean;
  platform?: GenerateTargetPlatform;
}

export function extractSystemProperties(
  properties: PropertyGroup[] | Property[] | (Property | SystemProperty)[],
): SystemProperty[] {
  const systemProps: SystemProperty[] = [];

  for (const item of properties) {
    if (isPropertyGroup(item)) {
      for (const prop of item.properties) {
        if (isSystemProperty(prop)) {
          systemProps.push(prop);
        }
      }
    } else if (isSystemProperty(item)) {
      systemProps.push(item);
    }
  }

  return systemProps;
}

export function hasLabelProperty(systemProperties: SystemProperty[]): boolean {
  return systemProperties.some((prop) => prop.key === "Label");
}

export function generateSystemProps(config: SystemPropsConfig = {}): string[] {
  const { hasLabel = false, platform = "web" } = config;
  const props: string[] = [];

  props.push("name?: string;");

  if (platform !== "native") {
    if (!hasLabel) {
      props.push("class?: string;");
      props.push("style?: CSSProperties;");
    }
    props.push("tabIndex?: number;");
  }

  if (hasLabel) {
    props.push("id?: string;");
  }

  return props;
}

export function getSystemPropsImports(
  config: SystemPropsConfig = {},
): string[] {
  const { platform = "web" } = config;
  const imports: string[] = [];

  if (platform !== "native") {
    imports.push("CSSProperties");
  }

  return imports;
}

export function generatePreviewSystemProps(hasLabel: boolean): string[] {
  const props: string[] = [];

  if (!hasLabel) {
    props.push("/**");
    props.push(" * @deprecated Use class property instead");
    props.push(" */");
    props.push("className: string;");
    props.push("class: string;");
    props.push("style: string;");
    props.push("styleObject?: CSSProperties;");
  }

  return props;
}

function isPropertyGroup(
  item: PropertyGroup | Property | SystemProperty,
): item is PropertyGroup {
  return "caption" in item && "properties" in item;
}

function isSystemProperty(
  item: Property | SystemProperty,
): item is SystemProperty {
  return !("type" in item) && "key" in item;
}
