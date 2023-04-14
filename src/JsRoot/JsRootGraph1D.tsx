import React, { useCallback, useEffect, useState } from 'react';
import Skeleton from '@mui/material/Skeleton';
import { useJSROOT } from './JsRootService';
import { useVisible } from 'react-hooks-visible';
import { Page1D } from './GraphData';
import useResizeObserver from 'use-resize-observer';
import { mergeRefs } from 'react-merge-refs';
import { throttle } from 'throttle-debounce';

export function JsRootGraph1D(props: { page: Page1D; title?: string }) {
	const { page, title } = props;
	const { JSROOT } = useJSROOT();
	const {
		ref: resizeRef,
		width: resizeWidth,
		height: resizeHeight
	} = useResizeObserver<HTMLDivElement>();
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
		const npoints = page.data.values.length;
		const y = page.data.values;
		const x = page.axisDim1.values;

		const graph = JSROOT.createTGraph(npoints, x, y);

		// adding name using method suggested here:
		// https://github.com/root-project/jsroot/issues/225#issuecomment-998260751
		const histogram = JSROOT.createHistogram('TH1F', npoints);
		histogram.fXaxis.fXmin = x[0];
		histogram.fXaxis.fXmax = x[npoints - 1];
		histogram.fXaxis.fTitle = `${page.axisDim1.name} [${page.axisDim1.unit}]`;

		histogram.fYaxis.fXmin = y[0];
		histogram.fYaxis.fXmax = y[npoints - 1];
		histogram.fYaxis.fTitle = `${page.data.name} [${page.data.unit}]`;

		// centering axes labels using method suggested here:
		// https://github.com/root-project/jsroot/issues/225#issuecomment-998748035
		histogram.fXaxis.InvertBit(JSROOT.BIT(12));
		histogram.fYaxis.InvertBit(JSROOT.BIT(12));

		// moving axes labels a bit away from axis object, as described here:
		// https://github.com/root-project/jsroot/issues/239
		histogram.fXaxis.fTitleOffset = 1.4;
		histogram.fYaxis.fTitleOffset = 1.4;

		graph.fName = page.data.name;
		graph.fTitle = title ?? `${page.data.name} [${page.data.unit}]`;
		graph.fHistogram = histogram;

		setObj(graph);
		setDrawn(false);
	}, [JSROOT, page, title, visible]);

	useEffect(() => {
		if (obj && !drawn) {
			JSROOT.redraw(containerEl.current, obj, 'gridxy;tickxy');
			setDrawn(true);
		}
	}, [JSROOT, containerEl, drawn, obj]);

	const resizeHandler = useCallback(() => {
		if (isVisible) JSROOT.resize(containerEl.current);
	}, [JSROOT, containerEl, isVisible]);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedResizeHandler = useCallback(
		throttle(300, resizeHandler, { noTrailing: false }),
		[resizeHandler]
	);

	useEffect(() => {
		debouncedResizeHandler();
	}, [debouncedResizeHandler, resizeHeight, resizeWidth]);

	return (
		<div
			style={{
				width: '100%',
				height: 500
			}}
			ref={mergeRefs([containerEl, resizeRef])}>
			<Skeleton hidden={drawn} variant='rectangular' width={'80%'} height={'80%'} />
		</div>
	);
}

export default JsRootGraph1D;
