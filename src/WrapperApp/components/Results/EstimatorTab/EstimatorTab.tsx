import { Box, CircularProgress, useTheme } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';

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
	const hasSufficientSpace = useMediaQuery('(max-width: 1400px)');

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
					{estimator.tablePages.length > 0 && (
						<TablePage0D estimator={estimator}></TablePage0D>
					)}
					{generateGraphs(
						estimator,
						resultsGeneratedFromProjectFile && groupQuantities,
						simulation?.jobId,
						hasSufficientSpace
					)}
				</Box>
			)}
		</Box>
	);
};

export default EstimatorTab;
