import { XMLParser } from "fast-xml-parser";
import type {
  AssociationType,
  AttributeType,
  EnumerationValue,
  ParsedXMLAssociationType,
  ParsedXMLAttributeType,
  ParsedXMLEnumerationValue,
  ParsedXMLProperty,
  ParsedXMLPropertyGroup,
  ParsedXMLSelectionType,
  ParsedXMLSystemProperty,
  ParsedXMLWidget,
  Property,
  PropertyGroup,
  SelectionType,
  SystemProperty,
  WidgetDefinition,
} from "./types";
import { ensureArray } from "./utils";

const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: "",
  textNodeName: "_",
  parseAttributeValue: false,
  trimValues: true,
  parseTrueNumberOnly: false,
  parseTagValue: false,
  allowBooleanAttributes: true,
};

export function parseWidgetXML(xmlContent: string): WidgetDefinition {
  const parser = new XMLParser(parserOptions);
  const parsedXML = parser.parse(xmlContent) as ParsedXMLWidget;

  if (!parsedXML.widget) {
    throw new Error("Invalid widget XML: missing widget element");
  }

  const widget = parsedXML.widget;

  const widgetDef: WidgetDefinition = {
    id: widget.id,
    name: widget.name,
    description: widget.description,
    needsEntityContext: widget.needsEntityContext === "true",
    pluginWidget: widget.pluginWidget === "true",
    offlineCapable: widget.offlineCapable === "true",
    supportedPlatform:
      (widget.supportedPlatform as "All" | "Native" | "Web") || "Web",
    properties: [],
  };

  if (widget.properties) {
    widgetDef.properties = parseProperties(widget.properties);
  }

  return widgetDef;
}

function parseProperties(props): PropertyGroup[] | Property[] {
  if (props.propertyGroup) {
    const groups = ensureArray(props.propertyGroup);

    return groups.map((group) => parsePropertyGroup(group));
  }

  const properties: Property[] = [];

  if (props.property) {
    const propsArray = ensureArray(props.property);

    for (const prop of propsArray) {
      properties.push(parseProperty(prop));
    }
  }

  return properties;
}

function parsePropertyGroup(group: ParsedXMLPropertyGroup): PropertyGroup {
  const properties: (Property | SystemProperty)[] = [];

  if (group.property) {
    const props = ensureArray(group.property);
    for (const prop of props) {
      properties.push(parseProperty(prop));
    }
  }

  if (group.systemProperty) {
    const sysProps = ensureArray(group.systemProperty);
    for (const sysProp of sysProps) {
      properties.push(parseSystemProperty(sysProp));
    }
  }

  return {
    caption: group.caption,
    properties,
  };
}

function parseProperty(prop: ParsedXMLProperty): Property {
  const property: Property = {
    key: prop.key,
    type: prop.type,
    caption: prop.caption || "",
    description: prop.description || "",
    required: prop.required !== "false",
    isList: prop.isList === "true",
  };

  if (prop.defaultValue !== undefined) {
    property.defaultValue = prop.defaultValue;
  }

  if (prop.onChange) {
    property.onChange = prop.onChange;
  }

  if (prop.dataSource) {
    property.dataSource = prop.dataSource;
  }

  if (prop.attributeTypes) {
    property.attributeTypes = parseAttributeTypes(prop.attributeTypes);
  }

  if (prop.associationTypes) {
    property.associationTypes = parseAssociationTypes(prop.associationTypes);
  }

  if (prop.selectionTypes) {
    property.selectionTypes = parseSelectionTypes(prop.selectionTypes);
  }

  if (prop.enumerationValues) {
    property.enumerationValues = parseEnumerationValues(prop.enumerationValues);
  }

  if (prop.properties) {
    const parsedProps = parseProperties(prop.properties);
    property.properties = parsedProps.filter(
      (p) => !("caption" in p && "properties" in p),
    ) as Property[];
  }

  if (prop.returnType) {
    property.returnType = {
      type: prop.returnType.type as "String",
      isList: prop.returnType.isList === "true",
    };
  }

  return property;
}

function parseSystemProperty(sysProp: ParsedXMLSystemProperty): SystemProperty {
  const systemProperty: SystemProperty = {
    key: sysProp.key,
  };

  if (sysProp.category) {
    systemProperty.category = sysProp.category;
  }

  return systemProperty;
}

function parseAttributeTypes(attributeTypes: {
  attributeType: ParsedXMLAttributeType | ParsedXMLAttributeType[];
}): AttributeType[] {
  const types = ensureArray(attributeTypes.attributeType);

  return types.map((type) => type.name);
}

function parseAssociationTypes(associationTypes: {
  associationType: ParsedXMLAssociationType | ParsedXMLAssociationType[];
}): AssociationType[] {
  const types = ensureArray(associationTypes.associationType);

  return types.map((type) => type.name);
}

function parseSelectionTypes(selectionTypes: {
  selectionType: ParsedXMLSelectionType | ParsedXMLSelectionType[];
}): SelectionType[] {
  const types = ensureArray(selectionTypes.selectionType);

  return types.map((type) => type.name);
}

function parseEnumerationValues(enumerationValues: {
  enumerationValue: ParsedXMLEnumerationValue | ParsedXMLEnumerationValue[];
}): EnumerationValue[] {
  const values = ensureArray(enumerationValues.enumerationValue);

  return values.map((value) => ({
    key: value.key,
    value: value._ || value.key,
  }));
}
