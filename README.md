# yaptide web interface

## User Documentation
 - [User documentation](https://yaptide.github.io/docs/) - guide for users

## For users

The development demo version is unstable, without many features and with a lot of bugs.
It is released automatically after every commit to the main branch of this repository and is available for testing here:
<https://yaptide.github.io/web_dev/>

The stable demo version is available at <https://yaptide.github.io/>

## For developers

[Developer documentation](https://yaptide.github.io/for_developers/frontend/)

### Local authentication options

Authentication methods can be selected at start/build time with
`REACT_APP_AUTH_BASIC_ENABLED` (username/password) and
`REACT_APP_AUTH_SSO_ENABLED` (Keycloak SSO). Set either to `true` to enable it;
set it to `false` to disable it, unless `REACT_APP_ALT_AUTH=plg`, which enables
SSO for the PLGrid variant. Both methods are disabled when the variables are
omitted in demo mode. Explicitly setting a method to `true` enables it even in
demo mode. Outside demo mode, omitted values default to basic login unless
`REACT_APP_ALT_AUTH=plg`, in which case SSO is enabled instead. Basic login is
also hidden when the backend reports `local_users_enabled: false`.

For example, start the local frontend against a backend with username/password
login only:

```sh
REACT_APP_BACKEND_URL=http://localhost:5000 \
REACT_APP_AUTH_BASIC_ENABLED=true \
REACT_APP_AUTH_SSO_ENABLED=false \
npm start
```

Set both authentication variables to `true` to offer both login methods.
`start-demo` and `build-demo` disable both methods by default; for example,
`REACT_APP_AUTH_BASIC_ENABLED=true npm run start-demo` enables password login
in the local demo. `start-plg` and `build-plg` enable SSO only. The GitHub Pages
deployment explicitly disables both methods. These values are embedded in the
frontend bundle, so restart the dev server or rebuild after changing them.
