import Keycloak from 'keycloak-js';

const keycloakConfig = {
	url: 'http://localhost:8080',
	realm: 'myrealm',
	clientId: 'myclient'
};

const keycloak = new Keycloak(keycloakConfig);
keycloak.init({
  onLoad: 'login-required',
  promiseType: 'native'
}).then(auth => {
  if(auth) {
  console.log("token", keycloak.token);
  }
});

export default keycloak;
