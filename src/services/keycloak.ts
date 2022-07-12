import Keycloak from "keycloak-js";

const keycloak_json = JSON.parse(`{
    "realm": "PLGrid",
    "auth-server-url": "https://sso.pre.plgrid.pl/auth/",
    "ssl-required": "external",
    "resource": "yaptide-dev",
    "credentials": {
        "secret": "${process.env.KEYCLOAK_CRED_SECRET}"
    },
    "confidential-port": 0
}`)

export const keycloak = new Keycloak(keycloak_json);
