import type { UserConfig } from "vite";
import reactPlugin from "@vitejs/plugin-react";

export type PWTConfig =
  UserConfig & {
    reactPluginOptions?: Parameters<
      typeof reactPlugin
    >[0];
  };

export type PWTConfigFnPromise =
  () => Promise<PWTConfig>;
export type PWTConfigFn =
  () =>
    | PWTConfig
    | Promise<PWTConfig>;

export function definePWTConfig(
  config:
    | PWTConfigFn
    | PWTConfigFnPromise,
):
  | PWTConfigFn
  | PWTConfigFnPromise {
  return config;
}
