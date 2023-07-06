import Keycloak from 'keycloak-js';

const keycloakConfig = {
    url: 'https://sso.pre.plgrid.pl/auth/',
    realm: 'PLGrid',
    clientId: 'yaptide-staging',
    enableLogging: true
};

const keycloak = new Keycloak(keycloakConfig);
keycloak.init({
  onLoad: 'login-required',
  pkceMethod: 'S256',
  promiseType: 'native'
}).then(auth => {
  if(auth) {
  console.log("token", keycloak.token);
  }
});

export default keycloak;
