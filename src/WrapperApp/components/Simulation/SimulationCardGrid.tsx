import FolderOffIcon from '@mui/icons-material/FolderOff';
import QueuePlayNextIcon from '@mui/icons-material/QueuePlayNext';
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Box,
	Button,
	CircularProgress,
	Grid,
	GridProps,
	Typography
} from '@mui/material';
import { FC, useState } from 'react';

import { useDialog } from '../../../services/DialogService';
import { useStore } from '../../../services/StoreService';
import { SimulatorType } from '../../../types/RequestTypes';
import { JobStatusData, SimulationInputFiles } from '../../../types/ResponseTypes';
import SimulationCard from './SimulationCard';
import {
	BackendStatusIndicator,
	InputGroup,
	PageNavigationProps,
	PageParamProps,
	SimulationAccordionProps,
	SimulationBackendHeader,
	SimulationLabelBar,
	SimulationPaginationFooter
} from './SimulationPanelBar';

type GridLayout = 'grid' | 'inline-list' | 'block-list';

type SimulationCardGridProps = {
	simulations?: JobStatusData[];
	handleLoadResults?: (taskId: string | null, simulation: unknown) => void;
	handleShowInputFiles?: (inputFiles?: SimulationInputFiles) => void;
	handleDelete?: (jobId: string) => void;
	handleRefresh?: (jobId: string) => void;
	layout: GridLayout;
} & GridProps;

const stylesByLayout: Record<GridLayout, { gridContainerProps: {}; gridItemProps: {} }> = {
	'grid': {
		gridContainerProps: {
			rowSpacing: { sm: 2, md: 4 },
			columnSpacing: 2,
			columns: { sm: 1, md: 2, lg: 3, xl: 4 },
			justifyContent: 'space-evenly'
		},
		gridItemProps: { xs: 1 }
	},
	'inline-list': {
		gridContainerProps: {
			spacing: 2
		},
		gridItemProps: { xs: 12 }
	},
	'block-list': {
		gridContainerProps: {
			wrap: 'nowrap',
			gap: 2,
			pb: 2
		},
		gridItemProps: {}
	}
};

