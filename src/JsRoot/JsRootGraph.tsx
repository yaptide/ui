
import useResizeObserver from '@react-hook/resize-observer';
import React, { useEffect, useRef, useState } from 'react';
import { useJSROOT } from './JsRootService';


interface JsRootGraphProps {
    data?: Object
}

function JsRootGraph(props: JsRootGraphProps) {
    const { JSROOT } = useJSROOT();

    const containerEl = useRef<HTMLDivElement>(null);
    const [obj, setObj] = useState(undefined);


    useEffect(() => {


        // create example graph
        const nbinsx = 20;
        const y = Array.from({ length: nbinsx }, () => Math.floor(Math.random() * 40));
        const x = Array.from({ length: nbinsx }, (v, k) => k);

        const h1 = JSROOT.createTGraph(nbinsx, x, y);

        setObj(h1);
    }, [JSROOT]);

    useEffect(() => {

        if (obj) {
            JSROOT.cleanup(containerEl.current);
            JSROOT.draw(containerEl.current, obj, "")
        }

    }, [JSROOT, obj, containerEl]);

    useResizeObserver(containerEl, (entry) => {
        console.log(entry.contentRect)
    })

    return (
        <div style={{ width: 400, height: 400 }} ref={containerEl} />
    );
}

export default JsRootGraph;