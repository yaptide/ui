/* @flow */

const en = {
  appName: 'yaptide',
  pageProjects: 'Projects',
  pageWorkspace: 'Workspace',
  pageAccount: 'Account',
  pageAbout: 'About',
  pageHelp: 'Help',
  tabGeometry: 'Geometry',
  tabMaterial: 'Material',
  tabDetectors: 'Detectors',
  tabOptions: 'Options',
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
      goRegister: 'New to yaptide? Create an account.',
      goLogin: 'Already have an account? Log in',
      forgotenPass: 'Forgot password?',
    },
  },
  welcome: {},
  project: {
    projectEdit: 'Edit project',
    showDetailsBtn: 'Go to project details',
    form: {
      name: 'Name',
      description: 'Description',
      createBtn: 'Create',
      updateBtn: 'Update',
    },
    versionStatus: {
      new: 'New',
      edited: 'Edited',
      running: 'Running',
      pending: 'Pending',
      success: 'Success',
      failure: 'Failure',
      interrupted: 'Simulation interrupted - server error',
      canceled: 'Canceled',
      discarded: 'Discarded',
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
  simulation: {
    energyBase: 'Energy base [MeV]',
    energySigma: 'Energy sigma [MeV]',
    meanEnergyLoss: 'Mean energy loss [%]',
    minEnergyLoss: 'Minimal energy loss [MeV]',
    positionLabel: 'Position',
    distributionParameters: 'Distribution parameters',
    lowEnergyNeutronCutOff: 'Low energy neutron cut off [MeV]',
  },
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
