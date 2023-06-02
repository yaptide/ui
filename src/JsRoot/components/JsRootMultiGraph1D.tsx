import React, { useCallback, useEffect, useState } from 'react';
import Skeleton from '@mui/material/Skeleton';
import { useJSROOT } from '../../services/JsRootService';
import { useVisible } from 'react-hooks-visible';
import { GroupedPage1D } from '../GraphData';
import useResizeObserver from 'use-resize-observer';
import { mergeRefs } from 'react-merge-refs';
import { throttle } from 'throttle-debounce';

export function JsRootMultiGraph1D(props: { page: GroupedPage1D; title?: string }) {
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
		function CreateLegendEntry(obj: any, lbl: any) {
			let entry = JSROOT.create('TLegendEntry');
			entry.fObject = obj;
			entry.fLabel = lbl;
			entry.fOption = 'l';
			return entry;
		}

		// create example graph
		const graphs = page.pages.map((page, index) => {
			const npoints = page.data.values.length;
			const y = page.data.values;
			const x = page.axisDim1.values;

			const graph = JSROOT.createTGraph(npoints, x, y);
			graph.fName = page.name;
			graph.fLineColor = index;

			return graph;
		});

		const multiGraph = JSROOT.createTMultiGraph(...graphs);

		const histogram = JSROOT.createHistogram(
			'TH1F',
			Math.max(...page.pages.map(p => p.data.values.length))
		);

		histogram.fXaxis.fXmin = Math.min(...page.pages.map(p => p.axisDim1.values[0]));
		histogram.fXaxis.fXmax = Math.max(
			...page.pages.map(p => p.axisDim1.values[p.axisDim1.values.length - 1])
		);

		histogram.fYaxis.fXmin = Math.min(...page.pages.map(p => p.data.values[0]));
		histogram.fYaxis.fXmax = Math.max(
			...page.pages.map(p => p.data.values[p.data.values.length - 1])
		);

		histogram.fXaxis.fTitle = `[${page.axisDim1Unit}]`;
		histogram.fYaxis.fTitle = `[${page.dataUnit}]`;
		histogram.fTitle = `${page.name}`;

		// centering axes labels using method suggested here:
		// https://github.com/root-project/jsroot/issues/225#issuecomment-998748035
		histogram.fXaxis.InvertBit(JSROOT.BIT(12));
		histogram.fYaxis.InvertBit(JSROOT.BIT(12));

		// moving axes labels a bit away from axis object, as described here:
		// https://github.com/root-project/jsroot/issues/239
		histogram.fXaxis.fTitleOffset = 1.4;
		histogram.fYaxis.fTitleOffset = 1.4;

		multiGraph.fHistogram = histogram;

		const leg = JSROOT.create('TLegend');

		graphs.forEach((graph, index) => {
			leg.fPrimitives.Add(CreateLegendEntry(graph, graph.fName));
		});

		multiGraph.fFunctions.Add(leg, '');

		setObj(multiGraph);
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
			<Skeleton
				hidden={drawn}
				variant='rectangular'
				width={'80%'}
				height={'80%'}
			/>
		</div>
	);
}

export default JsRootMultiGraph1D;
