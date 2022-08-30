import React from 'react';
import JsRootGraph1D from './JsRootGraph1D';
import JsRootGraph2D from './JsRootGraph2D';
import JsRootGraph0D from './JsRootGraph0D';
import { Grid } from '@mui/material';
import { ScoringOutputJSON } from '../ThreeEditor/util/Scoring/ScoringOutput';

export type pageData = {
	name: string;
	unit: string;
	values: number[];
};

export type Page2D = {
	data: pageData;
	dimensions: 2;
	first_axis: pageData;
	second_axis: pageData;
};

export type Page1D = {
	data: pageData;
	dimensions: 1;
	first_axis: pageData;
};

export type Page0D = {
	data: pageData;
	dimensions: 0;
};

export type Estimator = {
	name: string;
	pages: Page[];
	scoringOutputJsonRef?: ScoringOutputJSON;
};

export type Page = Page2D | Page1D | Page0D;

export const isPage2d = (page: Page): page is Page2D => {
	return (page as Page2D).dimensions === 2;
};

export const isPage1d = (page: Page): page is Page1D => {
	return (page as Page1D).dimensions === 1;
};

export const isPage0d = (page: Page): page is Page0D => {
	return (page as Page0D).dimensions === 0;
};

const getGraphFromPage = (page: Page, title?: string) => {
	if (isPage2d(page)) {
		return <JsRootGraph2D page={page} title={title} />;
	} else if (isPage1d(page)) {
		return <JsRootGraph1D {...page} />;
	} else if (isPage0d(page)) {
		return <JsRootGraph0D {...page} />;
	} else {
		return <div>Error</div>;
	}
};

export function generateGraphs({ pages, name, scoringOutputJsonRef }: Estimator) {
	return pages
		.map((page, idx) => {			
			return getGraphFromPage(page, scoringOutputJsonRef?.quantities.active[idx].name);
		})
		.map((graph, idx) => {
			return (
				<Grid key={`graph_${name}_${idx}`} item xs={8}>
					{graph}
				</Grid>
			);
		});
}
