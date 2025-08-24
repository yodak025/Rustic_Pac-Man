import debugConfig from "@config/debug.json";

// A singleton approach to manage configurations
export default class ConfigManager {
  constructor() {
    if (ConfigManager.instance) return ConfigManager.instance;
    ConfigManager.instance = this;
  }

  private static instance: ConfigManager;

  public getDebugConfig() {
    return debugConfig;
  }
}

