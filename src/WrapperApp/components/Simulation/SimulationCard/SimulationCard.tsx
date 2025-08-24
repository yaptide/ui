import { Card, CardProps, Divider, useTheme } from '@mui/material';
import { formatDate } from 'date-fns/format';
import { useState } from 'react';

import { useStore } from '../../../../services/StoreService';
import {
	currentJobStatusData,
	JobStatusData,
	SimulationInputFiles,
	StatusState
} from '../../../../types/ResponseTypes';
import { SimulationCardActions } from './SimulationCardActions';
import { SimulationCardContent } from './SimulationCardContent';
import { SimulationCardHeader } from './SimulationCardHeader';
import SimulationCardHelpers from './SimulationCardHelpers';

export type SimulationCardProps = {
	simulationStatus: JobStatusData;
	loadResults?: (jobId: string | null) => void;
	handleDelete?: (jobId: string) => void;
	handleCancel?: (jobId: string) => void;
	handleRefresh?: (jobId: string) => void;
	showInputFiles?: (inputFiles?: SimulationInputFiles) => void;
} & CardProps;

export default function SimulationCard({
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

	return (
		<Card
			sx={{
				display: 'flex',
				flexDirection: 'column',
				borderStyle: 'solid',
				borderWidth: 1,
				borderColor: theme.palette.divider
			}}
			{...other}>
			<Divider
				sx={{
					borderTopWidth: 5,
					borderColor: highlightColor
				}}
			/>
			<SimulationCardHeader
				handleDelete={handleDelete}
				handleRefresh={handleRefresh}
				simulationStatus={simulationStatus}
			/>
			<SimulationCardContent
				duration={duration}
				endTime={endTime}
				formatedEndDate={formatDateTime(endDate)}
				formatedStartDate={formatDateTime(startDate)}
				simulationStatus={simulationStatus}
				highlightColor={highlightColor}
			/>
			<SimulationCardActions
				simulationStatus={simulationStatus}
				actions={actions}
				handlers={handlers}
				context={context}
			/>
		</Card>
	);
}
