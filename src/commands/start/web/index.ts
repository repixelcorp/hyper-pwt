import fs from 'fs/promises';
import path from 'path';
import { UserConfig, createServer } from 'vite';

import { CLI_DIRECTORY, COLOR_ERROR, COLOR_GREEN, PROJECT_DIRECTORY } from "../../../constants";
import showMessage from "../../../utils/showMessage";
import getViteWatchOutputDirectory from "../../../utils/getViteWatchOutputDirectory";
import pathIsExists from "../../../utils/pathIsExists";
import { getViteDefaultConfig } from '../../../configurations/vite';
import getWidgetName from '../../../utils/getWidgetName';
import { PluginOption } from 'vite';

const startWebCommand = async () => {
  try {
    showMessage('Start widget server');

    const customViteConfigPath = path.join(PROJECT_DIRECTORY, 'vite.config.ts');
    const viteConfigIsExists = await pathIsExists(customViteConfigPath);
    let resultViteConfig: UserConfig;
    const widgetName = await getWidgetName();

    if (viteConfigIsExists) {
      const userConfig: UserConfig = await import(customViteConfigPath);

      resultViteConfig = await getViteDefaultConfig(false, userConfig);
    } else {
      resultViteConfig = await getViteDefaultConfig(false);
    }

    const viteCachePath = path.join(PROJECT_DIRECTORY, 'node_modules/.vite');
    const viteCachePathExists = await pathIsExists(viteCachePath);

    if (viteCachePathExists) {
      await fs.rm(viteCachePath, { recursive: true, force: true });
    }

    const viteServer = await createServer({
      ...resultViteConfig,
      root: PROJECT_DIRECTORY,
      optimizeDeps: {
        include: ['react', 'react-dom'],
        exclude: ['src'],
        force: true
      },
      server: {
        fs: {
          strict: false
        },
        watch: {
          usePolling: true,
          interval: 100
        },
      },
      plugins: [
        ...resultViteConfig.plugins as PluginOption[],
        {
          name: 'mendix-hotreload-react',
          enforce: 'pre',
          transform(code, id) {
            if (!id.includes('node_modules') && /\.(tsx?|jsx?)$/.test(id)) {
              let transformedCode = code;
              
              transformedCode = transformedCode.replace(
                /import\s+(\w+)\s+from\s+['"]react['"]/g,
                'const $1 = window.React'
              );
              
              transformedCode = transformedCode.replace(
                /import\s+\*\s+as\s+(\w+)\s+from\s+['"]react['"]/g,
                'const $1 = window.React'
              );
              
              transformedCode = transformedCode.replace(
                /import\s+{([^}]+)}\s+from\s+['"]react['"]/g,
                (match, imports) => {
                  const cleanImports = imports.replace(/\s+/g, ' ').trim();
                  return `const { ${cleanImports} } = window.React`;
                }
              );
              
              transformedCode = transformedCode.replace(
                /import\s+(\w+)\s*,\s*{([^}]+)}\s+from\s+['"]react['"]/g,
                (match, defaultImport, namedImports) => {
                  const cleanImports = namedImports.replace(/\s+/g, ' ').trim();
                  return `const ${defaultImport} = window.React;\nconst { ${cleanImports} } = window.React`;
                }
              );
              
              transformedCode = transformedCode.replace(
                /import\s+(\w+)\s+from\s+['"]react-dom['"]/g,
                'const $1 = window.ReactDOM'
              );
              
              transformedCode = transformedCode.replace(
                /import\s+{([^}]+)}\s+from\s+['"]react-dom['"]/g,
                'const { $1 } = window.ReactDOM'
              );
              
              transformedCode = transformedCode.replace(
                /import\s+{([^}]+)}\s+from\s+['"]react-dom\/client['"]/g,
                'const { $1 } = window.ReactDOM'
              );
              
              transformedCode = transformedCode.replace(
                /import\s+type\s+{([^}]+)}\s+from\s+['"]react['"]/g,
                '// Type import removed: $1'
              );
              
              return {
                code: transformedCode,
                map: null
              };
            }
          },
        }
      ]
    });

    await viteServer.listen();

    showMessage('Generate hot reload widget');
    
    const hotReloadTemplate = path.join(CLI_DIRECTORY, 'src/configurations/hotReload/widget.proxy.js.template');
    const hotReloadContents = await fs.readFile(hotReloadTemplate, 'utf-8');
    const devServerUrl = viteServer.resolvedUrls?.local[0] || '';
    const newHotReloadContents = hotReloadContents
                                  .replaceAll('{{ WIDGET_NAME }}', widgetName)
                                  .replaceAll('{{ DEV_SERVER_URL }}', devServerUrl)

    const distDir = await getViteWatchOutputDirectory();
    const distIsExists = await pathIsExists(distDir);
    const hotReloadWidgetPath = path.join(distDir, `${widgetName}.mjs`);
    const dummyCssPath = path.join(distDir, `${widgetName}.css`);

    if (distIsExists) {
      await fs.rm(distDir, { recursive: true, force: true });
    }

    await fs.mkdir(distDir, { recursive: true });
    await fs.writeFile(hotReloadWidgetPath, newHotReloadContents);
    await fs.writeFile(dummyCssPath, '');

    showMessage(`${COLOR_GREEN('Widget hot reload is ready!')}`);
    showMessage(`${COLOR_GREEN('Mendix webpage will refresh shortly. Hot reload will work after refreshing.')}`);
  } catch (error) {
    showMessage(`${COLOR_ERROR('Build failed.')}\nError occurred: ${COLOR_ERROR((error as Error).message)}`);
  }
};

export default startWebCommand;