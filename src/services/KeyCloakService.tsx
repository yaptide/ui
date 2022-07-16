import { ReactNode } from 'react';
import { ReactKeycloakProvider } from "@react-keycloak/web";
import { keycloak } from '../keycloak';

export interface KeycloakAuthProps {
    children: ReactNode;
}

const KeycloakAuth = (props: KeycloakAuthProps) => {

    return <ReactKeycloakProvider authClient={keycloak}>
        {props.children}
    </ReactKeycloakProvider>
}

export { KeycloakAuth } 