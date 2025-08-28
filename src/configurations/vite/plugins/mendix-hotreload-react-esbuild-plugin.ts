import { Plugin } from "esbuild";

// @note When the React version of Mendix is updated, the following content must also be updated.
// @todo Depending on the React version, we need to consider whether there is a way to handle this automatically rather than manually. 
export function mendixHotreloadReactEsbuildPlugin(): Plugin {
  return {
    name: 'mendix-hotreload-react-esbuild',
    setup(build) {
      build.onResolve({ filter: /^react$/ }, (args) => {
        return {
          path: 'mendix:react',
          namespace: 'mendix-react',
          external: false
        };
      });

      build.onResolve({ filter: /^react-dom$/ }, (args) => {
        return {
          path: 'mendix:react-dom',
          namespace: 'mendix-react-dom',
          external: false
        };
      });

      build.onResolve({ filter: /^react-dom\/client$/ }, (args) => {
        return {
          path: 'mendix:react-dom/client',
          namespace: 'mendix-react-dom-client',
          external: false
        };
      });

      build.onResolve({ filter: /^react\/jsx-runtime$/ }, (args) => {
        return {
          path: 'mendix:react/jsx-runtime',
          namespace: 'mendix-react-jsx-runtime',
          external: false
        };
      });

      build.onResolve({ filter: /^react\/jsx-dev-runtime$/ }, (args) => {
        return {
          path: 'mendix:react/jsx-dev-runtime',
          namespace: 'mendix-react-jsx-dev-runtime',
          external: false
        };
      });

      build.onLoad({ filter: /.*/, namespace: 'mendix-react' }, () => {
        return {
          contents: `
            const React = window.React;
            
            export const Children = React.Children;
            export const Component = React.Component;
            export const Fragment = React.Fragment;
            export const Profiler = React.Profiler;
            export const PureComponent = React.PureComponent;
            export const StrictMode = React.StrictMode;
            export const Suspense = React.Suspense;
            export const cloneElement = React.cloneElement;
            export const createContext = React.createContext;
            export const createElement = React.createElement;
            export const createFactory = React.createFactory;
            export const createRef = React.createRef;
            export const forwardRef = React.forwardRef;
            export const isValidElement = React.isValidElement;
            export const lazy = React.lazy;
            export const memo = React.memo;
            export const startTransition = React.startTransition;
            export const unstable_act = React.unstable_act;
            export const useCallback = React.useCallback;
            export const useContext = React.useContext;
            export const useDebugValue = React.useDebugValue;
            export const useDeferredValue = React.useDeferredValue;
            export const useEffect = React.useEffect;
            export const useId = React.useId;
            export const useImperativeHandle = React.useImperativeHandle;
            export const useInsertionEffect = React.useInsertionEffect;
            export const useLayoutEffect = React.useLayoutEffect;
            export const useMemo = React.useMemo;
            export const useReducer = React.useReducer;
            export const useRef = React.useRef;
            export const useState = React.useState;
            export const useSyncExternalStore = React.useSyncExternalStore;
            export const useTransition = React.useTransition;
            export const version = React.version;
            
            export default React;
          `,
          loader: 'js',
        };
      });

      build.onLoad({ filter: /.*/, namespace: 'mendix-react-dom' }, () => {
        return {
          contents: `
            const ReactDOM = window.ReactDOM;
            
            export const createPortal = ReactDOM.createPortal;
            export const createRoot = ReactDOM.createRoot;
            export const findDOMNode = ReactDOM.findDOMNode;
            export const flushSync = ReactDOM.flushSync;
            export const hydrate = ReactDOM.hydrate;
            export const hydrateRoot = ReactDOM.hydrateRoot;
            export const render = ReactDOM.render;
            export const unmountComponentAtNode = ReactDOM.unmountComponentAtNode;
            export const unstable_batchedUpdates = ReactDOM.unstable_batchedUpdates;
            export const unstable_renderSubtreeIntoContainer = ReactDOM.unstable_renderSubtreeIntoContainer;
            export const version = ReactDOM.version;
            
            export default ReactDOM;
          `,
          loader: 'js',
        };
      });

      build.onLoad({ filter: /.*/, namespace: 'mendix-react-dom-client' }, () => {
        return {
          contents: `
            const ReactDOMClient = window.ReactDOMClient;
            
            export const createRoot = ReactDOMClient.createRoot;
            export const hydrateRoot = ReactDOMClient.hydrateRoot;
            
            export default ReactDOMClient;
          `,
          loader: 'js',
        };
      });

      build.onLoad({ filter: /.*/, namespace: 'mendix-react-jsx-runtime' }, () => {
        return {
          contents: `
            const ReactJSXRuntime = window.ReactJSXRuntime;
            
            export const Fragment = ReactJSXRuntime.Fragment;
            export const jsx = ReactJSXRuntime.jsx;
            export const jsxs = ReactJSXRuntime.jsxs;
            
            export default ReactJSXRuntime;
          `,
          loader: 'js',
        };
      });

      build.onLoad({ filter: /.*/, namespace: 'mendix-react-jsx-dev-runtime' }, () => {
        return {
          contents: `
            const ReactJSXDevRuntime = window.ReactJSXDevRuntime;
            
            export const Fragment = ReactJSXDevRuntime.Fragment;
            export const jsxDEV = ReactJSXDevRuntime.jsxDEV;
            
            export default ReactJSXDevRuntime;
          `,
          loader: 'js',
        };
      });

      build.onResolve({ filter: /.*node_modules[\\\/]react[\\\/]index\.js$/ }, (args) => {
        return {
          path: 'mendix:react',
          namespace: 'mendix-react',
          external: false
        };
      });

      build.onResolve({ filter: /.*node_modules[\\\/]react-dom[\\\/]index\.js$/ }, (args) => {
        return {
          path: 'mendix:react-dom',
          namespace: 'mendix-react-dom',
          external: false
        };
      });

      build.onResolve({ filter: /.*node_modules[\\\/]react-dom[\\\/]client\.js$/ }, (args) => {
        return {
          path: 'mendix:react-dom/client',
          namespace: 'mendix-react-dom-client',
          external: false
        };
      });
    }
  };
}