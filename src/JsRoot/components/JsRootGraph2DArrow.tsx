import { Table } from 'apache-arrow';
import { BIT, createHistogram } from 'jsroot';
import { useEffect } from 'react';

import { GraphCanvas, useJsRootCanvas } from '../hook/useJsRootCanvas';

interface JsRootGraph2DArrowProps {
	table: Table;
	title?: string;
}

export function JsRootGraph2DArrow({ table, title }: JsRootGraph2DArrowProps) {
	const { update, ref } = useJsRootCanvas('colz;gridxy;nostat;tickxy');

	useEffect(() => {
		update(() => {
			if (table.batches.length === 0) {
				return null;
			}

			const batch = table.batches[0];
			const metadata = batch.schema.metadata;

			const dataName = metadata.get('data_name') || 'Data';
			const dataUnit = metadata.get('data_unit') || '';

			const axis1 = JSON.parse(metadata.get('axis_dim1') || '{}') as any;
			const axis2 = JSON.parse(metadata.get('axis_dim2') || '{}') as any; // TODO

			const valuesCol = batch.getChildAt(0);

			if (!valuesCol) return null;

			const zTyped = valuesCol.toArray(); // Float64Array
			const xTyped = axis1.values;
			const yTyped = axis2.values;

			const nxpoints = xTyped.length;
			const nypoints = yTyped.length;

			const histogram = createHistogram('TH2F', nxpoints, nypoints);

			histogram.fXaxis.fXmin = xTyped[0];
			histogram.fXaxis.fXmax = xTyped[nxpoints - 1];
			histogram.fXaxis.fTitle = `${axis1.name} [${axis1.unit}]`;

			histogram.fYaxis.fXmin = yTyped[0];
			histogram.fYaxis.fXmax = yTyped[nypoints - 1];
			histogram.fYaxis.fTitle = `${axis2.name} [${axis2.unit}]`;

			histogram.fXaxis.InvertBit(BIT(12));
			histogram.fYaxis.InvertBit(BIT(12));

			histogram.fXaxis.fTitleOffset = 1.4;
			histogram.fYaxis.fTitleOffset = 1.4;

			histogram.fTitle = title ?? `${dataName} [${dataUnit}]`;

			// zTyped is a flat array, indexing by x + y * nxpoints
			for (let x = 0; x < nxpoints; x++) {
				for (let y = 0; y < nypoints; y++) {
					const zIndex = x + y * nxpoints;

					if (zIndex < zTyped.length) {
						histogram.setBinContent(histogram.getBin(x + 1, y + 1), zTyped[zIndex]);
					}
				}
			}

			return histogram;
		});
	}, [table, title, update]);

	return <GraphCanvas ref={ref} />;
}

export default JsRootGraph2DArrow;
