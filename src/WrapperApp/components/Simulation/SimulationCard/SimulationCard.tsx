import { Card, CardProps, Divider } from '@mui/material';
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

type SimulationCardProps = {
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

	const displayDuration = endTime || currentJobStatusData[StatusState.RUNNING](simulationStatus);

	return (
		<Card
			sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
			{...other}>
			<Divider
				sx={{
					borderTopWidth: 5,
					borderColor: statusColor(
						simulationStatus.localData ? StatusState.LOCAL : simulationStatus.jobState
					)
				}}
			/>
			<SimulationCardHeader
				displayDuration={displayDuration}
				duration={duration}
				endTime={endTime}
				formatedEndDate={formatDateTime(endDate)}
				formatedStartDate={formatDateTime(startDate)}
				handleDelete={handleDelete}
				handleRefresh={handleRefresh}
				simulationStatus={simulationStatus}
			/>
			<SimulationCardContent
				simulationStatus={simulationStatus}
				statusColor={statusColor}
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
