import { Card, CardContent, Fade, Modal } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';

import { useShSimulation } from '../../../services/ShSimulatorService';
import { useStore } from '../../../services/StoreService';
import { SimulatorType } from '../../../types/RequestTypes';
import { SimulationInputFiles } from '../../../types/ResponseTypes';
import {
	BatchOptionsType,
	RunSimulationForm,
	SimulationRunType,
	SimulationSourceType
} from '../../../WrapperApp/components/Simulation/RunSimulationForm';
import { EditorJson } from '../../js/EditorJson';
import { WarnDialogProps } from './CustomDialog';

export function RunSimulationDialog({
	open = true,
	inputFiles = {},
	simulator = SimulatorType.SHIELDHIT,
	onClose,
	onConfirm = onClose,
	onSubmit = () => {}
}: WarnDialogProps<{
	onSubmit?: (jobId: string) => void;
	inputFiles?: Record<string, string>;
	simulator?: SimulatorType;
}>) {
	const { editorRef } = useStore();
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
		onConfirm();
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
				onSubmit(res.jobId);
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
							editorJson={editorRef.current?.toJSON()}
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
