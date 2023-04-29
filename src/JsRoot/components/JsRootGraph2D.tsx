import React, { useCallback, useEffect, useState } from 'react';
import Skeleton from '@mui/material/Skeleton';
import { useJSROOT } from '../../services/JsRootService';
import { useVisible } from 'react-hooks-visible';
import useResizeObserver from 'use-resize-observer';
import { throttle } from 'throttle-debounce';
import { mergeRefs } from 'react-merge-refs';
import { Page2D } from '../GraphData';

export function JsRootGraph2D(props: { page: Page2D; title?: string }) {
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
		const x = page.axisDim1.values;
		const y = page.axisDim2.values;
		const z = page.data.values;

		const nxpoints = x.length;
		const nypoints = y.length;

		const histogram = JSROOT.createHistogram('TH2F', nxpoints, nypoints);

		histogram.fXaxis.fXmin = x[0];
		histogram.fXaxis.fXmax = x[nxpoints - 1];
		histogram.fXaxis.fTitle = `${page.axisDim1.name} [${page.axisDim1.unit}]`;

		histogram.fYaxis.fXmin = y[0];
		histogram.fYaxis.fXmax = y[nypoints - 1];
		histogram.fYaxis.fTitle = `${page.axisDim2.name} [${page.axisDim2.unit}]`;

		// centering axes labels using method suggested here:
		// https://github.com/root-project/jsroot/issues/225#issuecomment-998748035
		histogram.fXaxis.InvertBit(JSROOT.BIT(12));
		histogram.fYaxis.InvertBit(JSROOT.BIT(12));

		// moving axes labels a bit away from axis object, as described here:
		// https://github.com/root-project/jsroot/issues/239
		histogram.fXaxis.fTitleOffset = 1.4;
		histogram.fYaxis.fTitleOffset = 1.4;

		histogram.fTitle = title ?? `${page.data.name} [${page.data.unit}]`;

		for (let x = 0; x < nxpoints; x++)
			for (let y = 0; y < nypoints; y++) {
				// JSROOT hist object has bins indexed from 1, arrays are indexed from 0
				histogram.setBinContent(histogram.getBin(x + 1, y + 1), z[x + y * nxpoints]);
			}

		setObj(histogram);
		setDrawn(false);
	}, [JSROOT, page, title, visible]);

	useEffect(() => {
		if (obj && !drawn) {
			JSROOT.redraw(containerEl.current, obj, 'colz;gridxy;nostat;tickxy');
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

export default JsRootGraph2D;
