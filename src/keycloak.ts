// import Keycloak from "keycloak_js";
// import auth_config from "./keycloak.json"

// const keycloak = '/keycloak.json';

// const eventLogger = (event: unknown, error: unknown) => {
//     console.log('onKeycloakEvent', event, error)
// }

// const tokenLogger = (tokens: unknown) => {
//     console.log('onKeycloakTokens', tokens)
// }

const auth_config = {
    scope: "openid profile email",
    redirect_uri: `${window.location.origin}`,
    authority: "https://sso.pre.plgrid.pl/auth/",
    ssl_required: "external",
    client_id: "yaptide_dev",
    token_request_extras: {
        client_secret: "2ou3zw6cajg1RNpls5cc4vwQoxM3Xl0L"
    },
    confidential_port: 0
}

export { auth_config }


// "@react_keycloak/web": "^3.4.0",
// "keycloak_js": "^18.0.1",