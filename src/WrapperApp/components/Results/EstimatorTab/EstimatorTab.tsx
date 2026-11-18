import { Box, CircularProgress, useTheme } from '@mui/material';

import { generateGraphs } from '../../../../JsRoot/GraphData';
import { FullSimulationData } from '../../../../types/SimulationService';
import { PageGroup } from '../../../../util/lazyPages';
import { EstimatorResults } from '../ResultsPanel';
import TablePage0D from '../ResultsTable';
import LazyPageGroup from './LazyPageGroup';

interface EstimatorTabProps {
	estimator: EstimatorResults | undefined;
	tabsValue: number;
	resultsGeneratedFromProjectFile: boolean;
	groupQuantities: boolean;
	simulation: FullSimulationData;
	// pages not loaded yet, by dimensions: fetched when they come into view
	pendingGroups?: PageGroup[];
	loadingDimensions?: number[];
	// groups whose load failed: they wait for the Load button
	failedDimensions?: number[];
	onLoadGroup?: (group: PageGroup) => void;
}

const EstimatorTab = ({
	estimator,
	resultsGeneratedFromProjectFile,
	groupQuantities,
	simulation,
	pendingGroups = [],
	loadingDimensions = [],
	failedDimensions = [],
	onLoadGroup
}: EstimatorTabProps) => {
	const theme = useTheme();

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
						simulation?.jobId
					)}
					{onLoadGroup &&
						pendingGroups.map(group => (
							<LazyPageGroup
								key={`${simulation?.jobId}_${estimator.name}_${group.dimension}`}
								group={group}
								loading={loadingDimensions.includes(group.dimension)}
								failed={failedDimensions.includes(group.dimension)}
								onLoad={onLoadGroup}
							/>
						))}
				</Box>
			)}
		</Box>
	);
};

export default EstimatorTab;
