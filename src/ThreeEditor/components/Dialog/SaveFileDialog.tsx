import { Button, Checkbox, FormControlLabel, TextField } from '@mui/material';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';

import { FullSimulationData, JobResults } from '../../../services/ShSimulatorService';
import { StoreContext } from '../../../services/StoreService';
import { RequestGetJobResults } from '../../../types/RequestTypes';
import { saveString } from '../../../util/File';
import { ConcreteDialogProps, CustomDialog } from './CustomDialog';

const saveJson = (data: {}, fileName: string) => {
	let output = undefined;

	try {
		output = JSON.stringify(data, null, '\t');
		// this regex matches new lines and tabs that are followed by a number and replaces them with just the number
		output = output.replace(/[\n\t]+([\d.e\-[\]]+)/g, '$1');
		saveString(output, `${fileName}.json`);
	} catch (e) {
		console.warn('Could not regex output. Saving without regex...', e);
		output = JSON.stringify(data);
		saveString(output, `${fileName}.json`);
	}
};

export function SaveFileDialog({
	onClose,
	name: defaultName = 'editor',
	results: providedResults,
	disableCheckbox = false,
	yaptideEditor,
	getJobResults,
	expectedEstimatorsSize
}: ConcreteDialogProps<
	{
		name?: string;
		results?: FullSimulationData;
		disableCheckbox?: boolean;
		getJobResults: (...args: RequestGetJobResults) => Promise<JobResults | undefined>;
		expectedEstimatorsSize?: number;
	} & Required<Pick<StoreContext, 'yaptideEditor'>>
>) {
	const results: FullSimulationData | undefined = providedResults ?? yaptideEditor?.getResults();

	const [controller] = useState(new AbortController());
	const [keepResults, setKeepResults] = useState<boolean>(false);
	const [fetchedResults, setFetchedResults] = useState<FullSimulationData | undefined>(results);
	const jobId = fetchedResults?.jobId;
	const shouldFetchEstimators =
		jobId && fetchedResults?.estimators.length !== expectedEstimatorsSize;

	const canKeepResults = useCallback(() => {
		return (
			disableCheckbox &&
			fetchedResults?.input.inputJson?.hash === yaptideEditor?.toSerialized().hash
		);
	}, [disableCheckbox, fetchedResults?.input.inputJson?.hash, yaptideEditor]);

	useEffect(() => {
		setKeepResults(canKeepResults() || !!providedResults);
	}, [canKeepResults, providedResults]);

	const [name, setName] = useState<string>(
		defaultName ?? yaptideEditor?.config.getKey('project/title') ?? 'editor'
	);

	const changeName = (event: ChangeEvent<HTMLInputElement>) => {
		setName(event.target.value);
	};

	const changeKeepResults = (event: ChangeEvent<HTMLInputElement>) => {
		setKeepResults(event.target.checked);
	};

	// Get results from the server if they are not provided
	useEffect(() => {
		if (shouldFetchEstimators) {
			getJobResults({ jobId }, controller.signal, false)
				.then(requestResults => {
					if (requestResults) {
						setFetchedResults(
							prevResults =>
								({
									...prevResults,
									estimators: requestResults.estimators
								}) as FullSimulationData
						);
					}
				})
				.catch(error => {
					console.error('Failed to fetch job results:', error);
				});
		}
	}, [jobId, controller.signal, getJobResults, shouldFetchEstimators]);

	return (
		<CustomDialog
			onClose={onClose}
			title='Save Project File'
			contentText={`This will generate a JSON file that can be loaded later.`}
			body={
				<form
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: 15,
						paddingTop: 20
					}}>
					<TextField
						label='File name'
						value={name}
						variant='outlined'
						onChange={changeName}
					/>
					{!canKeepResults() ||
						(!!providedResults && (
							<FormControlLabel
								label='Include simulation results'
								sx={{
									'userSelect': 'none',
									'&.MuiFormControlLabel-root': {
										paddingLeft: 1
									}
								}}
								control={
									<Checkbox
										value={keepResults}
										onChange={changeKeepResults}
									/>
								}
							/>
						))}
				</form>
			}>
			<Button
				onClick={() => {
					onClose();

					if (yaptideEditor) {
						yaptideEditor?.config.setKey('project/title', name);
						saveJson(
							keepResults && fetchedResults
								? fetchedResults
								: yaptideEditor?.toSerialized(),
							name
						);
					}
				}}>
				Save
			</Button>
		</CustomDialog>
	);
}
