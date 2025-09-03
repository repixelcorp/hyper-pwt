import type { AttributeType, Property } from "./types";

export interface MendixTypeMapping {
  type: string;
  imports: Set<string>;
}

export type GenerateTargetPlatform = "web" | "native";

export function getMendixImports(
  properties: Property[],
  target: GenerateTargetPlatform,
): string[] {
  const imports = new Set<string>();

  for (const property of properties) {
    const mapping = mapPropertyToMendixType(property, target);

    mapping.imports.forEach((imp) => {
      imports.add(imp);
    });
  }

  return Array.from(imports).sort();
}

export function mapPropertyToMendixType(
  property: Property,
  platform: GenerateTargetPlatform = "web",
): MendixTypeMapping {
  const imports = new Set<string>();
  let type: string;

  switch (property.type) {
    case "string":
    case "translatableString":
      type = "string";
      break;

    case "boolean":
      type = "boolean";
      break;

    case "integer":
      type = "number";
      break;

    case "decimal":
      imports.add("Big");
      type = "Big";
      break;

    case "textTemplate":
      imports.add("DynamicValue");
      if (property.dataSource) {
        imports.add("ListExpressionValue");
        type = "ListExpressionValue<string>";
      } else {
        type = "DynamicValue<string>";
      }
      break;

    case "action":
      if (property.dataSource) {
        imports.add("ListActionValue");
        type = "ListActionValue";
      } else {
        imports.add("ActionValue");
        type = "ActionValue";
      }
      break;

    case "microflow":
    case "nanoflow":
      imports.add("ActionValue");
      type = "ActionValue";
      break;

    case "attribute":
      type = mapAttributeToMendixType(property, imports);
      break;

    case "expression":
      type = mapExpressionToMendixType(property, imports);
      break;

    case "datasource":
      imports.add("ListValue");
      type = "ListValue";
      break;

    case "icon":
      imports.add("DynamicValue");
      if (platform === "native") {
        imports.add("NativeIcon");
        type = "DynamicValue<NativeIcon>";
      } else if (platform === "web") {
        imports.add("WebIcon");
        type = "DynamicValue<WebIcon>";
      } else {
        imports.add("WebIcon");
        imports.add("NativeIcon");
        type = "DynamicValue<WebIcon | NativeIcon>";
      }
      break;

    case "image":
      imports.add("DynamicValue");
      if (platform === "native") {
        imports.add("NativeImage");
        type = "DynamicValue<NativeImage>";
      } else if (platform === "web") {
        imports.add("WebImage");
        type = "DynamicValue<WebImage>";
      } else {
        imports.add("WebImage");
        imports.add("NativeImage");
        type = "DynamicValue<WebImage | NativeImage>";
      }
      break;

    case "file":
      imports.add("DynamicValue");
      imports.add("FileValue");
      type = "DynamicValue<FileValue>";
      break;

    case "widgets":
      if (property.dataSource) {
        imports.add("ListWidgetValue");
        type = "ListWidgetValue";
      } else {
        imports.add("ReactNode");
        type = "ReactNode";
      }
      break;

    case "object":
      if (property.properties && property.properties.length > 0) {
        type = generateObjectInterface(property);
      } else {
        type = "object";
      }
      break;

    case "entity":
      imports.add("ObjectItem");
      type = "ObjectItem";
      break;

    case "entityConstraint":
      type = "string";
      break;

    case "enumeration":
      if (property.enumerationValues && property.enumerationValues.length > 0) {
        type = property.enumerationValues
          .map((ev) => `"${ev.key}"`)
          .join(" | ");
      } else {
        type = "string";
      }
      break;

    case "association":
      type = mapAssociationToMendixType(property, imports);
      break;

    case "selection":
      type = mapSelectionToMendixType(property, imports);
      break;

    case "form":
      type = "string";
      break;

    default:
      type = "any";
  }

  if (property.isList && !["datasource", "widgets"].includes(property.type)) {
    type = `${type}[]`;
  }

  return {
    type,
    imports,
  };
}

function mapAttributeToMendixType(
  property: Property,
  imports: Set<string>,
): string {
  const baseType = getAttributeBaseType(property.attributeTypes || []);

  if (baseType.includes("Big")) {
    imports.add("Big");
  }

  if (property.dataSource) {
    imports.add("ListAttributeValue");

    return `ListAttributeValue<${baseType}>`;
  } else {
    imports.add("EditableValue");

    return `EditableValue<${baseType}>`;
  }
}

