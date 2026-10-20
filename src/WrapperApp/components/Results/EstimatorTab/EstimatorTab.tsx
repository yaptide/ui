import { Box, Button, CircularProgress, useTheme } from '@mui/material';

import { useConfig } from '../../../../config/ConfigService';
import { generateGraphs } from '../../../../JsRoot/GraphData';
import { FullSimulationData } from '../../../../types/SimulationService';
import { EstimatorResults } from '../ResultsPanel';
import TablePage0D from '../ResultsTable';

interface EstimatorTabProps {
	estimator: EstimatorResults;
	tabsValue: number;
	resultsGeneratedFromProjectFile: boolean;
	groupQuantities: boolean;
	simulation: FullSimulationData;
}

const EstimatorTab = ({
	estimator,
	resultsGeneratedFromProjectFile,
	groupQuantities,
	simulation
}: EstimatorTabProps) => {
	const theme = useTheme();
	const { backendUrl } = useConfig();

	return (
		<Box
			sx={{
				margin: theme.spacing(1),
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				flexGrow: 1,
				overflow: 'hidden'
			}}>
			{!estimator ? (
				<CircularProgress />
			) : (
				<Box
					style={{
						display: 'flex',
						flexDirection: 'column',
						width: '100%',
						height: '100%',
						overflowY: 'auto'
					}}>
					{estimator.fullResolutionName && (
						<Button
							// answers with a redirect to a fresh signed link to the file in storage
							href={`${backendUrl}/results/full_resolution?${new URLSearchParams({
								job_id: simulation.jobId,
								estimator_name: estimator.fullResolutionName
							})}`}
							sx={{ alignSelf: 'center' }}>
							Download full resolution
						</Button>
					)}
					{estimator.tablePages.length > 0 && (
						<TablePage0D estimator={estimator}></TablePage0D>
					)}
					{generateGraphs(
						estimator,
						resultsGeneratedFromProjectFile && groupQuantities,
						simulation?.jobId
					)}
				</Box>
			)}
		</Box>
	);
};

export default EstimatorTab;
