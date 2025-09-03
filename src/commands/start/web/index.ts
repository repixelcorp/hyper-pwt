import fs from "node:fs/promises";
import path from "node:path";
import typescript from "rollup-plugin-typescript2";
import { createServer, type PluginOption, type UserConfig } from "vite";
import { getViteDefaultConfig } from "../../../configurations/vite";
import { mendixHotreloadReactPlugin } from "../../../configurations/vite/plugins/mendix-hotreload-react-plugin";
import { mendixPatchViteClientPlugin } from "../../../configurations/vite/plugins/mendix-patch-vite-client-plugin";
import {
  CLI_DIRECTORY,
  COLOR_ERROR,
  COLOR_GREEN,
  PROJECT_DIRECTORY,
  VITE_CONFIGURATION_FILENAME,
} from "../../../constants";
import { generateTypesFromFile } from "../../../type-generator";
import getViteUserConfiguration from "../../../utils/getViteUserConfiguration";
import getViteWatchOutputDirectory from "../../../utils/getViteWatchOutputDirectory";
import getWidgetName from "../../../utils/getWidgetName";
import pathIsExists from "../../../utils/pathIsExists";
import showMessage from "../../../utils/showMessage";

const generateTyping = async () => {
  const widgetName = await getWidgetName();
  const originWidgetXmlPath = path.join(
    PROJECT_DIRECTORY,
    `src/${widgetName}.xml`,
  );
  const typingsPath = path.join(PROJECT_DIRECTORY, "typings");
  const typingsDirExists = await pathIsExists(typingsPath);

  if (typingsDirExists) {
    await fs.rm(typingsPath, {
      recursive: true,
      force: true,
    });
  }

  await fs.mkdir(typingsPath);

  const newTypingsFilePath = path.join(typingsPath, `${widgetName}Props.d.ts`);
  const typingContents = await generateTypesFromFile(
    originWidgetXmlPath,
    "web",
  );

  await fs.writeFile(newTypingsFilePath, typingContents);
};

const startWebCommand = async () => {
  try {
    showMessage("Start widget server");

    await generateTyping();

    const customViteConfigPath = path.join(
      PROJECT_DIRECTORY,
      VITE_CONFIGURATION_FILENAME,
    );
    const viteConfigIsExists = await pathIsExists(customViteConfigPath);
    let resultViteConfig: UserConfig;
    const widgetName = await getWidgetName();

    if (viteConfigIsExists) {
      const userConfig = await getViteUserConfiguration(customViteConfigPath);

      resultViteConfig = await getViteDefaultConfig(false, userConfig);
    } else {
      resultViteConfig = await getViteDefaultConfig(false);
    }

    const viteCachePath = path.join(PROJECT_DIRECTORY, "node_modules/.vite");
    const viteCachePathExists = await pathIsExists(viteCachePath);

    if (viteCachePathExists) {
      await fs.rm(viteCachePath, {
        recursive: true,
        force: true,
      });
    }

    const viteServer = await createServer({
      ...resultViteConfig,
      root: PROJECT_DIRECTORY,
      server: {
        fs: {
          strict: false,
        },
        watch: {
          usePolling: true,
          interval: 100,
        },
      },
      plugins: [
        typescript({
          tsconfig: path.join(PROJECT_DIRECTORY, "tsconfig.json"),
          tsconfigOverride: {
            compilerOptions: {
              jsx: "preserve",
              preserveConstEnums: false,
              isolatedModules: false,
              declaration: false,
            },
          },
          include: ["src/**/*.ts", "src/**/*.tsx"],
          exclude: ["node_modules/**", "src/**/*.d.ts"],
          check: false,
        }),
        ...(resultViteConfig.plugins as PluginOption[]),
        mendixHotreloadReactPlugin(),
        mendixPatchViteClientPlugin(),
        {
          name: "mendix-xml-watch-plugin",
          configureServer(server) {
            server.watcher.on("change", (file) => {
              if (file.endsWith("xml")) {
                generateTyping();
              }
            });
          },
        },
      ],
    });

    await viteServer.listen();

    showMessage("Generate hot reload widget");

    const hotReloadTemplate = path.join(
      CLI_DIRECTORY,
      "src/configurations/hotReload/widget.proxy.js.template",
    );
    const hotReloadContents = await fs.readFile(hotReloadTemplate, "utf-8");
    const devServerUrl = viteServer.resolvedUrls?.local[0] || "";
    const newHotReloadContents = hotReloadContents
      .replaceAll("{{ WIDGET_NAME }}", widgetName)
      .replaceAll("{{ DEV_SERVER_URL }}", devServerUrl);

    const distDir = await getViteWatchOutputDirectory();
    const distIsExists = await pathIsExists(distDir);
    const hotReloadWidgetPath = path.join(distDir, `${widgetName}.mjs`);
    const dummyCssPath = path.join(distDir, `${widgetName}.css`);

    if (distIsExists) {
      await fs.rm(distDir, {
        recursive: true,
        force: true,
      });
    }

    await fs.mkdir(distDir, {
      recursive: true,
    });
    await fs.writeFile(hotReloadWidgetPath, newHotReloadContents);
    await fs.writeFile(dummyCssPath, "");

    showMessage(`${COLOR_GREEN("Widget hot reload is ready!")}`);
    showMessage(
      `${COLOR_GREEN("Mendix webpage will refresh shortly. Hot reload will work after refreshing.")}`,
    );
  } catch (error) {
    showMessage(
      `${COLOR_ERROR("Build failed.")}\nError occurred: ${COLOR_ERROR((error as Error).message)}`,
    );
  }
};

export default startWebCommand;
