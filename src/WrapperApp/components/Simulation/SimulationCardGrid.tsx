import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Box,
	Grid,
	GridProps,
	Typography
} from '@mui/material';
import { JobStatusData } from '../../../services/ResponseTypes';
import SimulationCard from './SimulationCard';
import { OrderBy, OrderType } from '../../../services/RequestTypes';
import {
	PageNavigationProps,
	PageParamProps,
	SimulationAppBar,
	SimulationBackendHeader,
	SimulationLabelBar,
	SimulationPaginationFooter
} from './SimulationPanelBar';
import FolderOffIcon from '@mui/icons-material/FolderOff';
import { useState } from 'react';

type SimulationCardGridProps = {
	simulations: JobStatusData[];
	layout: 'grid' | 'inline-list' | 'block-list';
} & GridProps;

export function SimulationCardGrid({ simulations, layout, sx, ...other }: SimulationCardGridProps) {
	let gridContainerProps: GridProps = { container: true };
	let gridItemProps: GridProps = { item: true };
	switch (layout) {
		case 'grid':
			gridContainerProps = {
				...gridContainerProps,
				rowSpacing: { sm: 2, md: 4 },
				columnSpacing: 2,
				columns: { sm: 1, md: 2, lg: 3, xl: 4 }
			};
			gridItemProps = { ...gridItemProps, xs: 1 };
			break;
		case 'inline-list':
			gridContainerProps = {
				...gridContainerProps,
				spacing: 2
			};
			gridItemProps = { ...gridItemProps, xs: 12 };
			break;
		case 'block-list':
			gridContainerProps = {
				...gridContainerProps,
				wrap: 'nowrap',
				gap: 2,
				pb: 2
			};
			gridItemProps = { ...gridItemProps };
			break;
		default:
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const _exhaustiveCheck: never = layout;
			return <>Grid layout error</>;
	}

	return (
		<Box
			overflow={layout === 'block-list' ? 'auto' : undefined}
			sx={{
				...sx
			}}>
			<Grid {...gridContainerProps} {...other}>
				{simulations.length ? (
					simulations.map(simulation => (
						<Grid key={simulation.jobId} {...gridItemProps}>
							<SimulationCard simulation={simulation} />
						</Grid>
					))
				) : (
					<Typography
						variant='h5'
						color={({ palette }) => palette.text.disabled}
						sx={{
							textAlign: 'center',
							width: '100%',
							p: ({ spacing }) => spacing(4),
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center'
						}}>
						<FolderOffIcon
							sx={{
								m: ({ spacing }) => spacing(0, 2),
								pb: ({ spacing }) => spacing(0.5),
								fontSize: ({ spacing }) => spacing(4)
							}}
						/>
						No simulations found
					</Typography>
				)}
			</Grid>
		</Box>
	);
}
type DemoCardGridProps = {
	layout?: 'grid' | 'inline-list' | 'block-list';
} & Omit<SimulationCardGridProps, 'layout'>;

type PaginatedCardGridProps = {
	layout?: 'grid' | 'inline-list' | 'block-list';
	pageData: PageParamProps & PageNavigationProps;
} & Omit<SimulationCardGridProps, 'layout'>;

export function PaginatedSimulationCardGrid({
	pageData,
	layout = 'grid',
	...other
}: PaginatedCardGridProps) {
	return (
		<Box>
			<SimulationBackendHeader
				stickTo='top'
				title={'Yaptide Simulations'}
				isBackendAlive={false}
				{...pageData}
				sx={{
					mb: ({ spacing }) => spacing(6)
				}}
			/>
			<SimulationCardGrid
				layout={layout}
				{...other}
				sx={{
					mt: ({ spacing }) => spacing(-10),
					mb: ({ spacing }) => spacing(-8)
				}}
			/>
			<SimulationPaginationFooter
				{...pageData}
				stickTo='bottom'
				sx={{
					mt: ({ spacing }) => spacing(6)
				}}
			/>
		</Box>
	);
}

export function DemoCardGrid({ layout = 'block-list', ...other }: DemoCardGridProps) {
	const [expanded, setExpanded] = useState(true);

	return (
		<Accordion
			expanded={expanded}
			sx={{
				'background': 'transparent',
				'boxShadow': 'none',
				'&:before': {
					display: 'none'
				},
				'p': ({ spacing }) => spacing(0)
			}}>
			<SimulationLabelBar
				title={'Demo results'}
				accordion={{
					expanded: expanded,
					toggleExpanded: () => setExpanded(!expanded)
				}}
				sx={{
					mb: ({ spacing }) => spacing(expanded ? 0 : -3)
				}}
			/>
			<AccordionDetails
				sx={{
					p: 0
				}}>
				<SimulationCardGrid layout={layout} {...other} />
			</AccordionDetails>
		</Accordion>
	);
}
