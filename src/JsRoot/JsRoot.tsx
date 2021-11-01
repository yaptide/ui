import Loader from "../Loader/Loader";
import makeAsyncScriptLoader from "react-async-script";
import React, { useEffect, useRef, useState } from 'react';

const urlJSROOT = 'https://root.cern.ch/js/latest/scripts/JSRoot.core.js';
const keyJSROOT = 'JSROOT';

declare global {
    interface Window { [keyJSROOT]: any; }
}

const AsyncLoader = makeAsyncScriptLoader(urlJSROOT, { globalName: keyJSROOT })(Loader);

function JsRoot() {
    const containerEl = useRef(null);
    const [obj, setObj] = useState(undefined);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    const isLoaded = () => {
        const { JSROOT } = window;

        // create example graph
        const nbinsx = 20;
        const y = Array.from({ length: nbinsx }, () => Math.floor(Math.random() * 40));
        const x = Array.from({ length: nbinsx }, (v, k) => k);

        let h1 = JSROOT.createTGraph(nbinsx, x, y);

        setObj(h1);
        setScriptLoaded(true);
    }

    useEffect(() => {
        const { JSROOT } = window;

        if (scriptLoaded && obj)
            JSROOT.draw(containerEl.current, obj,"L");
    }, [obj, scriptLoaded])

    return (
        scriptLoaded ?
            <div>
                <div style={{ width: 480, height: 480 }} ref={containerEl} />
            </div>
            :
            <AsyncLoader asyncScriptOnLoad={isLoaded} />
    );
}

export default JsRoot;