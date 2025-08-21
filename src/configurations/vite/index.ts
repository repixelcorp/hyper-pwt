import { UserConfig } from "vite";
import react from '@vitejs/plugin-react-swc';
import path from "path";

import getWidgetName from "../../utils/getWidgetName";
import { PROJECT_DIRECTORY, WEB_OUTPUT_DIRECTORY } from "../../constants";
import getViteOutputDirectory from "../../utils/getViteOutputDirectory";

export const getEditorConfigDefaultConfig = async (): Promise<UserConfig> => {
  const widgetName = await getWidgetName();

  return {
    plugins: [],
    build: {
      outDir: WEB_OUTPUT_DIRECTORY,
      minify: 'esbuild',
      emptyOutDir: false,
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

export const getEditorPreviewDefaultConfig = async (): Promise<UserConfig> => {
  const widgetName = await getWidgetName();

  return {
    plugins: [react()],
    define: {
      'process.env': {},
      'process.env.NODE_ENV': '"production"'
    },
    build: {
      outDir: WEB_OUTPUT_DIRECTORY,
      minify: 'esbuild',
      emptyOutDir: false,
      lib: {
        entry: path.join(PROJECT_DIRECTORY, `/src/${widgetName}.editorPreview.tsx`),
        name: `${widgetName}.editorPreview`,
        fileName: () => {
          return `${widgetName}.editorPreview.js`;
        },
        formats: ['umd']
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'react-dom/client'],
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

export const getViteDefaultConfig = async (userCustomConfig?: UserConfig): Promise<UserConfig> => {
  const widgetName = await getWidgetName();
  const viteOutputDirectory = await getViteOutputDirectory();

  return {
    plugins: [react()],
    define: {
      'process.env': {},
      'process.env.NODE_ENV': '"production"'
    },
    build: {
      outDir: viteOutputDirectory,
      minify: 'esbuild',
      cssMinify: 'esbuild',
      lib: {
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
      rollupOptions: {
        external: ['react', 'react-dom', 'react-dom/client'],
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