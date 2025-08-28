export interface WidgetDefinition {
  id: string;
  name: string;
  description: string;
  needsEntityContext?: boolean;
  pluginWidget?: boolean;
  offlineCapable?: boolean;
  supportedPlatform?: 'All' | 'Native' | 'Web';
  properties: PropertyGroup[] | Property[];
}

export interface PropertyGroup {
  caption: string;
  properties: (Property | SystemProperty)[];
}

export interface Property {
  key: string;
  type: PropertyType;
  caption: string;
  description: string;
  required?: boolean;
  isList?: boolean;
  defaultValue?: string;
  attributeTypes?: AttributeType[];
  associationTypes?: AssociationType[];
  selectionTypes?: SelectionType[];
  enumerationValues?: EnumerationValue[];
  properties?: Property[];
  returnType?: ReturnType;
  onChange?: string;
  dataSource?: string;
}

export interface SystemProperty {
  key: SystemPropertyKey;
  category?: string;
}

export type PropertyType =
  | 'action'
  | 'association'
  | 'attribute'
  | 'boolean'
  | 'datasource'
  | 'decimal'
  | 'entity'
  | 'entityConstraint'
  | 'enumeration'
  | 'expression'
  | 'file'
  | 'form'
  | 'icon'
  | 'image'
  | 'integer'
  | 'microflow'
  | 'nanoflow'
  | 'object'
  | 'selection'
  | 'string'
  | 'translatableString'
  | 'textTemplate'
  | 'widgets';

export type AttributeType =
  | 'AutoNumber'
  | 'Binary'
  | 'Boolean'
  | 'Currency'
  | 'DateTime'
  | 'Enum'
  | 'Float'
  | 'HashString'
  | 'Integer'
  | 'Long'
  | 'String'
  | 'Decimal';

export type AssociationType = 'Reference' | 'ReferenceSet';

export type SelectionType = 'None' | 'Single' | 'Multi';

export type SystemPropertyKey =
  | 'Label'
  | 'Name'
  | 'TabIndex'
  | 'Editability'
  | 'Visibility';

export interface EnumerationValue {
  key: string;
  value: string;
}

export interface ReturnType {
  type: 'Void' | 'Boolean' | 'Integer' | 'Float' | 'DateTime' | 'String' | 'Object' | 'Decimal';
  isList?: boolean;
}

export interface ParsedXMLWidget {
  widget: {
    id: string;
    pluginWidget?: string;
    needsEntityContext?: string;
    offlineCapable?: string;
    supportedPlatform?: string;
    name: string;
    description: string;
    properties: ParsedXMLProperties;
  };
}

export interface ParsedXMLProperties {
  property?: ParsedXMLProperty | ParsedXMLProperty[];
  propertyGroup?: ParsedXMLPropertyGroup | ParsedXMLPropertyGroup[];
  systemProperty?: ParsedXMLSystemProperty | ParsedXMLSystemProperty[];
}

export interface ParsedXMLPropertyGroup {
  caption: string;
  property?: ParsedXMLProperty | ParsedXMLProperty[];
  systemProperty?: ParsedXMLSystemProperty | ParsedXMLSystemProperty[];
}

export interface ParsedXMLProperty {
  key: string;
  type: PropertyType;
  required?: string;
  isList?: string;
  defaultValue?: string;
  onChange?: string;
  dataSource?: string;
  caption: string;
  description: string;
  attributeTypes?: {
    attributeType: ParsedXMLAttributeType | ParsedXMLAttributeType[];
  };
  associationTypes?: {
    associationType: ParsedXMLAssociationType | ParsedXMLAssociationType[];
  };
  selectionTypes?: {
    selectionType: ParsedXMLSelectionType | ParsedXMLSelectionType[];
  };
  enumerationValues?: {
    enumerationValue: ParsedXMLEnumerationValue | ParsedXMLEnumerationValue[];
  };
  properties?: ParsedXMLProperties;
  returnType?: {
    type: string;
    isList?: string;
  };
}

export interface ParsedXMLSystemProperty {
  key: SystemPropertyKey;
  category?: string;
}

export interface ParsedXMLAttributeType {
  name: AttributeType;
}

export interface ParsedXMLAssociationType {
  name: AssociationType;
}

export interface ParsedXMLSelectionType {
  name: SelectionType;
}

export interface ParsedXMLEnumerationValue {
  _: string;
  key: string;
}