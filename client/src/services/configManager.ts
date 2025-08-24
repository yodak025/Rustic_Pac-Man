import debugConfig from "@config/debug.json";

// A singleton approach to manage configurations
export default class ConfigManager {
  constructor() {
    if (ConfigManager.instance) return ConfigManager.instance;
    ConfigManager.instance = this;
    ConfigManager.debug = debugConfig; 
  }

  private static instance: ConfigManager;
  private static debug: typeof debugConfig;

  public getDebugConfig() {
    return ConfigManager.debug;
  }
}

