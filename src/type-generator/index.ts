import { readFile } from "fs/promises";
import { parseWidgetXML } from "./parser";
import { generateTypeDefinition } from "./generator";
import { generatePreviewTypeDefinition } from "./preview-types";
import type { GenerateTargetPlatform } from "./mendix-types";

export { parseWidgetXML } from "./parser";
export { generateTypeDefinition } from "./generator";
export { generatePreviewTypeDefinition } from "./preview-types";
export type {
  WidgetDefinition,
  Property,
  PropertyGroup,
  PropertyType,
} from "./types";

export function generateTypes(
  xmlContent: string,
  target: GenerateTargetPlatform,
): string {
  const widget =
    parseWidgetXML(
      xmlContent,
    );
  let output =
    generateTypeDefinition(
      widget,
      target,
    );

  output +=
    "\n" +
    generatePreviewTypeDefinition(
      widget,
    );

  return output;
}

export async function generateTypesFromFile(
  filePath: string,
  target: GenerateTargetPlatform,
): Promise<string> {
  const xmlContent =
    await readFile(
      filePath,
      "utf-8",
    );

  return generateTypes(
    xmlContent,
    target,
  );
}
