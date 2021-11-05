import React, { useCallback, useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { useJSROOT } from './JsRootService';
import { useVisible } from 'react-hooks-visible'

interface JsRootGraphProps {
    data?: any
}

function JsRootGraph(props: JsRootGraphProps) {
    const { JSROOT } = useJSROOT();
    const [containerEl, visible] = useVisible<HTMLDivElement>();

    const [obj, setObj] = useState(undefined);
    const [drawn, setDrawn] = useState(false);


    useEffect(() => {
        // create example graph
        const nbinsx = props.data?.value ?? 20;
        const y = Array.from({ length: nbinsx }, () => Math.floor(Math.random() * 20));
        const x = Array.from({ length: nbinsx }, (v, k) => k);

        const h1 = JSROOT.createTGraph(nbinsx, x, y);
        h1.fTitle = props.data?.title ?? "Histogram title";

        setObj(h1);
        setDrawn(false);
    }, [JSROOT, props.data]);


    useEffect(() => {

        if (obj && !drawn && visible > 0.2) {
            JSROOT.cleanup(containerEl.current);
            JSROOT.redraw(containerEl.current, obj, "");
            setDrawn(true);
        }

    }, [JSROOT, containerEl, drawn, obj, visible]);



    return (
        <div style={{ width: '100%', height: 400 }} ref={containerEl} >
            <CircularProgress hidden={drawn} sx={{ margin: '10px auto', display: 'block' }} />
        </div>
    );
}

export default JsRootGraph;