import { Card, CardContent, Fade, Modal } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';

import { RestSimulationContext } from '../../../services/ShSimulatorService';
import { StoreContext } from '../../../services/StoreService';
import { SimulatorType } from '../../../types/RequestTypes';
import { SimulationInputFiles } from '../../../types/ResponseTypes';
import {
	BatchOptionsType,
	RunSimulationForm,
	SimulationRunType,
	SimulationSourceType
} from '../../../WrapperApp/components/Simulation/RunSimulationForm';
import { EditorJson } from '../../js/EditorJson';
import { ConcreteDialogProps } from './CustomDialog';

export function RunSimulationDialog({
	inputFiles = {},
	simulator,
	onClose,
	onSubmit = () => {},
	yaptideEditor,
	postJobDirect,
	postJobBatch
}: ConcreteDialogProps<
	{
		onSubmit?: (jobId: string) => void;
		inputFiles?: Record<string, string>;
		simulator: SimulatorType;
	} & Required<Pick<StoreContext, 'yaptideEditor'>> &
		Pick<RestSimulationContext, 'postJobDirect' | 'postJobBatch'>
>) {
	const [controller] = useState(new AbortController());
	const sendSimulationRequest = (
		postJobFn: typeof postJobDirect,
		runType: SimulationRunType,
		editorJson: EditorJson,
		inputFiles: Partial<SimulationInputFiles>,
		sourceType: SimulationSourceType,
		simName: string,
		nTasks: number,
		simulator: SimulatorType,
		batchOptions: BatchOptionsType
	) => {
		onClose();
		const simData = sourceType === 'editor' ? editorJson : inputFiles;

		const options =
			runType === 'batch'
				? {
						...batchOptions,
						arrayOptions: batchOptions.arrayOptions?.reduce(
							(acc, curr) => {
								acc[curr.optionKey] = curr.optionValue;

								return acc;
							},
							{} as Record<string, string>
						),
						collectOptions: batchOptions.collectOptions?.reduce(
							(acc, curr) => {
								acc[curr.optionKey] = curr.optionValue;

								return acc;
							},
							{} as Record<string, string>
						)
				  }
				: undefined;

		postJobFn(simData, sourceType, nTasks, simulator, simName, options, controller.signal)
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
			open={true}
			onClose={onClose}
			sx={{
				display: 'flex',
				alignItems: 'flex-start',
				mt: '15vh',
				justifyContent: 'center'
			}}>
			<Fade in={true}>
				<Card sx={{ maxWidth: '660px' }}>
					<CardContent
						sx={{
							display: 'flex',
							gap: 3
						}}>
						<RunSimulationForm
							editorJson={yaptideEditor?.toJSON()}
							inputFiles={{
								...inputFiles
							}}
							forwardedSimulator={simulator}
							runSimulation={(runType, ...rest) =>
								sendSimulationRequest(
									runType === 'direct' ? postJobDirect : postJobBatch,
									runType,
									...rest
								)
							}
						/>
					</CardContent>
				</Card>
			</Fade>
		</Modal>
	);
}