export function SimulationCardGrid({
	simulations,
	layout,
	sx,
	handleLoadResults,
	handleDelete,
	handleRefresh,
	handleShowInputFiles,
	...other
}: SimulationCardGridProps) {
	let gridContainerProps: GridProps = { container: true };
	let gridItemProps: GridProps = { item: true };

	if (layout in stylesByLayout) {
		gridContainerProps = {
			...gridContainerProps,
			...stylesByLayout[layout].gridContainerProps
		};
		gridItemProps = { ...gridItemProps, ...stylesByLayout[layout].gridItemProps };
	} else {
		console.warn(`Unknown layout: ${layout}`);
	}

	return (
		<Box
			overflow={layout === 'block-list' ? 'auto' : undefined}
			sx={{
				...sx
			}}>
			<Grid
				{...gridContainerProps}
				{...other}>
				{simulations ? (
					simulations.length ? (
						simulations.map(simulation => (
							<Grid
								key={simulation.jobId}
								{...gridItemProps}>
								<SimulationCard
									simulationStatus={simulation}
									loadResults={
										handleLoadResults &&
										(taskId => handleLoadResults(taskId, simulation))
									}
									handleDelete={handleDelete}
									handleRefresh={handleRefresh}
									showInputFiles={handleShowInputFiles}
								/>
							</Grid>
						))
					) : (
						<Typography
							variant='h5'
							color={({ palette }) => palette.text.disabled}
							sx={{
								textAlign: 'center',
								width: '100%',
								p: ({ spacing }) => spacing(8, 4),
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
					)
				) : (
					<CircularProgress
						sx={{
							p: ({ spacing }) => spacing(4)
						}}
					/>
				)}
			</Grid>
		</Box>
	);
}

type PaginatedCardGridProps = {
	layout?: 'grid' | 'inline-list' | 'block-list';
	title?: string;
	subtitle?: string;
	pageData: PageParamProps & PageNavigationProps;
	isAccordion?: boolean;
} & Omit<SimulationCardGridProps, 'layout'>;

export function PaginatedSimulationCardGrid({
	pageData,
	layout = 'grid',
	title = 'Simulations',
	subtitle,
	children,
	isAccordion = false,
	simulations,
	...other
}: PaginatedCardGridProps) {
	return (
		<AccordionCardGrid
			isAccordion={isAccordion}
			simulations={simulations}
			layout={layout}
			header={accordion =>
				SimulationBackendHeader({
					title,
					subtitle,
					accordion,
					sx: {
						mb: ({ spacing }) => spacing(0)
					},
					children,
					...pageData
				})
			}
			footer={() =>
				SimulationPaginationFooter({
					...pageData,
					stickTo: 'bottom',
					sx: {
						mt: ({ spacing }) => spacing(0),
						zIndex: ({ zIndex }) => zIndex.appBar
					}
				})
			}
			{...other}
		/>
	);
}

type SimulationsFromBackendProps = PaginatedCardGridProps & {
	isBackendAlive: boolean;
};

export function PaginatedSimulationsFromBackend({
	isBackendAlive,
	children,
	...other
}: SimulationsFromBackendProps) {
	const { setTrackedId } = useStore();
	const [open] = useDialog('runSimulation');

	return (
		<PaginatedSimulationCardGrid {...other}>
			<InputGroup
				sx={{
					marginLeft: 'auto'
				}}>
				<Button
					variant='contained'
					color='info'
					startIcon={<QueuePlayNextIcon />}
					disabled={!isBackendAlive}
					onClick={() =>
						open({
							onSubmit: setTrackedId,
							simulator: SimulatorType.SHIELDHIT
						})
					}>
					Run new simulation
				</Button>
				<BackendStatusIndicator
					sx={{
						p: ({ spacing }) => spacing(2)
					}}
					isBackendAlive={isBackendAlive}
				/>
			</InputGroup>
			{children}
		</PaginatedSimulationCardGrid>
	);
}

type AccordionCardGridProps = {
	isAccordion: boolean;
	header?: FC<SimulationAccordionProps>;
	footer?: FC<{}>;
} & SimulationCardGridProps;

export function AccordionCardGrid({
	isAccordion,
	header,
	footer,
	children,
	simulations,
	sx,
	...other
}: AccordionCardGridProps) {
	const [expanded, setExpanded] = useState(!!simulations?.length || !isAccordion);

	return (
		<Accordion
			expanded={expanded}
			sx={{
				'background': 'transparent',

				// 'isolation': 'isolate',
				'boxShadow': 'none',
				'&:before': {
					display: 'none'
				},
				'p': ({ spacing }) => spacing(0)
			}}>
			<AccordionSummary
				sx={{
					p: ({ spacing }) => spacing(0),
					m: ({ spacing }) => spacing(0),
					position: 'sticky',
					inset: ({ spacing }) => spacing(0, 0, 0, 0),
					zIndex: ({ zIndex }) => zIndex.appBar + 1,
					mb: ({ spacing }) => (expanded ? spacing(7) : spacing(0))
				}}>
				{header &&
					header(
						isAccordion
							? { expanded, toggleExpanded: () => setExpanded(!expanded) }
							: {}
					)}
			</AccordionSummary>
			<AccordionDetails
				sx={{
					mt: ({ spacing }) => (expanded ? spacing(-14) : spacing(0)),
					p: 0,
					...sx
				}}>
				<SimulationCardGrid
					simulations={simulations}
					{...other}
				/>
				{footer && footer({})}
			</AccordionDetails>
		</Accordion>
	);
}

type DemoCardGridProps = {
	layout?: 'grid' | 'inline-list' | 'block-list';
	isAccordion?: boolean;
} & Omit<SimulationCardGridProps, 'layout'>;

export function DemoCardGrid({
	layout = 'block-list',
	simulations,
	isAccordion = true,
	title = 'Demo results',
	...other
}: DemoCardGridProps) {
	return (
		<AccordionCardGrid
			isAccordion={isAccordion}
			simulations={simulations}
			layout={layout}
			header={accordion =>
				SimulationLabelBar({
					title: title,
					accordion,
					sx: {
						mb: ({ spacing }) => spacing(accordion.expanded ? 4 : -2)
					}
				})
			}
			{...other}
		/>
	);
}
