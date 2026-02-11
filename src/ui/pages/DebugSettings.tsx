'use client'

import PageTitle from "@/ui/components/PageTitle";
import Button from "@/ui/components/Button";
import Checkbox from "@/ui/components/Checkbox";
import GlassPanel from "@/ui/components/GlassPanel";
import useDebugConfigStore from "@/state/useDebugConfigStore";
import useAppStateStore from "@/state/useAppStateStore";

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

  const { goToMainMenu } = useAppStateStore();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-background)] p-4">
      <GlassPanel 
        variant="heavy" 
        insetShadow="lg"
        className="w-full max-w-2xl p-8 border-2 border-[var(--color-accent)]"
      >
        <PageTitle>Debug Settings</PageTitle>
        
        <div className="mt-8 space-y-6">
          <GlassPanel variant="light" className="p-4">
            <h2 className="mb-4 text-xl font-bold text-[var(--color-accent)] font-mono tracking-wider">General</h2>
            <Checkbox
              checked={debug}
              onChange={setDebug}
              label="Enable Debug Mode"
            />
          </GlassPanel>

          <GlassPanel variant="light" className="p-4">
            <h2 className="mb-4 text-xl font-bold text-[var(--color-accent)] font-mono tracking-wider">Debug Tools</h2>
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
          </GlassPanel>

          <GlassPanel variant="light" className="p-4">
            <h2 className="mb-4 text-xl font-bold text-[var(--color-accent)] font-mono tracking-wider">View Settings</h2>
            <Checkbox
              checked={view.isDiscrete}
              onChange={setViewDiscrete}
              label="Discrete View Mode"
              disabled={!debug}
            />
          </GlassPanel>

          <div className="flex gap-4 mt-8">
            <Button onClick={resetToDefaults} variant="secondary">
              Reset to Defaults
            </Button>
            <Button onClick={goToMainMenu} variant="primary">
              Back to Main Menu
            </Button>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
};

export default DebugSettings;
