import type {
  AttributeType,
  Property,
} from './types';
import type { GenerateTargetPlatform } from './mendix-types';
import { mapPropertyToMendixType } from './mendix-types';

export function mapPropertyTypeToTS(property: Property, target?: GenerateTargetPlatform): string {
  const mapping = mapPropertyToMendixType(property, target);

  return mapping.type;
}

export function mapAttributeTypeToTS(attributeType: AttributeType): string {
  switch (attributeType) {
    case 'String':
    case 'HashString':
    case 'Enum':
      return 'string';
    case 'Boolean':
      return 'boolean';
    case 'Integer':
    case 'Long':
    case 'AutoNumber':
    case 'Float':
    case 'Currency':
    case 'Decimal':
      return 'number';

    case 'DateTime':
      return 'Date | string';

    case 'Binary':
      return 'Blob | string';

    default:
      return 'any';
  }
}

export function mapReturnTypeToTS(returnType: string): string {
  switch (returnType) {
    case 'Void':
      return 'void';
    case 'Boolean':
      return 'boolean';
    case 'Integer':
    case 'Float':
    case 'Decimal':
      return 'number';
    case 'DateTime':
      return 'Date | string';
    case 'String':
      return 'string';
    case 'Object':
      return 'object';
    default:
      return 'any';
  }
}

export function ensureArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function pascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

export function sanitizePropertyKey(key: string): string {
  if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) {
    return key;
  }
  return `'${key}'`;
}

export function formatDescription(description: string): string {
  return description
    .trim()
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join(' ');
}