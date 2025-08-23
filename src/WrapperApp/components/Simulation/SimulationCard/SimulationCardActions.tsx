import { Button, ButtonGroup, CardActions } from '@mui/material';
import { SnackbarKey } from 'notistack';

import { FullSimulationData } from '../../../../services/ShSimulatorService';
import { YaptideEditor } from '../../../../ThreeEditor/js/YaptideEditor';
import {
	currentJobStatusData,
	JobStatusFailed,
	JobUnknownStatus,
	SimulationInfo,
	SimulationInputFiles,
	StatusState
} from '../../../../types/ResponseTypes';

interface SimulationCardActionsProps {
	simulationStatus: Omit<JobUnknownStatus & SimulationInfo, never>;
	actions: {
		loadResults: ((jobId: string | null) => void) | undefined;
		handleCancel: ((jobId: string) => void) | undefined;
		showInputFiles: ((inputFiles?: SimulationInputFiles | undefined) => void) | undefined;
	};
	handlers: {
		onClickLoadResults: () => void;
		onClickGoToResults: () => void;
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
		resultsSimulationData?: FullSimulationData | undefined;
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
		onClickGoToResults,
		onClickShowError,
		onClickInputFiles,
		onClickSaveToFile,
		onClickLoadToEditor
	} = handlers;
	const { resultsSimulationData, yaptideEditor, disableLoadJson } = context;

	let statusAction = undefined;

	if (simulationStatus.jobState) {
		if (currentJobStatusData[StatusState.COMPLETED](simulationStatus)) {
			statusAction = (
				<Button
					sx={{ fontSize: '.8em' }}
					size='small'
					color='secondary'
					disabled={!Boolean(loadResults)}
					onClick={
						resultsSimulationData?.jobId !== simulationStatus.jobId
							? onClickLoadResults
							: onClickGoToResults
					}>
					{resultsSimulationData?.jobId !== simulationStatus.jobId
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

	return (
		<CardActions>
			<ButtonGroup
				fullWidth
				aria-label='full width outlined button group'>
				{statusAction}
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
		</CardActions>
	);
};
