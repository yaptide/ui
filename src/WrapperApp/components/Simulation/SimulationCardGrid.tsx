import FolderOffIcon from '@mui/icons-material/FolderOff';
import { Box, CircularProgress, GridProps, Theme, Typography, useTheme } from '@mui/material';

import { SimulatorType } from '../../../types/RequestTypes';
import { JobStatusData, SimulationInputFiles } from '../../../types/ResponseTypes';
import SimulationCard from './SimulationCard/SimulationCard';
import {
	PageNavigationProps,
	PageParamProps,
	SimulationPaginationFooter
} from './SimulationPanelBar';

type SimulationCardGridProps = {
	simulations?: JobStatusData[];
	handleLoadResults?: (taskId: string | null, simulation: unknown) => void;
	handleShowInputFiles?: (inputFiles?: SimulationInputFiles) => void;
	handleDelete?: (jobId: string) => void;
	handleCancel?: (jobId: string) => void;
	handleRefresh?: (jobId: string) => void;
} & GridProps;

export function SimulationCardGrid({
	simulations,
	handleLoadResults,
	handleDelete,
	handleCancel,
	handleRefresh,
	handleShowInputFiles
}: SimulationCardGridProps) {
	const theme = useTheme();

	return (
		<Box
			sx={{
				display: 'grid',
				gridTemplateColumns: 'repeat(auto-fit, 320px)',
				gridColumnGap: theme.spacing(1),
				gridRowGap: theme.spacing(1),
				justifyContent: 'center',
				px: theme.spacing(2),
				py: theme.spacing(4)
			}}>
			{simulations ? (
				simulations.length ? (
					simulations.map(simulation => (
						<SimulationCard
							simulationStatus={simulation}
							loadResults={
								handleLoadResults &&
								(taskId => handleLoadResults(taskId, simulation))
							}
							handleDelete={handleDelete}
							handleCancel={handleCancel}
							handleRefresh={handleRefresh}
							showInputFiles={handleShowInputFiles}
						/>
					))
				) : (
					<Typography
						variant='h5'
						sx={{
							color: theme.palette.text.disabled,
							textAlign: 'center',
							width: '100%',
							p: theme.spacing(8, 4),
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center'
						}}>
						<FolderOffIcon
							sx={{
								m: theme.spacing(0, 2),
								pb: theme.spacing(0.5),
								fontSize: theme.spacing(4)
							}}
						/>
						No simulations found
					</Typography>
				)
			) : (
				<CircularProgress
					sx={{
						p: ({ spacing }: Theme) => spacing(4)
					}}
				/>
			)}
		</Box>
	);
}

type PaginatedCardGridProps = {
	pageData: PageParamProps & PageNavigationProps;
} & Omit<SimulationCardGridProps, 'layout'>;

export function PaginatedSimulationCardGrid({
	pageData,
	...simulationCardGridProps
}: PaginatedCardGridProps) {
	return (
		<Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
			<SimulationCardGrid {...simulationCardGridProps} />
			<SimulationPaginationFooter {...pageData} />
		</Box>
	);
}

type SimulationsFromBackendProps = PaginatedCardGridProps & {
	isBackendAlive: boolean;
	simulator: SimulatorType;
};

export function PaginatedSimulationsGrid({
	isBackendAlive,
	simulator,
	children,
	...other
}: SimulationsFromBackendProps) {
	return <PaginatedSimulationCardGrid {...other} />;
}
