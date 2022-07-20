import React, { useEffect, useState } from 'react';
import Skeleton from '@mui/material/Skeleton';
import { useJSROOT } from './JsRootService';
import { useVisible } from 'react-hooks-visible';
import { Page1D } from './GraphData';

export function JsRootGraph1D(props: Page1D) {
	const { JSROOT } = useJSROOT();
	// Custom react hook, visible contains the percentage of the containterEl
	// that is currently visible on screen
	const [containerEl, visible] = useVisible<HTMLDivElement>();

	const [obj, setObj] = useState(undefined);
	const [drawn, setDrawn] = useState(false);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		// Update isVisible if more than 30% of containerEl is visible
		setIsVisible(visible > 0.3);
		return () => setIsVisible(false);
	}, [visible]);

	useEffect(() => {
		if (!visible) return;
		// create example graph
		const npoints = props.data.values.length;
		const y = props.data.values;
		const x = props.first_axis.values;

		const graph = JSROOT.createTGraph(npoints, x, y);
		
		// adding name using method suggested here:
		// https://github.com/root-project/jsroot/issues/225#issuecomment-998260751
		const histogram = JSROOT.createHistogram('TH1F', npoints);
		histogram.fXaxis.fXmin = x[0];
		histogram.fXaxis.fXmax = x[npoints - 1];
		histogram.fXaxis.fTitle = `${props.first_axis.name} [${props.first_axis.unit}]`;

		histogram.fYaxis.fXmin = y[0];
		histogram.fYaxis.fXmax = y[npoints - 1];
		histogram.fYaxis.fTitle = `${props.data.name} [${props.data.unit}]`;

		// centering axes labels using method suggested here:
		// https://github.com/root-project/jsroot/issues/225#issuecomment-998748035
		histogram.fXaxis.InvertBit(JSROOT.BIT(12));
		histogram.fYaxis.InvertBit(JSROOT.BIT(12));

		// moving axes labels a bit away from axis object, as described here:
		// https://github.com/root-project/jsroot/issues/239
		histogram.fXaxis.fTitleOffset = 1.4;
		histogram.fYaxis.fTitleOffset = 1.4;

		graph.fName = props.data.name;
		graph.fTitle = `${props.data.name} [${props.data.unit}]`;
		graph.fHistogram = histogram

		setObj(graph);
		setDrawn(false);
	}, [JSROOT, props, visible]);

	useEffect(() => {
		if (obj && !drawn && isVisible) {
			JSROOT.cleanup(containerEl.current);
			JSROOT.redraw(containerEl.current, obj, 'gridxy;tickxy');
			setDrawn(true);
		}
	}, [JSROOT, containerEl, drawn, obj, isVisible]);

	return (
		<div
			style={{
				width: 500,
				height: 500,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center'
			}}
			ref={containerEl}>
			<Skeleton hidden={drawn} variant='rectangular' width={'80%'} height={'80%'} />
		</div>
	);
}

export default JsRootGraph1D;
