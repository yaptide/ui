import { Box, Button, Divider, Typography, useTheme } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';

import { isCustomFilterJSON } from '../ThreeEditor/Simulation/Scoring/CustomFilter';
import { isParticleFilterJSON } from '../ThreeEditor/Simulation/Scoring/ParticleFilter';
import { FilterJSON } from '../ThreeEditor/Simulation/Scoring/ScoringFilter';
import { ScoringOutputJSON } from '../ThreeEditor/Simulation/Scoring/ScoringOutput';
import { estimatorPage1DToCsv } from '../util/csv/Csv';
import { saveString } from '../util/File';
import Result3D from '../WrapperApp/components/Results/Results3D';
import { EstimatorResults } from '../WrapperApp/components/Results/ResultsPanel';
import JsRootGraph0D from './components/JsRootGraph0D';
import JsRootGraph1D from './components/JsRootGraph1D';
import JsRootGraph2D from './components/JsRootGraph2D';
import JsRootMultiGraph1D from './components/JsRootMultiGraph1D';

export type pageData = {
	name: string;
	unit: string;
	values: number[];
};
interface IPage {
	filterRef?: FilterJSON;
	name?: string;
	dimensions: number;
}
export interface Page2D extends IPage {
	data: pageData;
	dimensions: 2;
	axisDim1: pageData;
	axisDim2: pageData;
}

export interface Page1D extends IPage {
	data: pageData;
	metadata?: unknown;
	dimensions: 1;
	axisDim1: pageData;
}

export interface GroupedPage1D extends IPage {
	isGrouped: true;
	dataUnit: string;
	axisDim1Unit: string;
	pages: Page1D[];
}

export interface Page0D extends IPage {
	data: pageData;
	dimensions: 0;
}

export interface Page3D extends IPage {
	dimensions: 3;
	resultsUrl: string;
}

export type Estimator = {
	name: string;
	metadata?: unknown;
	pages: Page[];
	scoringOutputJsonRef?: ScoringOutputJSON;
};

export type Page = Page3D | Page2D | Page1D | Page0D | GroupedPage1D;

export const isPage2d = (page: Page): page is Page2D => {
	return (page as Page2D).dimensions === 2;
};

export const isPage1d = (page: Page): page is Page1D => {
	return (page as Page1D).dimensions === 1;
};

export const isGroupedPage1d = (page: Page): page is GroupedPage1D => {
	return (page as GroupedPage1D).isGrouped === true && (page as GroupedPage1D).dimensions === -1;
};

export const isPage0d = (page: Page): page is Page0D => {
	return (page as Page0D).dimensions === 0;
};

export const isPage3D = (page: Page): page is Page3D => {
	return (page as Page3D).dimensions === 3;
};

// The scaling factor is used to ensure that the maximum value of the Y-axis is slightly larger than the actual maximum value of the data.
export const MAX_SCALING_FACTOR = 1.05;

const getGraphFromPage = (page: Page, title?: string) => {
	if (isPage2d(page)) {
		return (
			<JsRootGraph2D
				page={page}
				title={title}
			/>
		);
	} else if (isPage1d(page)) {
		return (
			<JsRootGraph1D
				page={page}
				title={title}
			/>
		);
	} else if (isPage0d(page)) {
		return (
			<JsRootGraph0D
				page={page}
				title={title}
			/>
		);
	} else if (isPage3D(page)) {
		return (
			<Result3D
				page={page}
				title={title}
			/>
		);
	} else if (isGroupedPage1d(page)) {
		return (
			<JsRootMultiGraph1D
				page={page}
				title={title}
			/>
		);
	} else {
		return <div>Error</div>;
	}
};

type SectionProps = {
	title: string;
	children: React.ReactNode;
};

function Section({ title, children }: SectionProps) {
	const theme = useTheme();

	return (
		<>
			<Typography variant='h6'>{title}</Typography>
			<Divider sx={{ width: 100 }} />
			<Box sx={{ margin: theme.spacing(1) }}>{children}</Box>
		</>
	);
}

export function generateGraphs(
	estimator: EstimatorResults,
	groupQuantities?: boolean,
	jobId?: string
) {
	const { gridPages, name } = estimator;

	const onClickSaveToFile = (page: Page1D) => {
		saveString(
			estimatorPage1DToCsv(estimator, page),
			`graph_${name}_${page.data.name.replace(/ /g, '_')}.csv`
		);
	};

	const groupPages = (pages: Page[]) => {
		if (!groupQuantities) return pages;

		const groupedPages: Page[] = [];

		pages.forEach(page => {
			if (isPage1d(page)) {
				const group = groupedPages
					.filter(isGroupedPage1d)
					.find(
						group =>
							group.dataUnit === page.data.unit &&
							group.axisDim1Unit === page.axisDim1.unit
					);

				if (group) {
					group.pages.push(page);
				} else {
					groupedPages.push({
						isGrouped: true,
						name: `Grouped Graphs [${page.data.unit}]/[${page.axisDim1.unit}]`,
						dimensions: -1,
						dataUnit: page.data.unit,
						axisDim1Unit: page.axisDim1.unit,
						pages: [page]
					});
				}
			} else {
				groupedPages.push(page);
			}
		});

		return groupedPages.map(group => {
			if (isGroupedPage1d(group) && group.pages.length === 1) return group.pages[0];

			return group;
		});
	};

	return groupPages(gridPages)
		.map(page => {
			return { page, graph: getGraphFromPage(page, page.name), filter: page.filterRef };
		})
		.map(({ page, graph, filter }, idx) => {
			const hasSufficientSpace = useMediaQuery('(min-width: 1400px)');

			return (
				<Box
					key={`graph_${name}${jobId ? '_' + jobId : ''}_${page.name ?? idx}`}
					sx={theme => ({
						display: 'flex',
						margin: theme.spacing(1),
						gap: theme.spacing(2)
					})}>
					{/* backgroundColor so it doesn't flicker with dark theme on reload */}
					<Box sx={{ flexGrow: 99, maxWidth: '1080px', backgroundColor: 'white' }}>
						{graph}
					</Box>
					<Box
						sx={{
							display: 'flex',
							flexGrow: 1,
							flexDirection: hasSufficientSpace ? 'row' : 'column-reverse',
							justifyContent: hasSufficientSpace ? 'space-between' : 'flex-end'
						}}>
						<Box sx={theme => ({ padding: theme.spacing(2) })}>
							<Section title='Filter'>
								<Typography>{filter?.name ?? 'None'}</Typography>
							</Section>
							{isCustomFilterJSON(filter) && (
								<Section title='Rules'>
									{filter.rules.map((rule, idx) => (
										<Typography key={rule.uuid}>
											{rule.keyword}
											{rule.operator}
											{rule.value}
										</Typography>
									))}
								</Section>
							)}
							{isParticleFilterJSON(filter) && (
								<Section title='Particle'>
									<Typography>{filter.particle.name}</Typography>
								</Section>
							)}
						</Box>
						<Box sx={theme => ({ marginTop: theme.spacing(2) })}>
							{isPage1d(page) && (
								<Button onClick={() => onClickSaveToFile(page as Page1D)}>
									EXPORT GRAPH TO CSV
								</Button>
							)}
						</Box>
					</Box>
				</Box>
			);
		});
}
