// src/Config.ts

interface Config {
    backendURL: string;
    target: string;
    altAuth: string;
  }
  
  const fetchConfig = async (): Promise<Config> => {
    try {
      const response = await fetch('/config.json');
      console.log("response", response);
      if (!response.ok) {
        throw new Error('Failed to fetch config file');
      }
      const config = await response.json();
      console.log("config", config);
      return config;
    } catch (error) {
      console.error('Error fetching config:', error);
      return {
        backendURL: 'http://localhost:5000',
        target: 'demo',
        altAuth: 'plg',
      };
    }
  };
  
  const configPromise: Promise<Config> = fetchConfig();
  const backendURLPromise: Promise<string | URL | undefined> = configPromise.then(config => config.backendURL);

  let BACKEND_URL: string = '';
  let DEMO_MODE: boolean = false;
  let ALT_AUTH: boolean = false;
  
  configPromise.then(config => {
    BACKEND_URL = config.backendURL;
    DEMO_MODE = config.target === 'demo';
    ALT_AUTH = config.altAuth === 'plg';
  });

  console.log(BACKEND_URL);
  console.log(DEMO_MODE);
  console.log(ALT_AUTH);
  
  export { BACKEND_URL, DEMO_MODE, ALT_AUTH, backendURLPromise, fetchConfig };
  export type { Config };
  