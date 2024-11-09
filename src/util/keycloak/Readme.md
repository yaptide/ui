Files in this directory were copied from keycloak-react-web library:
- npm - <https://www.npmjs.com/package/keycloak-react-web>
- github - <https://github.com/keycloak-react/keycloak-react/tree/main/src/keycloak>

Why we copied it instead of using as dependency:
- This library is not supported since 2023 and because of this it's not compatible with newest official keycloak-js library.
Compatibility issue: Keycloak object in newest keycloak-js library changed in version 26.0.0
and is not assignable to object from older versions (keycloak-react-web uses version 19.0.2 of keycloak-js).
