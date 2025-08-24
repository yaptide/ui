import { Box, Card, Chip, Divider, useTheme } from '@mui/material';
import { formatDate } from 'date-fns/format';
import { useEffect, useRef, useState } from 'react';

import { useStore } from '../../../../services/StoreService';
import { StatusState } from '../../../../types/ResponseTypes';
import { SimulationCardProps } from './SimulationCard';
import { SimulationCardActions } from './SimulationCardActions';
import { SimulationProgress } from './SimulationCardContent';
import { SimulationCardHeader } from './SimulationCardHeader';
import SimulationCardHelpers from './SimulationCardHelpers';

export default function SimulationCardSmall({
	simulationStatus,
	loadResults,
	handleDelete,
	handleCancel,
	handleRefresh,
	showInputFiles,
	...other
}: SimulationCardProps) {
	const theme = useTheme();
	const { yaptideEditor, resultsSimulationData } = useStore();
	const [disableLoadJson, setDisableLoadJson] = useState(false);
	const {
		statusColor,
		onClickLoadResults,
		onClickGoToResults,
		onClickInputFiles,
		onClickShowError,
		onClickSaveToFile,
		onClickLoadToEditor
	} = SimulationCardHelpers({
		loadResults,
		setDisableLoadJson,
		showInputFiles,
		simulationStatus,
		yaptideEditor
	});

	const actions = { loadResults, handleCancel, showInputFiles };
	const handlers = {
		onClickLoadResults,
		onClickGoToResults,
		onClickShowError,
		onClickInputFiles,
		onClickSaveToFile,
		onClickLoadToEditor
	};
	const context = { resultsSimulationData, yaptideEditor, disableLoadJson };

	const { startTime, endTime } = simulationStatus;

	const startDate = new Date(startTime);
	const endDate = endTime ? new Date(endTime) : new Date();
	const duration = endDate ? endDate.valueOf() - startDate.valueOf() : 0;

	const formatDateTime = (date: Date) => formatDate(date, 'yyyy-MM-dd HH:mm:ss');

	const highlightColor = statusColor(
		simulationStatus.localData ? StatusState.LOCAL : simulationStatus.jobState
	);

	const containerRef = useRef<HTMLElement>(null);
	const [showControlsInSmallLayout, setShowControlsInSmallLayout] = useState(false);
	useEffect(() => {
		if (containerRef?.current) {
			containerRef.current.onmouseenter = () => {
				setShowControlsInSmallLayout(true);
			};

			containerRef.current.onmouseleave = () => {
				setShowControlsInSmallLayout(false);
			};
		}
	}, [containerRef]);

	return (
		<Card
			sx={{
				display: 'flex',
				borderStyle: 'solid',
				borderWidth: 1,
				borderColor: theme.palette.divider,
				backgroundColor: theme.palette.grey['900'],
				backgroundImage: 'none' // otherwise "paper overlay" is added, which changes backgroundColor
			}}
			{...other}>
			<Divider
				orientation='vertical'
				sx={{
					height: 'auto',
					borderLeftWidth: 5,
					borderColor: highlightColor
				}}
			/>
			<Box
				ref={containerRef}
				sx={{
					display: 'flex',
					flexDirection: 'column',
					flexGrow: 1
				}}>
				<SimulationCardHeader
					handleDelete={handleDelete}
					handleRefresh={handleRefresh}
					simulationStatus={simulationStatus}
				/>
				<Box sx={{ px: theme.spacing(1), position: 'relative' }}>
					<Chip
						variant='filled'
						size='small'
						label={
							simulationStatus.localData
								? StatusState.LOCAL
								: simulationStatus.jobState
						}
						sx={{
							backgroundColor: highlightColor,
							color: 'white',
							width: 'fit-content',
							mb: theme.spacing(1)
						}}
					/>
					<SimulationProgress
						formatedStartDate={formatDateTime(startDate)}
						duration={duration}
						simulationStatus={simulationStatus}
					/>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'flex-end',
							position: 'absolute',
							top: 0,
							left: 0,
							height: '100%',
							width: '100%',
							backgroundColor: theme.palette.grey['900'],
							zIndex: 100000,
							visibility: showControlsInSmallLayout ? 'visible' : 'hidden'
						}}>
						<SimulationCardActions
							simulationStatus={simulationStatus}
							actions={actions}
							handlers={handlers}
							context={context}
						/>
					</Box>
				</Box>
			</Box>
		</Card>
	);
}
