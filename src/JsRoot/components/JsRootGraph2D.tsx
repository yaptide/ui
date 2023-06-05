import React, { useEffect } from 'react';
import { Page2D } from '../GraphData';
import { useJsRootCanvas, GraphCanvas } from '../hook/useJsRootCanvas';

export function JsRootGraph2D(props: { page: Page2D; title?: string }) {
	const { page, title } = props;
	const { isVisible, JSROOT, setObjToDraw, ref, drawn } = useJsRootCanvas(
		'colz;gridxy;nostat;tickxy'
	);

	useEffect(() => {
		if (!isVisible) return;
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

		setObjToDraw(histogram);
	}, [JSROOT, page, title, isVisible, setObjToDraw]);

	return (
		<GraphCanvas
			ref={ref}
			drawn={drawn}
		/>
	);
}

export default JsRootGraph2D;
