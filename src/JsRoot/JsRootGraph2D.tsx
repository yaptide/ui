import React, { useEffect, useState } from 'react';
import Skeleton from '@mui/material/Skeleton';
import { useJSROOT } from './JsRootService';
import { useVisible } from 'react-hooks-visible';
import { Page2D } from './GraphData';

export function JsRootGraph2D(props: Page2D) {
	const { JSROOT } = useJSROOT();
	const [containerEl, visible] = useVisible<HTMLDivElement>();

	const [obj, setObj] = useState(undefined);
	const [drawn, setDrawn] = useState(false);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		setIsVisible(visible > 0.3);
		return () => setIsVisible(false);
	}, [visible]);

	useEffect(() => {
		if (drawn || !visible) return;
        const x = props.first_axis.values;
        const y = props.second_axis.values;
        const z = props.data.values
		
		// JSRoot is unable to draw bins with value from the end of the range unless there is at least
		//  one negative number, therefore we swap the first zero we find for -epsilon ¯\_(ツ)_/¯
		const min_idx = z.findIndex(val => val===0)
		z[min_idx] = -Number.EPSILON

		const nxpoints = x.length
		const nypoints = y.length

        const gr = JSROOT.createHistogram("TH2F", nxpoints, nypoints);

        gr.fXaxis.fXmin = x[0]
        gr.fXaxis.fXmax = x[nxpoints-1]
		gr.fXaxis.fTitle = `${props.first_axis.name} [${props.first_axis.unit}]`

        gr.fYaxis.fXmin = y[0]
        gr.fYaxis.fXmax = y[nypoints-1]
		gr.fYaxis.fTitle = `${props.second_axis.name} [${props.second_axis.unit}]`

        gr.fTitle = `${props.data.name} [${props.data.unit}]`;
	
		
		for( let x=0; x<nxpoints; x++)
			for( let y=0; y<nypoints; y++){
				gr.setBinContent(gr.getBin(x+1,y+1), z[x + y*nxpoints]);
			}

		setObj(gr);
		setDrawn(false);
	}, [JSROOT, props, drawn, visible]);

	useEffect(() => {
		if (obj && !drawn && isVisible) {
			JSROOT.cleanup(containerEl.current);
			JSROOT.redraw(containerEl.current, obj, 'col');
			setDrawn(true);
		}
	}, [JSROOT, containerEl, drawn, obj, isVisible]);

	return (
		<div style={{ width: 500, height: 500, display:'flex',alignItems:'center',justifyContent:'center'}} ref={containerEl}>
			<Skeleton hidden={drawn} variant="rectangular" width={'80%'} height={'80%'} />
		</div>
	);
}

export default JsRootGraph2D;
