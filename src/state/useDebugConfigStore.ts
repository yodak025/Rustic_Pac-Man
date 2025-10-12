import { create } from "zustand";
import debugConfigData from "@config/debug.json";

interface DebugConfig {
  debug: boolean;
  tools: {
    infoBar: {
      isDisplayed: boolean;
    };
    mazeViewer: {
      isDisplayed: boolean;
    };
  };
  view: {
    isDiscrete: boolean;
  };
}

interface DebugConfigStore extends DebugConfig {
  setDebug: (value: boolean) => void;
  setInfoBarDisplayed: (value: boolean) => void;
  setMazeViewerDisplayed: (value: boolean) => void;
  setViewDiscrete: (value: boolean) => void;
  resetToDefaults: () => void;
}

const defaultConfig: DebugConfig = {
  debug: debugConfigData.debug,
  tools: {
    infoBar: {
      isDisplayed: debugConfigData.tools.infoBar.isDisplayed,
    },
    mazeViewer: {
      isDisplayed: debugConfigData.tools.mazeViewer.isDisplayed,
    },
  },
  view: {
    isDiscrete: debugConfigData.view.isDiscrete,
  },
};

const useDebugConfigStore = create<DebugConfigStore>((set) => ({
  ...defaultConfig,
  setDebug: (value) => set({ debug: value }),
  setInfoBarDisplayed: (value) =>
    set((state) => ({
      tools: {
        ...state.tools,
        infoBar: { isDisplayed: value },
      },
    })),
  setMazeViewerDisplayed: (value) =>
    set((state) => ({
      tools: {
        ...state.tools,
        mazeViewer: { isDisplayed: value },
      },
    })),
  setViewDiscrete: (value) =>
    set((state) => ({
      view: {
        ...state.view,
        isDiscrete: value,
      },
    })),
  resetToDefaults: () => set(defaultConfig),
}));

export default useDebugConfigStore;
