import React from 'react'
import packageJson from '../../../package.json'

const VersionInfo: React.FC = () => {
  const { version, license } = packageJson

  return (
    <div className="absolute top-4 left-4 glass-light rounded-tech px-3 py-2">
      <p className="text-[var(--color-text-body)] text-sm font-mono">
        Version {version}
      </p>
      <p className="text-[var(--color-text-body)] text-sm font-mono">
        License {license}
      </p>
    </div>
  )
}

export default VersionInfo
