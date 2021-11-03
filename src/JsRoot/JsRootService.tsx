import { ReactNode, useEffect, useState } from "react";
import { createGenericContext } from "../util/GenericContext";
import makeAsyncScriptLoader from "react-async-script";

const JsRootUrl = 'https://root.cern.ch/js/latest/scripts/JSRoot.core.js';
const JsRootPainterUrl = 'https://root.cern.ch/js/latest/scripts/JSRoot.painter.js';
const JsRootKey = 'JSROOT';

declare global {
    interface Window { [JsRootKey]: any; }
}

export interface JsRootProps {
    children: ReactNode,
    JSROOT?: any
}

export interface IJsRoot {
    JSROOT: any
}

const [useJSROOT, JsRootContextProvider] = createGenericContext<IJsRoot>();



const JsRoot = (props: JsRootProps) => {
    const [value, setValue] = useState<IJsRoot>();

    useEffect(() => {
        if (!props.JSROOT) return;

        const script = document.createElement('script');

        script.src = JsRootPainterUrl;
        script.async = false;
        script.onload = () => {
            setTimeout(() => {               
                setValue({ JSROOT: window.JSROOT })
            }, 500);
        };
        document.body.appendChild(script);

    }, [props.JSROOT]);

    return (
        <JsRootContextProvider value={value}>
            {value?.JSROOT && props.children}
        </JsRootContextProvider>
    )
};

const AsyncLoaderJsRoot = makeAsyncScriptLoader(JsRootUrl, { globalName: JsRootKey })(JsRoot);



export {
    useJSROOT,
    AsyncLoaderJsRoot as JsRootService
}


