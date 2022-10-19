import { Grid, Pagination, Stack } from '@mui/material';
import { SimulationStatusData } from '../../../services/ShSimulatorService';
import SimulationStatus from './SimulationStatus';
import { InputFiles } from '../../../services/ShSimulatorService';

export type SimulationPanelGridProps = {
	localSimulationData: SimulationStatusData[];
	simulationsStatusData: SimulationStatusData[];
	handleLoadResults: (id: string | null, simulation: SimulationStatusData) => void;
	handleShowInputFiles: (inputFiles?: InputFiles) => void;
	pageCount: number;
	page: number;
	handlePageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
};

export function SimulationPanelGrid(props: SimulationPanelGridProps) {
	const {
		localSimulationData,
		simulationsStatusData,
		handleLoadResults,
		handleShowInputFiles,
		pageCount,
		page,
		handlePageChange
	} = props;
	return (
		<Stack spacing={2} sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
			<Grid container spacing={2} sx={{ flexGrow: 1 }}>
				{localSimulationData.concat(simulationsStatusData).map(simulation => (
					<Grid xs={6}>
						<SimulationStatus
							key={simulation.uuid}
							simulation={simulation}
							loadResults={taskId => handleLoadResults(taskId, simulation)}
							showInputFiles={handleShowInputFiles}></SimulationStatus>
					</Grid>
				))}
			</Grid>
			<Pagination
				sx={{ display: 'flex', justifyContent: 'end' }}
				count={pageCount}
				page={page}
				onChange={handlePageChange}
			/>
		</Stack>
	);
}
