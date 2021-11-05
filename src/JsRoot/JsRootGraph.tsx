import React, {useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { useJSROOT } from './JsRootService';
import { useVisible } from 'react-hooks-visible'

interface IGraphData {
    uuid: string | number
    title: string
    value: number
}
interface JsRootGraphProps {
    data?: IGraphData
}


function JsRootGraph(props: JsRootGraphProps) {
    const { JSROOT } = useJSROOT();
    const [containerEl, visible] = useVisible<HTMLDivElement>();

    const [obj, setObj] = useState(undefined);
    const [drawn, setDrawn] = useState(false);


    useEffect(() => {
        // create example graph
        const npoints = props.data?.value ?? 20;
        const y = Array.from({ length: npoints }, () => Math.floor(Math.random() * 20));
        const x = Array.from({ length: npoints }, (v, k) => k);

        const gr = JSROOT.createTGraph(npoints, x, y);
        gr.fTitle = props.data?.title ?? "Plot title";

        setObj(gr);
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