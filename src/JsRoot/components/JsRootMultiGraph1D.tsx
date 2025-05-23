import { BIT, create, createHistogram, createTGraph, createTMultiGraph } from 'jsroot';
import React, { useEffect } from 'react';

import { GroupedPage1D, MAX_SCALING_FACTOR } from '../GraphData';
import { GraphCanvas, useJsRootCanvas } from '../hook/useJsRootCanvas';

export function JsRootMultiGraph1D(props: { page: GroupedPage1D; title?: string }) {
	const { page } = props;
	const { update, ref } = useJsRootCanvas('AL;gridxy;tickxy');

	useEffect(() => {
		update(() => {
			function CreateLegendEntry(obj: any, lbl: any) {
				let entry = create('TLegendEntry');
				entry.fObject = obj;
				entry.fLabel = lbl;
				entry.fOption = 'l';

				return entry;
			}

			let yLabels = new Set<string>();
			let xLabels = new Set<string>();

			// create example graph
			const graphs = page.pages.map((page, index) => {
				const npoints = page.data.values.length;
				const y = page.data.values;
				const x = page.axisDim1.values;

				yLabels.add(page.data.name);
				xLabels.add(page.axisDim1.name);

				const graph = createTGraph(npoints, x, y);
				graph.fName = page.name;
				graph.fLineColor = index + 2;

				return graph;
			});

			const multiGraph = createTMultiGraph(...graphs);

			const histogram = createHistogram(
				'TH1F',
				Math.max(...page.pages.map(p => p.data.values.length))
			);

			histogram.fXaxis.fXmin = Math.min(...page.pages.map(p => p.axisDim1.values[0]));
			histogram.fXaxis.fXmax = Math.max(
				...page.pages.map(p => p.axisDim1.values[p.axisDim1.values.length - 1])
			);

			histogram.fMinimum = Math.min(...page.pages.flatMap(p => p.data.values));
			// Apply a scaling factor to the maximum value of the Y-axis to ensure proper visualization
			// and avoid clipping of data points near the upper boundary.
			histogram.fMaximum =
				Math.max(...page.pages.flatMap(p => p.data.values)) * MAX_SCALING_FACTOR;

			const joinLabels = (labels: Set<string>) => {
				return Array.from(labels.values()).join(' | ');
			};

			histogram.fXaxis.fTitle = `${joinLabels(xLabels)} [${page.axisDim1Unit}]`;
			histogram.fYaxis.fTitle = `${joinLabels(yLabels)} [${page.dataUnit}]`;
			histogram.fTitle = `${page.name}`;

			// centering axes labels using method suggested here:
			// https://github.com/root-project/jsroot/issues/225#issuecomment-998748035
			histogram.fXaxis.InvertBit(BIT(12));
			histogram.fYaxis.InvertBit(BIT(12));

			// moving axes labels a bit away from axis object, as described here:
			// https://github.com/root-project/jsroot/issues/239
			histogram.fXaxis.fTitleOffset = 1.4;
			histogram.fYaxis.fTitleOffset = 1.4;

			multiGraph.fHistogram = histogram;

			const legHeight = Math.min(graphs.length * 0.05, 0.25);

			const leg = create('TLegend');
			Object.assign(leg, {
				fX1NDC: 0.1,
				fY1NDC: 0.5,
				fX2NDC: 0.5,
				fY2NDC: 0.5 + legHeight
			});

			graphs.forEach((graph, index) => {
				leg.fPrimitives.Add(CreateLegendEntry(graph, graph.fName), 'autoplace');
			});
			multiGraph.fFunctions.Add(leg, '');

			return multiGraph;
		});
	}, [page, update]);

	return <GraphCanvas ref={ref} />;
}

export default JsRootMultiGraph1D;
