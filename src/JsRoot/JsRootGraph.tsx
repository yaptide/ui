import React, { useEffect, useRef, useState } from 'react';
import { useJSROOT } from './JsRootService';
interface JsRootGraphProps {
    data?: any
}

function JsRootGraph(props: JsRootGraphProps) {
    const { JSROOT } = useJSROOT();

    const containerEl = useRef<HTMLDivElement>(null);
    const [obj, setObj] = useState(undefined);


    useEffect(() => {
        // create example graph
        const nbinsx = props.data?.value ?? 20;
        const y = Array.from({ length: nbinsx }, () => Math.floor(Math.random() * 20));
        const x = Array.from({ length: nbinsx }, (v, k) => k);

        const h1 = JSROOT.createTGraph(nbinsx, x, y);
        h1.fTitle = props.data?.title ?? "Histogram title";

        setObj(h1);
    }, [JSROOT, props.data]);

    useEffect(() => {

        if (obj) {
            JSROOT.cleanup(containerEl.current);
            JSROOT.redraw(containerEl.current, obj, "");
        }

    }, [JSROOT, obj]);

    return (
        <div style={{ width: 400, height: 400 }} ref={containerEl} />
    );
}

export default JsRootGraph;