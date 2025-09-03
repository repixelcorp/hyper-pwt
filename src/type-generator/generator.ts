import type {
  WidgetDefinition,
  Property,
  PropertyGroup,
  SystemProperty,
} from "./types";
import type { GenerateTargetPlatform } from "./mendix-types";
import {
  mapPropertyTypeToTS,
  pascalCase,
  sanitizePropertyKey,
  formatDescription,
} from "./utils";
import {
  getMendixImports,
  generateMendixImports,
} from "./mendix-types";
import {
  extractSystemProperties,
  hasLabelProperty,
  generateSystemProps,
  getSystemPropsImports,
} from "./system-props";
import { generateHeaderComment } from "./header";

export function generateTypeDefinition(
  widget: WidgetDefinition,
  target: GenerateTargetPlatform,
): string {
  const interfaceName =
    generateInterfaceName(
      widget.name,
    );
  const properties =
    extractAllProperties(
      widget.properties,
    );
  const systemProps =
    extractSystemProperties(
      widget.properties,
    );
  const hasLabel =
    hasLabelProperty(
      systemProps,
    );
  const widgetProperties =
    properties.filter(
      (p) =>
        !isSystemProperty(
          p,
        ),
    ) as Property[];

  let output = "";

  output +=
    generateHeaderComment();

  const imports =
    getMendixImports(
      widgetProperties,
      target,
    );
  const systemImports =
    getSystemPropsImports(
      {
        hasLabel,
        platform:
          target,
      },
    );
  const allImports =
    [
      ...imports,
      ...systemImports,
    ];
  const importStatements =
    generateMendixImports(
      allImports,
    );

  if (
    importStatements
  ) {
    output +=
      importStatements +
      "\n";
  }

  output +=
    generateJSDoc(
      widget,
    );
  output += `export interface ${interfaceName} {\n`;

  const systemPropsLines =
    generateSystemProps(
      {
        hasLabel,
        platform:
          target,
      },
    );

  for (const line of systemPropsLines) {
    output += `  ${line}\n`;
  }

  if (
    systemPropsLines.length >
      0 &&
    widgetProperties.length >
      0
  ) {
    output += `\n  // Widget properties\n`;
  }

  for (const property of widgetProperties) {
    output +=
      generatePropertyDefinition(
        property,
        target,
      );
  }

  output += "}\n";

  return output;
}

function generateInterfaceName(
  widgetName: string,
): string {
  return `${pascalCase(widgetName)}ContainerProps`;
}

export function extractAllProperties(
  properties:
    | PropertyGroup[]
    | Property[],
): (
  | Property
  | SystemProperty
)[] {
  const result: (
    | Property
    | SystemProperty
  )[] = [];

  for (const item of properties) {
    if (
      isPropertyGroup(
        item,
      )
    ) {
      result.push(
        ...item.properties,
      );
    } else {
      result.push(
        item,
      );
    }
  }

  return result;
}

function isPropertyGroup(
  item:
    | PropertyGroup
    | Property
    | SystemProperty,
): item is PropertyGroup {
  return (
    "caption" in
      item &&
    "properties" in
      item
  );
}

function isSystemProperty(
  item:
    | Property
    | SystemProperty,
): item is SystemProperty {
  return (
    !(
      "type" in item
    ) &&
    "key" in item
  );
}

function generateJSDoc(
  widget: WidgetDefinition,
): string {
  let jsDoc =
    "/**\n";
  jsDoc += ` * Props for ${widget.name}\n`;

  if (
    widget.description
  ) {
    jsDoc += ` * ${formatDescription(widget.description)}\n`;
  }

  if (
    widget.needsEntityContext
  ) {
    jsDoc += ` * @needsEntityContext true\n`;
  }

  if (
    widget.supportedPlatform &&
    widget.supportedPlatform !==
      "Web"
  ) {
    jsDoc += ` * @platform ${widget.supportedPlatform}\n`;
  }

  jsDoc += " */\n";
  return jsDoc;
}

function generatePropertyDefinition(
  property: Property,
  target: GenerateTargetPlatform,
): string {
  const indent =
    "  ";
  let output = "";

  if (
    property.description
  ) {
    output += `${indent}/**\n`;
    output += `${indent} * ${formatDescription(property.description)}\n`;

    if (
      property.caption &&
      property.caption !==
        property.description
    ) {
      output += `${indent} * @caption ${property.caption}\n`;
    }

    if (
      property.defaultValue !==
        undefined &&
      property.defaultValue !==
        ""
    ) {
      output += `${indent} * @default ${property.defaultValue}\n`;
    }

    if (
      property.type ===
        "attribute" &&
      property.attributeTypes
    ) {
      output += `${indent} * @attributeTypes ${property.attributeTypes.join(", ")}\n`;
    }

    if (
      property.type ===
        "enumeration" &&
      property.enumerationValues
    ) {
      const values =
        property.enumerationValues
          .map(
            (ev) =>
              ev.key,
          )
          .join(
            ", ",
          );
      output += `${indent} * @enum {${values}}\n`;
    }

    output += `${indent} */\n`;
  }

  const propertyKey =
    sanitizePropertyKey(
      property.key,
    );
  const optional =
    property.required ===
    false
      ? "?"
      : "";
  const propertyType =
    mapPropertyTypeToTS(
      property,
      target,
    );

  output += `${indent}${propertyKey}${optional}: ${propertyType};\n`;

  return output;
}
