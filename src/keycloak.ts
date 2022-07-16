import Keycloak from "keycloak-js";

const keycloak = new Keycloak('/keycloak.json');

export { keycloak }