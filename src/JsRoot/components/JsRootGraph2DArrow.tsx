// Corrected import based on image_d195e1.png
import { Table, tableFromIPC } from 'apache-arrow';
import { BIT, createHistogram } from 'jsroot';
import React, { useEffect } from 'react';

import { GraphCanvas, useJsRootCanvas } from '../hook/useJsRootCanvas';

interface JsRootGraph2DArrowProps {
	table: Table;
	title?: string;
}

export function JsRootGraph2DArrow({ table, title }: JsRootGraph2DArrowProps) {
	const { update, ref } = useJsRootCanvas('colz;gridxy;nostat;tickxy');

	useEffect(() => {
		update(() => {
			const meta = table.schema.metadata;

			const nx = parseInt(meta.get('nx') || '0');
			const ny = parseInt(meta.get('ny') || '0');

			const zColumn = table.getChild('z');

			if (!zColumn || nx === 0 || ny === 0) return null;

			const zValues = zColumn.toArray();

			const xMin = parseFloat(meta.get('x_min') || '0');
			const xMax = parseFloat(meta.get('x_max') || '1');
			const yMin = parseFloat(meta.get('y_min') || '0');
			const yMax = parseFloat(meta.get('y_max') || '1');

			const histogram = createHistogram('TH2F', nx, ny);

			histogram.fXaxis.fXmin = xMin;
			histogram.fXaxis.fXmax = xMax;
			histogram.fXaxis.fTitle = meta.get('x_title') || 'X Axis';

			histogram.fYaxis.fXmin = yMin;
			histogram.fYaxis.fXmax = yMax;
			histogram.fYaxis.fTitle = meta.get('y_title') || 'Y Axis';

			histogram.fXaxis.InvertBit(BIT(12));
			histogram.fYaxis.InvertBit(BIT(12));
			histogram.fXaxis.fTitleOffset = 1.4;
			histogram.fYaxis.fTitleOffset = 1.4;
			histogram.fTitle = title ?? meta.get('main_title') ?? 'Arrow Data Plot';

			for (let i = 0; i < nx; i++) {
				for (let j = 0; j < ny; j++) {
					const bin = histogram.getBin(i + 1, j + 1);
					const val = zValues[i + j * nx];
					histogram.setBinContent(bin, val);
				}
			}

			return histogram;
		});
	}, [table, title, update]);

	return <GraphCanvas ref={ref} />;
}
