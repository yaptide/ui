import { Card, CardContent, Fade, Modal } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';

import { RestSimulationContext, useShSimulation } from '../../../services/ShSimulatorService';
import { SimulatorType } from '../../../types/RequestTypes';
import { SimulationInputFiles } from '../../../types/ResponseTypes';
import {
	BatchOptionsType,
	RunSimulationForm,
	SimulationRunType,
	SimulationSourceType
} from '../../../WrapperApp/components/Simulation/RunSimulationForm';
import { EditorJson } from '../../js/EditorJson';
import { YaptideEditor } from '../../js/YaptideEditor';
import { WarnDialogProps } from './CustomDialog';

export function RunSimulationDialog({
	open = true,
	editor,
	inputFiles,
	simulator,
	onClose,
	onConfirm = onClose
}: WarnDialogProps<{
	onConfirm?: (jobId: string) => void;
	editor: YaptideEditor;
	inputFiles: Record<string, string>;
	simulator: SimulatorType;
}>) {
	const [controller] = useState(new AbortController());
	const { postJobDirect, postJobBatch } = useShSimulation();
	const sendSimulationRequest = (
		editorJson: EditorJson,
		inputFiles: Partial<SimulationInputFiles>,
		runType: SimulationRunType,
		sourceType: SimulationSourceType,
		simName: string,
		nTasks: number,
		simulator: SimulatorType,
		batchOptions: BatchOptionsType
	) => {
		const simData = sourceType === 'editor' ? editorJson : inputFiles;

		const options =
			runType === 'batch'
				? {
						...batchOptions,
						arrayOptions: batchOptions.arrayOptions?.reduce((acc, curr) => {
							acc[curr.optionKey] = curr.optionValue;
							return acc;
						}, {} as Record<string, string>),
						collectOptions: batchOptions.collectOptions?.reduce((acc, curr) => {
							acc[curr.optionKey] = curr.optionValue;
							return acc;
						}, {} as Record<string, string>)
				  }
				: undefined;

		(runType === 'direct' ? postJobDirect : postJobBatch)(
			simData,
			sourceType,
			nTasks,
			simulator,
			simName,
			options,
			controller.signal
		)
			.then(res => {
				onConfirm(res.jobId);
				enqueueSnackbar('Simulation submitted', { variant: 'success' });
			})
			.catch(e => {
				enqueueSnackbar('Error while starting simulation', { variant: 'error' });
				console.error(e);
			});
	};
	return (
		<Modal
			keepMounted
			open={open}
			onClose={onClose}
			sx={{
				display: 'flex',
				alignItems: 'flex-start',
				mt: '15vh',
				justifyContent: 'center'
			}}>
			<Fade in={open}>
				<Card sx={{ maxWidth: '660px' }}>
					<CardContent
						sx={{
							display: 'flex',
							gap: 3
						}}>
						<RunSimulationForm
							editorJson={editor.toJSON()}
							inputFiles={{
								...inputFiles
							}}
							forwardedSimulator={simulator}
							runSimulation={sendSimulationRequest}
						/>
					</CardContent>
				</Card>
			</Fade>
		</Modal>
	);
}
