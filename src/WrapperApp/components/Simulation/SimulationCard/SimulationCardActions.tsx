import { Button, ButtonGroup, CardActions } from '@mui/material';
import { SnackbarKey } from 'notistack';
import { ReactNode, useState } from 'react';

import { useAuth } from '../../../../services/AuthService';
import { ResultsSimulationDataWithSource } from '../../../../services/StoreService';
import { YaptideEditor } from '../../../../ThreeEditor/js/YaptideEditor';
import {
	currentJobStatusData,
	JobStatusFailed,
	JobUnknownStatus,
	SimulationInfo,
	SimulationInputFiles,
	StatusState
} from '../../../../types/ResponseTypes';
import { partialRevision } from '../../../../util/partialResults';
import { FinishTasksDialog } from '../FinishTasksDialog';

interface SimulationCardActionsProps {
	simulationStatus: Omit<JobUnknownStatus & SimulationInfo, never>;
	actions: {
		loadResults: ((jobId: string | null) => void) | undefined;
		handleCancel: ((jobId: string) => void) | undefined;
		showInputFiles: ((inputFiles?: SimulationInputFiles | undefined) => void) | undefined;
	};
	handlers: {
		onClickLoadResults: () => void;
		onClickShowError: (
			simulation: Omit<JobStatusFailed & SimulationInfo, never>
		) => Promise<void>;
		onClickInputFiles: () => void;
		onClickSaveToFile: () => void;
		onClickLoadToEditor: (
			simulation: Omit<JobUnknownStatus & SimulationInfo, never>
		) => Promise<SnackbarKey | undefined>;
	};
	context: {
		resultsSimulationData?: ResultsSimulationDataWithSource | undefined;
		yaptideEditor: YaptideEditor | undefined;
		disableLoadJson: boolean;
	};
}

export const SimulationCardActions = ({
	simulationStatus,
	actions,
	handlers,
	context
}: SimulationCardActionsProps) => {
	const { loadResults, handleCancel, showInputFiles } = actions;
	const {
		onClickLoadResults,
		onClickShowError,
		onClickInputFiles,
		onClickSaveToFile,
		onClickLoadToEditor
	} = handlers;
	const { resultsSimulationData, yaptideEditor, disableLoadJson } = context;

	const { authKy } = useAuth();
	const [tasksOpen, setTasksOpen] = useState(false);
	let statusAction = undefined;
	let tasksAction: ReactNode = undefined;

	if (simulationStatus.jobState) {
		if (currentJobStatusData[StatusState.COMPLETED](simulationStatus)) {
			statusAction = (
				<Button
					sx={{ fontSize: '.8em' }}
					size='small'
					color='secondary'
					disabled={!Boolean(loadResults)}
					onClick={onClickLoadResults}>
					{resultsSimulationData?.data.jobId !== simulationStatus.jobId
						? 'Load Results'
						: 'Go to Results'}
				</Button>
			);
		} else if (
			handleCancel &&
			(currentJobStatusData[StatusState.RUNNING](simulationStatus) ||
				currentJobStatusData[StatusState.PENDING](simulationStatus))
		) {
			statusAction = (
				<Button
					sx={{ fontSize: '.8em' }}
					color='secondary'
					onClick={() => handleCancel(simulationStatus.jobId)}
					size='small'>
					Cancel
				</Button>
			);

			// a remote simulation's tasks may be finished early, e.g. one on a slow node
			tasksAction = !simulationStatus.localData && (
				<Button
					sx={{ fontSize: '.8em' }}
					color='secondary'
					onClick={() => setTasksOpen(true)}
					size='small'>
					Tasks
				</Button>
			);
		} else if (currentJobStatusData[StatusState.FAILED](simulationStatus)) {
			statusAction = (
				<Button
					sx={{ fontSize: '.8em' }}
					color='secondary'
					size='small'
					onClick={() => onClickShowError(simulationStatus)}>
					Error Log
				</Button>
			);
		}
	}

	// results stored while the simulation ran, kept when it was cancelled or failed
	const partialAction = partialRevision(simulationStatus) !== undefined && (
		<Button
			sx={{ fontSize: '.8em' }}
			size='small'
			color='secondary'
			disabled={!Boolean(loadResults)}
			onClick={onClickLoadResults}>
			Partial Results
		</Button>
	);

	return (
		<CardActions sx={{ p: 1 }}>
			<ButtonGroup
				fullWidth
				aria-label='full width outlined button group'>
				{partialAction}
				{statusAction}
				{tasksAction}
				<Button
					sx={{ fontSize: '.8em' }}
					color='secondary'
					size='small'
					onClick={onClickInputFiles}
					disabled={!Boolean(showInputFiles)}>
					Input Files
				</Button>

				<Button
					sx={{ fontSize: '.8em' }}
					color='secondary'
					size='small'
					onClick={onClickSaveToFile}
					disabled={
						!(simulationStatus.jobState === StatusState.COMPLETED && yaptideEditor)
					}>
					Save to file
				</Button>

				<Button
					sx={{ fontSize: '.8em' }}
					color='secondary'
					size='small'
					disabled={disableLoadJson}
					onClick={() => simulationStatus && onClickLoadToEditor(simulationStatus)}>
					Load to editor
				</Button>
			</ButtonGroup>
			{tasksOpen && (
				<FinishTasksDialog
					open={tasksOpen}
					onClose={() => setTasksOpen(false)}
					authKy={authKy}
					jobId={simulationStatus.jobId}
				/>
			)}
		</CardActions>
	);
};
