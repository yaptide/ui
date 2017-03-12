/* @flow */

const en = {
  appName: 'Palantir',
  auth: {
    form: {
      loginBtn: 'Sign in',
      registerBtn: 'Sign up',
      usernameLabel: 'Login',
      passwordLabel: 'Password',
      repeatPasswordLabel: 'Repeat password',
      emailLabel: 'Email',
    },
    links: {
      goRegister: 'New to Palantir? Create an account.',
      goLogin: 'Already have an account? Log in',
      forgotenPass: 'Forgot password?',
    },
  },
  welcome: {},
  project: {
    status: {
      error: 'Last simulation failed',
      success: 'Last simulation finished',
      edited: 'Project was edited since last simulation run',
      inprogress: 'Simulation in progress',
      none: 'No results avilable',
    },
    versionStatus: {
      error: 'Simulation failed - checkout errors',
      success: 'Simulation success - checkout results',
      current: 'Simulation is ready to start',
      inprogress: 'Simulation in progress',
      none: 'No results avilable',
    },
    version: {
      number: 'Version: %{number}',
      status: 'Status: %{statusInfo}',
      library: 'Library: %{library}',
      engine: 'Engine: %{engine}',
      useVersionBtn: 'Use this version as current simulation',
      showResultsBtn: 'Show simulation results',
      showErrorsBtn: 'Show simulation errors',
      startSimulationBtn: 'Start simmulation',
      updateSettingBtn: 'Update settings',
    },
  },
  simulation: {},
  results: {},
  library: {
    shield: 'SHIELD-HIT12A',
  },
  engine: {
    local: 'Host system',
    plgrid: 'PL-GRID',
  },
};


export default en;
