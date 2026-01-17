'use client'

import PageTitle from "@/ui/components/PageTitle";
import Button from "@/ui/components/Button";
import Checkbox from "@/ui/components/Checkbox";
import useDebugConfigStore from "@/state/useDebugConfigStore";
import { useGameStatusStore } from "@/state/store";

const DebugSettings = () => {
  const {
    debug,
    tools,
    view,
    setDebug,
    setInfoBarDisplayed,
    setMazeViewerDisplayed,
    setViewDiscrete,
    resetToDefaults,
  } = useDebugConfigStore();

  const { reboot } = useGameStatusStore();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-background)] bg-opacity-90">
      <div className="w-full max-w-2xl p-8 bg-[var(--color-background)] border-4 border-[var(--color-accent)] rounded-lg">
        <PageTitle>Debug Settings</PageTitle>
        
        <div className="mt-8 space-y-6">
          <div className="p-4 bg-transparent border-2 border-[var(--color-primary-medium)] rounded">
            <h2 className="mb-4 text-xl font-bold text-[var(--color-primary-medium)] font-mono">General</h2>
            <Checkbox
              checked={debug}
              onChange={setDebug}
              label="Enable Debug Mode"
            />
          </div>

          <div className="p-4 bg-transparent border-2 border-[var(--color-primary-medium)] rounded">
            <h2 className="mb-4 text-xl font-bold text-[var(--color-primary-medium)] font-mono">Debug Tools</h2>
            <div className="space-y-3">
              <Checkbox
                checked={tools.infoBar.isDisplayed}
                onChange={setInfoBarDisplayed}
                label="Show Info Bar"
                disabled={!debug}
              />
              <Checkbox
                checked={tools.mazeViewer.isDisplayed}
                onChange={setMazeViewerDisplayed}
                label="Show Maze Viewer"
                disabled={!debug}
              />
            </div>
          </div>

          <div className="p-4 bg-transparent border-2 border-[var(--color-primary-medium)] rounded">
            <h2 className="mb-4 text-xl font-bold text-[var(--color-primary-medium)] font-mono">View Settings</h2>
            <Checkbox
              checked={view.isDiscrete}
              onChange={setViewDiscrete}
              label="Discrete View Mode"
              disabled={!debug}
            />
          </div>

          <div className="flex gap-4 mt-8">
            <Button onClick={resetToDefaults} variant="secondary">
              Reset to Defaults
            </Button>
            <Button onClick={reboot} variant="primary">
              Back to Main Menu
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugSettings;
