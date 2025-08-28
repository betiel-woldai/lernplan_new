import packageJson from '../../package.json';

// Get build information
export const VERSION = packageJson.version;
export const BUILD_HASH = 'c8bb028'; // Current commit hash
export const BUILD_DATE = new Date().toLocaleDateString('de-DE');

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