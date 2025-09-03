import { readFile } from "node:fs/promises";
import { generateTypeDefinition } from "./generator";
import type { GenerateTargetPlatform } from "./mendix-types";
import { parseWidgetXML } from "./parser";
import { generatePreviewTypeDefinition } from "./preview-types";

export { generateTypeDefinition } from "./generator";
export { parseWidgetXML } from "./parser";
export { generatePreviewTypeDefinition } from "./preview-types";
export type {
  Property,
  PropertyGroup,
  PropertyType,
  WidgetDefinition,
} from "./types";

export function generateTypes(
  xmlContent: string,
  target: GenerateTargetPlatform,
): string {
  const widget = parseWidgetXML(xmlContent);
  let output = generateTypeDefinition(widget, target);

  output += `\n${generatePreviewTypeDefinition(widget)}`;

  return output;
}

export async function generateTypesFromFile(
  filePath: string,
  target: GenerateTargetPlatform,
): Promise<string> {
  const xmlContent = await readFile(filePath, "utf-8");

  return generateTypes(xmlContent, target);
}