function mapExpressionToMendixType(
  property: Property,
  imports: Set<string>,
): string {
  const baseType = property.returnType
    ? mapReturnTypeToTS(property.returnType.type)
    : "string";

  if (baseType.includes("Big")) {
    imports.add("Big");
  }

  if (property.dataSource) {
    imports.add("ListExpressionValue");

    const typeStr = property.returnType?.isList ? `${baseType}[]` : baseType;

    return `ListExpressionValue<${typeStr}>`;
  } else {
    imports.add("DynamicValue");

    const typeStr = property.returnType?.isList ? `${baseType}[]` : baseType;

    return `DynamicValue<${typeStr}>`;
  }
}

function mapAssociationToMendixType(
  property: Property,
  imports: Set<string>,
): string {
  if (!property.associationTypes || property.associationTypes.length === 0) {
    imports.add("ObjectItem");

    return "ObjectItem";
  }

  const assocType = property.associationTypes[0];

  if (assocType === "Reference") {
    if (property.dataSource) {
      imports.add("ListReferenceValue");

      return "ListReferenceValue";
    } else {
      imports.add("ReferenceValue");

      return "ReferenceValue";
    }
  } else if (assocType === "ReferenceSet") {
    if (property.dataSource) {
      imports.add("ListReferenceSetValue");

      return "ListReferenceSetValue";
    } else {
      imports.add("ReferenceSetValue");

      return "ReferenceSetValue";
    }
  }

  imports.add("ObjectItem");

  return "ObjectItem";
}

function mapSelectionToMendixType(
  property: Property,
  imports: Set<string>,
): string {
  if (!property.selectionTypes || property.selectionTypes.length === 0) {
    imports.add("SelectionSingleValue");

    return "SelectionSingleValue";
  }

  const selectionType = property.selectionTypes[0];

  if (selectionType === "Multi") {
    imports.add("SelectionMultiValue");

    return "SelectionMultiValue";
  } else {
    imports.add("SelectionSingleValue");

    return "SelectionSingleValue";
  }
}

function getAttributeBaseType(attributeTypes: AttributeType[]): string {
  if (attributeTypes.length === 0) return "any";

  const types = attributeTypes.map((type) => {
    switch (type) {
      case "String":
      case "HashString":
      case "Enum":
        return "string";
      case "Boolean":
        return "boolean";
      case "Integer":
      case "Long":
      case "AutoNumber":
      case "Currency":
      case "Decimal":
        return "Big";
      case "Float":
        return "number";
      case "DateTime":
        return "Date";
      case "Binary":
        return "string";
      default:
        return "any";
    }
  });

  const uniqueTypes = Array.from(new Set(types));
  return uniqueTypes.length === 1 ? uniqueTypes[0] : uniqueTypes.join(" | ");
}

function mapReturnTypeToTS(returnType: string): string {
  switch (returnType) {
    case "Void":
      return "void";
    case "Boolean":
      return "boolean";
    case "Integer":
    case "Long":
    case "AutoNumber":
    case "Decimal":
      return "Big";
    case "Float":
      return "number";
    case "DateTime":
      return "Date";
    case "String":
      return "string";
    case "Object":
      return "object";
    default:
      return "any";
  }
}

function generateObjectInterface(property: Property): string {
  return `${property.key}Type`;
}

export function generateMendixImports(imports: string[]): string {
  if (imports.length === 0) return "";

  const reactImports = imports.filter((imp) => imp === "ReactNode");
  const bigJsImports = imports.filter((imp) => imp === "Big");
  const mendixImports = imports.filter(
    (imp) => imp !== "ReactNode" && imp !== "Big",
  );

  let output = "";

  if (reactImports.length > 0) {
    output += `import { ${reactImports.join(", ")} } from 'react';\n`;
  }

  if (mendixImports.length > 0) {
    output += `import { ${mendixImports.join(", ")} } from 'mendix';\n`;
  }

  if (bigJsImports.length > 0) {
    output += `import { ${bigJsImports.join(", ")} } from 'big.js';\n`;
  }

  return output;
}
