# Sequence diagrams

## Keycloak

Overview of login and logout process using keycloak

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant AuthService
    participant Keycloak
    participant Backend

    User ->> AuthService: Request login
    AuthService ->> Keycloak: Redirect to keycloak login
    User ->> Keycloak: Login with credentials
    Keycloak ->> AuthService: Return authenticated token
    AuthService ->> AuthService: Check token for access to yaptide
    opt user has access
        AuthService ->> Backend: Verify token with backend (POST /auth/keycloak)
        Backend ->> Keycloak: Verify if token is correct
        opt token verified
            Keycloak ->> Backend: Signature verified
            Backend ->> AuthService: Response with accessExp
            AuthService ->> AuthService: Set token refresh interval based on accessExp
            AuthService ->> User: Provide auth context
        end
        opt signature expired or invalid token or keycloak connection error
            Backend ->> AuthService: Raise exception Forbidden (403)
        end
    end
    opt user doesn't have access
        AuthService ->> User: Message with access denied
    end
    loop Check backend availability every 3 minutes
        AuthService ->> Backend: (GET /)
        Backend ->> AuthService: Response with 'Hello World!'
    end
    loop Refresh backend token every backend access token lifetime
        AuthService ->> Backend: Refresh token (GET auth/keycloak)
        Backend ->> AuthService: Response with new backend access token in cookies and new accessExp
    end
    loop Refresh keycloak token every 1/3 of keycloak access tokens lifetime
        AuthService ->> Keycloak: Refresh token
        Keycloak ->> AuthService: Updated access token and refresh token
    end
    User ->> AuthService: Logout
    AuthService ->> Backend: Invalidate session (DELETE /auth/logout)
    Backend ->> AuthService: Response with cookies deleted
    AuthService ->> Keycloak: Logout
    AuthService ->> User: Clear user data
```

-   **User requests login**: User initiates login with SSO.
-   **Redirect to Keycloak**: AuthService redirects user to Keycloak login.
-   **User login with credentials**: User provides credentials on Keycloak.
-   **Authenticated token returned**: Keycloak provides AuthService with an authenticated token.
-   **Token access check**: AuthService checks token for access to Yaptide (token includes PLG_YAPTIDE_ACCESS value)

-   **User access verification**:

    -   **If user has access**:
        AuthService verifies token with Backend.
        Backend confirms token with Keycloak.
        -   **If verified**:
            Keycloak validates the token signature.
            Backend provides access expiration (`accessExp`) to AuthService.
            AuthService sets token refresh interval based on `accessExp` (backend token valid time).
            User receives authentication context.
        -   **If verification fails**: Backend sends "Forbidden" error due to invalid/expired token or Keycloak error.
    -   **If user lacks access**: AuthService informs user of access denial.

-   **Backend connection check**: Every 3 minutes, AuthService checks backend availability.
-   **Backend token periodic refresh**:

    -   Every backend token lifetime (`accessExp`), AuthService requests a token refresh from Backend.
    -   Backend responds with a new access token in cookies and an updated `accessExp`.

-   **Keycloak token periodic refresh**:

    -   Every 1/3 of the keycloak access token's lifetime, AuthService refreshes the Keycloak token.
    -   Keycloak provides an updated access token and refresh token to AuthService.

-   **Logout process**:
    -   User initiates logout.
    -   AuthService invalidates Backend session.
    -   Backend deletes session cookies.
    -   AuthService logs user out of Keycloak and clears user data.

## Non-Keycloak

Overview of login and logout process while in demo or dev modes

```mermaid
sequenceDiagram
    autonumber
    participant User
    participant AuthService
    participant Backend

    User ->> AuthService: Request Login
    AuthService ->> Backend: Validate Credentials (POST /auth/login)
    Backend ->> AuthService: Response with accessExp and set access and refresh tokens in cookies
    AuthService ->> User: Provide Auth Context
    loop Check backend availability every 3 minutes
        AuthService ->> Backend: (GET /)
        Backend ->> AuthService: Response with 'Hello World!'
    end
    loop Refresh backend connection every 1/3 of accessExp
        AuthService ->> Backend: Refresh token (GET auth/refresh)
        Backend ->> AuthService: Response with new backend access token in cookies and accessExp
    end
    User ->> AuthService: Logout
    AuthService ->> Backend: Invalidate session (DELETE /auth/logout)
    Backend ->> AuthService: Response with cookies deleted
    AuthService ->> User: Clear User Data
```

-   **User login request**: User requests login through AuthService.

-   **Credential validation**:

    -   AuthService sends login credentials to Backend for validation.
    -   Backend responds with `accessExp`, setting access and refresh tokens in cookies.

-   **Provide authentication context**: AuthService provides the authenticated context to the user.

-   **Backend availability check**:

    -   Every 3 minutes, AuthService checks Backend availability.
    -   Backend responds with a "Hello World!" message.

-   **Backend token refresh**:

    -   Every 1/3 of `accessExp` (1/3 of Backend access token), AuthService refreshes the token with Backend.
    -   Backend returns a new access token in cookies and an updated `accessExp`.

-   **Logout process**:
    -   User initiates logout.
    -   AuthService sends a session invalidation request to Backend.
    -   Backend deletes session cookies, confirming logout.
    -   AuthService clears the user's data.

## Default vaules

-   Keycloak access token - 5 min valid time
-   Keycloak refresh token - 30 min valid time

-   Backend access token - 10 min valid time
-   Backend refresh token - 120 min valid time
