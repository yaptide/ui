import React from 'react';
import JsRootGraph1D from './JsRootGraph1D';
import JsRootGraph2D from './JsRootGraph2D';
import JsRootGraph0D from './JsRootGraph0D';
import { Box, Button, Card, CardContent, Grid, Paper, Typography } from '@mui/material';
import { saveString } from '../util/File';
import { estimatorPageToCsv } from '../util/csv/Csv';
import { ScoringOutputJSON } from '../ThreeEditor/util/Scoring/ScoringOutput';
import { FilterJSON } from '../ThreeEditor/util/Detect/DetectFilter';
import { ScoringQuantityJSON } from '../ThreeEditor/util/Scoring/ScoringQuantity';

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
	metadata?: unknown;
	dimensions: 1;
	first_axis: pageData;
};

export type Page0D = {
	data: pageData;
	dimensions: 0;
};

export type Estimator = {
	name: string;
	metadata?: unknown;
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
		return <JsRootGraph1D page={page} title={title}  />;
	} else if (isPage0d(page)) {
		return <JsRootGraph0D page={page} title={title}  />;
	} else {
		return <div>Error</div>;
	}
};

export function generateGraphs(estimator: Estimator, FiltersJSON: FilterJSON[]) {
	const { pages, name, scoringOutputJsonRef } = estimator;

	const onClickSaveToFile = (page: Page1D) => {
		saveString(
			estimatorPageToCsv(estimator, page),
			`graph_${name}_${page.data.name.replace(/ /g, '_')}.csv`
		);
	};
	return pages
		.map((page, idx) => {
			const quantity: ScoringQuantityJSON = scoringOutputJsonRef!.quantities.active[idx];
			const filter = FiltersJSON.find(o => o.uuid === quantity.filter);
			return { graph: getGraphFromPage(page, quantity?.name), filter };
		})
		.map(({ graph, filter }, idx) => {
			return (
				<Grid key={`graph_${name}_${idx}`} item xs={12}>
					<Card>
						<CardContent>
							<Grid container>
								<Grid item xs={8}>
									{graph}
								</Grid>
								<Grid item xs={4}>
									<Box sx={{ marginTop: '1rem' }}>
										<Typography variant='h5'>Filter:</Typography>
										<Typography>{filter?.name ?? 'None'}</Typography>
										{filter && (
											<Box>
											<Typography variant='h6'>Rules:</Typography>											
											{filter.rules.map((rule, idx) => (<Typography>{rule.keyword}{rule.operator}{rule.value}</Typography>))}
											</Box>

										)}
									</Box>

									{isPage1d(pages[idx]) && (
										<Button sx={{ marginTop: '1rem' }}
											onClick={() => onClickSaveToFile(pages[idx] as Page1D)}>
											EXPORT GRAPH TO CSV
										</Button>
									)}
								</Grid>
							</Grid>
						</CardContent>
					</Card>
				</Grid>
			);
		});
}
