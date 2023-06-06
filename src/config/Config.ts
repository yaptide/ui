export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL ?? 'http://localhost:5000';
export const DEMO_MODE = process.env.REACT_APP_TARGET === 'demo';
export const ALT_AUTH = process.env.REACT_APP_ALT_AUTH === 'plg';
type ConfigDeployment = 'dev' | 'prod' | undefined;
export const DEPLOYMENT: ConfigDeployment = process.env.REACT_APP_DEPLOYMENT as ConfigDeployment;
