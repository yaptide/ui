import Loader from "../Loader/Loader";
import makeAsyncScriptLoader from "react-async-script";
import React, { useEffect, useRef, useState } from 'react';

const URL = `https://root.cern.ch/js/latest/scripts/JSRoot.core.js`;
const globalName = "JSROOT";



function JsRoot() {
    const containerEl = useRef(null);
    let [obj, setObj] = useState(undefined);
    let [isDrawn, setIsDrawn] = useState(false);
    let [scriptLoaded, setScriptLoaded] = useState(false);
    let JSROOT:any;
    const AsyncLoader = makeAsyncScriptLoader(URL,{globalName})(Loader);
    
    const isLoaded = () => {
        console.log((window as any).JSROOT);
        JSROOT = (window as any).JSROOT;
        JSROOT.openFile("./files/hsimple.root")
            .then((file : any) => file.readObject("hpxpy;1"))
            .then((obj : any) => {
                setObj(obj) ;
                setScriptLoaded(true);
            });
    }
    useEffect(() => {
        JSROOT = (window as any).JSROOT as any;
        if(scriptLoaded && obj){
            JSROOT.draw(containerEl.current, obj, "colz")
            .then(() => {setIsDrawn(true)})
        }
    }, [obj,scriptLoaded])
    if(scriptLoaded){
        return(<div>
            <div style={{ width: 480, height: 480 }} ref={containerEl} />
        </div>)
    }
    return (<AsyncLoader
        asyncScriptOnLoad={isLoaded}
    />);
}

export default JsRoot;