import React, { useEffect, useState } from 'react';
import Skeleton from '@mui/material/Skeleton';
import { useJSROOT } from './JsRootService';
import { useVisible } from 'react-hooks-visible';
import { Page2D } from './GraphData';

export function JsRootGraph2D(props: { page: Page2D; title?: string }) {
	const { page, title } = props;
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
		const x = page.first_axis.values;
		const y = page.second_axis.values;
		const z = page.data.values;

		const nxpoints = x.length;
		const nypoints = y.length;

		const histogram = JSROOT.createHistogram('TH2F', nxpoints, nypoints);

		histogram.fTitle = title;

		histogram.fXaxis.fXmin = x[0];
		histogram.fXaxis.fXmax = x[nxpoints - 1];
		histogram.fXaxis.fTitle = `${page.first_axis.name} [${page.first_axis.unit}]`;

		histogram.fYaxis.fXmin = y[0];
		histogram.fYaxis.fXmax = y[nypoints - 1];
		histogram.fYaxis.fTitle = `${page.second_axis.name} [${page.second_axis.unit}]`;

		// centering axes labels using method suggested here:
		// https://github.com/root-project/jsroot/issues/225#issuecomment-998748035
		histogram.fXaxis.InvertBit(JSROOT.BIT(12));
		histogram.fYaxis.InvertBit(JSROOT.BIT(12));

		// moving axes labels a bit away from axis object, as described here:
		// https://github.com/root-project/jsroot/issues/239
		histogram.fXaxis.fTitleOffset = 1.4;
		histogram.fYaxis.fTitleOffset = 1.4;

		histogram.fTitle = `${page.data.name} [${page.data.unit}]`;

		for (let x = 0; x < nxpoints; x++)
			for (let y = 0; y < nypoints; y++) {
				// JSROOT hist object has bins indexed from 1, arrays are indexed from 0
				histogram.setBinContent(histogram.getBin(x + 1, y + 1), z[x + y * nxpoints]);
			}

		setObj(histogram);
		setDrawn(false);
	}, [JSROOT, page, visible]);

	useEffect(() => {
		if (obj && !drawn && isVisible) {
			JSROOT.cleanup(containerEl.current);
			JSROOT.redraw(containerEl.current, obj, 'colz;gridxy;nostat;tickxy');
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

export default JsRootGraph2D;
