/* @flow */

const en = {
  appName: 'Palantir',
  pageProjects: 'Projects',
  pageWorkspace: 'Workspace',
  pageAccount: 'Account',
  pageAbout: 'About',
  pageHelp: 'Help',
  tabGeometry: 'Geometry',
  tabMaterial: 'Material',
  tabDetectors: 'Detectors',
  tabSettings: 'Settings',
  tabBeam: 'Beam',
  auth: {
    form: {
      loginBtn: 'Sign in',
      registerBtn: 'Sign up',
      usernameLabel: 'Login',
      passwordLabel: 'Password',
      repeatPasswordLabel: 'Repeat password',
      emailLabel: 'Email',
      logoutBtn: 'Sign out',
    },
    links: {
      goRegister: 'New to Palantir? Create an account.',
      goLogin: 'Already have an account? Log in',
      forgotenPass: 'Forgot password?',
    },
  },
  welcome: {},
  project: {
    showDetailsBtn: 'Go to project details',
    status: {
      error: 'Last simulation failed',
      success: 'Last simulation finished',
      edited: 'Project was edited since last simulation run',
      inprogress: 'Simulation in progress',
      none: 'No results avilable',
    },
    versionStatus: {
      error: 'Simulation failed - check errors',
      success: 'Simulation success - check results',
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
      startSimulationBtn: 'Start simulation',
      updateSettingBtn: 'Update settings',
    },
  },
  workspace: {
    editor: {
      size: 'Size',
      center: 'Center',
      height: 'Height',
      radius: 'Radius',
      type: 'Type',
      baseCenter: 'Base center',
      updateBtn: 'Update',
      createBtn: 'Create',
    },
    typeLabel: {
      cuboid: 'Cuboid',
      sphere: 'Sphere',
      cylinder: 'Cylinder',
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
  empty: {
    logout: {
      title: 'You are now signed out.',
      body1: 'You can return to ',
      home: 'home page',
      body2: ' or ',
      login: 'login',
      body3: ' again.',
    },
  },
};


export default en;
