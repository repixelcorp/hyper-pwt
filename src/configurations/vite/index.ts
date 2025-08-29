import { UserConfig } from "vite";
import react from '@vitejs/plugin-react';
import path from "path";

import getWidgetName from "../../utils/getWidgetName";
import { PROJECT_DIRECTORY, WEB_OUTPUT_DIRECTORY } from "../../constants";
import getViteOutputDirectory from "../../utils/getViteOutputDirectory";
import { PWTConfig } from "../..";

export const getEditorConfigDefaultConfig = async (isProduction: boolean): Promise<UserConfig> => {
  const widgetName = await getWidgetName();

  return {
    plugins: [],
    build: {
      outDir: WEB_OUTPUT_DIRECTORY,
      minify: isProduction ? true : false,
      emptyOutDir: false,
      sourcemap: isProduction ? false : true,
      lib: {
        entry: path.join(PROJECT_DIRECTORY, `/src/${widgetName}.editorConfig.ts`),
        name: `${widgetName}.editorConfig`,
        fileName: () => {
          return `${widgetName}.editorConfig.js`;
        },
        formats: ['umd']
      },
    },
  };
};

export const getEditorPreviewDefaultConfig = async (isProduction: boolean): Promise<UserConfig> => {
  const widgetName = await getWidgetName();

  return {
    plugins: [
      react({
        jsxRuntime: 'classic'
      }),
    ],
    define: {
      'process.env': {},
      'process.env.NODE_ENV': '"production"'
    },
    build: {
      outDir: WEB_OUTPUT_DIRECTORY,
      minify: isProduction ? true : false,
      emptyOutDir: false,
      sourcemap: isProduction ? false : true,
      lib: {
        entry: path.join(PROJECT_DIRECTORY, `/src/${widgetName}.editorPreview.tsx`),
        name: `${widgetName}.editorPreview`,
        fileName: () => {
          return `${widgetName}.editorPreview.js`;
        },
        formats: ['umd']
      },
      rolldownOptions: {
        external: [
          'react',
          'react-dom',
          'react-dom/client',
          'react/jsx-runtime',
          'react/jsx-dev-runtime',
          /^mendix($|\/)/
        ],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react-dom/client': 'ReactDOM'
          }
        }
      }
    },
  };
};

export const getViteDefaultConfig = async (isProduction: boolean, userCustomConfig?: PWTConfig): Promise<UserConfig> => {
  const widgetName = await getWidgetName();
  const viteOutputDirectory = await getViteOutputDirectory();

  return {
    plugins: [
      react({
        ...userCustomConfig?.reactPluginOptions || {},
        jsxRuntime: 'classic'
      })
    ],
    define: {
      'process.env': {},
      'process.env.NODE_ENV': isProduction ? '"production"' : '"development"'
    },
    build: {
      outDir: viteOutputDirectory,
      minify: isProduction ? true : false,
      cssMinify: isProduction ? true : false,
      sourcemap: isProduction ? false : true,
      lib: {
        formats: isProduction ? ['umd'] : ['es', 'umd'],
        entry: path.join(PROJECT_DIRECTORY, `/src/${widgetName}.tsx`),
        name: widgetName,
        fileName: (format, entry) => {
          if (format === 'umd') {
            return `${widgetName}.js`;
          }

          if (format === 'es') {
            return `${widgetName}.mjs`;
          }

          return entry;
        },
        cssFileName: widgetName
      },
      rolldownOptions: {
        external: [
          'react',
          'react-dom',
          'react-dom/client',
          'react/jsx-runtime',
          'react/jsx-dev-runtime',
          /^mendix($|\/)/
        ],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react-dom/client': 'ReactDOM'
          }
        }
      }
    },
    ...userCustomConfig
  }
};