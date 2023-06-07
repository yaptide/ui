import { useEffect } from 'react';
import { Page1D } from '../GraphData';
import { GraphCanvas, useJsRootCanvas } from '../hook/useJsRootCanvas';

export function JsRootGraph1D(props: { page: Page1D; title?: string }) {
	const { page, title } = props;
	const { update, ref } = useJsRootCanvas('AL;gridxy;tickxy');

	useEffect(() => {
		update(JSROOT => {
			const npoints = page.data.values.length;
			const x = page.axisDim1.values;
			const y = page.data.values;

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

			return graph;
		});
	}, [page, title, update]);

	return <GraphCanvas ref={ref} />;
}

export default JsRootGraph1D;
