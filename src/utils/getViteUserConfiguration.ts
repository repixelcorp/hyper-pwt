import type { PWTConfig, PWTConfigFn, PWTConfigFnPromise } from "..";

const getViteUserConfiguration = async (path: string): Promise<PWTConfig> => {
  const getUserConfig = await import(`file://${path}`);
  const getUserConfigFn: PWTConfigFn | PWTConfigFnPromise =
    getUserConfig.default;
  const userConfig = getUserConfigFn();

  if (userConfig instanceof Promise) {
    const userConfigValue = await userConfig;

    return userConfigValue;
  }

  return userConfig;
};

export default getViteUserConfiguration;
