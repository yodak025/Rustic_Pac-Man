import React, { useState, useEffect } from "react";

export default function DebugBar() {
  const [debugBar, setDebugBarState] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '3') {
        setDebugBarState(prevState => !prevState);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return debugBar && (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2 bg-gray-800 text-white text-sm">
      <p>Debug Information:</p>
      {/* Add more debug info here as needed */}
    </div>
  );
}
