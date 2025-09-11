import packageJson from '../../package.json';

// Get build information
export const VERSION = packageJson.version;
export const BUILD_HASH = '18a9e54'; // Current commit hash - Issue #17 Lerntracker-Zentrale
export const BUILD_DATE = '11.09.2024'; // Fixed build date to prevent hydration issues

export const getVersionString = () => {
  return `v${VERSION} (${BUILD_HASH})`;
};

export const getBuildInfo = () => {
  return {
    version: VERSION,
    hash: BUILD_HASH,
    date: BUILD_DATE,
    fullVersion: getVersionString()
  };
};