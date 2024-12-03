import { Box, Card, CardContent, CircularProgress } from '@mui/material';

import { generateGraphs } from '../../../../JsRoot/GraphData';
import { FullSimulationData } from '../../../../services/ShSimulatorService';
import { TabPanel } from '../../Panels/TabPanel';
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
	tabsValue,
	resultsGeneratedFromProjectFile,
	groupQuantities,
	simulation
}: EstimatorTabProps) => {
	return (
		<Card
			variant='outlined'
			sx={{
				'flexGrow': 1,
				'margin': '0.5rem',
				'bgcolor': theme =>
					theme.palette.mode === 'dark' ? 'text.disabled' : 'background.paper',
				'& .MuiCardContent-root div': {
					bgcolor: 'transparent',
					backgroundImage: 'none',
					color: 'black'
				}
			}}>
			{!estimator ? (
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						height: '100vh'
					}}>
					<CircularProgress />
				</Box>
			) : (
				<CardContent>
					<TabPanel
						key={`tab_panel_${estimator.name}_${tabsValue}`}
						value={tabsValue}
						index={tabsValue}
						persistentIfVisited>
						<Box
							style={{
								width: '100%',
								display: 'flex',
								flexDirection: 'column'
							}}>
							{estimator.tablePages.length > 0 && (
								<TablePage0D estimator={estimator}></TablePage0D>
							)}
							{generateGraphs(
								estimator,
								resultsGeneratedFromProjectFile && groupQuantities,
								simulation?.jobId
							)}
						</Box>
					</TabPanel>
				</CardContent>
			)}
		</Card>
	);
};

export default EstimatorTab;
