import type {
  WidgetDefinition,
  Property,
  PropertyGroup,
  SystemProperty,
} from "./types";
import {
  pascalCase,
  sanitizePropertyKey,
  formatDescription,
} from "./utils";
import {
  extractSystemProperties,
  hasLabelProperty,
  generatePreviewSystemProps,
} from "./system-props";

export function generatePreviewTypeDefinition(
  widget: WidgetDefinition,
): string {
  const interfaceName = `${pascalCase(widget.name)}PreviewProps`;
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
    generatePreviewImports();
  output +=
    generatePreviewJSDoc(
      widget,
    );
  output += `export interface ${interfaceName} {\n`;
  output +=
    "  /**\n";
  output +=
    "   * Whether the widget is in read-only mode\n";
  output +=
    "   */\n";
  output +=
    "  readOnly: boolean;\n";
  output +=
    "  /**\n";
  output +=
    "   * The render mode of the widget preview\n";
  output +=
    "   */\n";
  output +=
    '  renderMode?: "design" | "xray" | "structure";\n';

  const systemPropsLines =
    generatePreviewSystemProps(
      hasLabel,
    );

  for (const line of systemPropsLines) {
    output +=
      "  " +
      line +
      "\n";
  }

  for (const property of widgetProperties) {
    output +=
      generatePreviewPropertyDefinition(
        property,
      );
  }

  output += "}\n";

  return output;
}

function generatePreviewImports(): string {
  const imports: string[] =
    [];

  imports.push(
    "CSSProperties",
  );
  imports.push(
    "PreviewValue",
  );

  let output = "";

  if (
    imports.length >
    0
  ) {
    output += `import type { ${imports.join(", ")} } from 'react';\n\n`;
  }

  return output;
}

function generatePreviewJSDoc(
  widget: WidgetDefinition,
): string {
  let jsDoc =
    "/**\n";
  jsDoc += ` * Preview props for ${widget.name}\n`;

  if (
    widget.description
  ) {
    jsDoc += ` * ${formatDescription(widget.description)}\n`;
  }

  jsDoc +=
    " * @preview This interface is used in design mode\n";
  jsDoc += " */\n";
  return jsDoc;
}

function generatePreviewPropertyDefinition(
  property: Property,
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
    mapPropertyToPreviewType(
      property,
    );

  output += `${indent}${propertyKey}${optional}: ${propertyType};\n`;

  return output;
}

function mapPropertyToPreviewType(
  property: Property,
): string {
  const {
    type,
    isList,
    enumerationValues,
  } = property;

  let baseType: string;

  switch (type) {
    case "string":
    case "translatableString":
      baseType =
        "string";
      break;

    case "boolean":
      baseType =
        "boolean";
      break;

    case "integer":
    case "decimal":
      baseType =
        "number";
      break;

    case "action":
    case "microflow":
    case "nanoflow":
      baseType =
        "{} | null";
      break;

    case "attribute":
    case "expression":
    case "entityConstraint":
      baseType =
        "string";
      break;

    case "textTemplate":
      baseType =
        "string";
      break;

    case "datasource":
      baseType =
        "{ type: string } | { caption: string } | {}";
      break;

    case "icon":
    case "image":
    case "file":
      baseType =
        "{ uri: string } | null";
      break;

    case "widgets":
      baseType =
        "PreviewValue | null";
      break;

    case "enumeration":
      if (
        enumerationValues &&
        enumerationValues.length >
          0
      ) {
        baseType =
          enumerationValues
            .map(
              (
                ev,
              ) =>
                `"${ev.key}"`,
            )
            .join(
              " | ",
            );
      } else {
        baseType =
          "string";
      }
      break;

    case "object":
      if (
        property.properties &&
        property
          .properties
          .length >
          0
      ) {
        baseType = `${pascalCase(property.key)}PreviewType`;
      } else {
        baseType =
          "object";
      }
      break;

    case "entity":
    case "association":
    case "selection":
      baseType =
        "string";
      break;

    case "form":
      baseType =
        "string";
      break;

    default:
      baseType =
        "any";
  }

  return isList &&
    type !==
      "datasource"
    ? `${baseType}[]`
    : baseType;
}

function extractAllProperties(
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
