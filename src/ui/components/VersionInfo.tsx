import React from 'react';
import packageJson from '../../../package.json';

const VersionInfo: React.FC = () => {
  const { version, license } = packageJson;

  return (
    <div className="absolute top-4 left-4 text-gray-100 text-sm font-mono">
      <p>Version {version}</p>
      <p>License {license}</p>
    </div>
  );
};

export default VersionInfo;
