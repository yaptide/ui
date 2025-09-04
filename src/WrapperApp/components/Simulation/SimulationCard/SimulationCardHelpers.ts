import { useSnackbar } from 'notistack';

import { useDialog } from '../../../../services/DialogService';
import { useLoader } from '../../../../services/LoaderService';
import { FullSimulationData, useShSimulation } from '../../../../services/ShSimulatorService';
import { titleToKebabCase } from '../../../../ThreeEditor/components/Dialog/CustomDialog';
import { YaptideEditor } from '../../../../ThreeEditor/js/YaptideEditor';
import { JobStatusData, SimulationInputFiles, StatusState } from '../../../../types/ResponseTypes';

interface SimulationCardHelpersProps {
	loadResults: ((jobId: string | null) => void) | undefined;
	setDisableLoadJson: React.Dispatch<React.SetStateAction<boolean>>;
	showInputFiles: ((inputFiles?: SimulationInputFiles | undefined) => void) | undefined;
	simulationStatus: JobStatusData;
	yaptideEditor: YaptideEditor | undefined;
}

const SimulationCardHelpers = ({
	loadResults,
	setDisableLoadJson,
	showInputFiles,
	simulationStatus,
	yaptideEditor
}: SimulationCardHelpersProps) => {
	const { loadFromJson } = useLoader();
	const { getJobLogs, getJobInputs, getFullSimulationData, getJobResults } = useShSimulation();
	const { enqueueSnackbar } = useSnackbar();
	const { open: openSaveFileDialog } = useDialog('saveFile');

	const statusColor = (status?: StatusState) => {
		switch (status) {
			case StatusState.FAILED:
				return 'error.main';
			case StatusState.RUNNING:
				return 'info.main';
			case StatusState.COMPLETED:
				return 'success.main';
			case StatusState.LOCAL:
				return 'warning.main';
			case StatusState.MERGING_QUEUED:
				return 'info.main';
			case StatusState.MERGING_RUNNING:
				return 'info.main';
			case StatusState.CANCELED:
				return 'grey.600';
			case StatusState.PENDING:
				return 'secondary.main';
			default:
				return '';
		}
	};

	const onClickLoadResults = () => {
		loadResults?.call(null, simulationStatus.jobId);
	};

	const onClickInputFiles = async () => {
		const inputFiles = await getJobInputs(simulationStatus);

		showInputFiles?.call(null, inputFiles?.input.inputFiles);
	};

	const onClickShowError = async (simulation: JobStatusData<StatusState.FAILED>) => {
		const errorWindow = window.open();

		const logfile = await getJobLogs(simulation);
		const logfiles = Object.entries(logfile?.logfiles ?? {}).map(([key, value]) => {
			return `<details><summary><h2 style="display: inline;">${key}</h2></summary><pre>${value}</pre></details>`;
		});

		if (!errorWindow) return console.error('Could not open new window');
		errorWindow.document.open();
		errorWindow.document.write(
			`<html>
			<head>
				<title>Log Files</title>
			</head>
			<body>
			<h1>Log Files</h1>
			${logfiles}
			</body>
			</html>`
		);
		errorWindow.document.close();
	};

	const onClickSaveToFile = () => {
		getFullSimulationData(simulationStatus)
			.then((simulation: FullSimulationData | undefined) => {
				if (yaptideEditor)
					openSaveFileDialog({
						name: `${titleToKebabCase(simulation?.title ?? 'simulation')}-result.json`,
						results: simulation,
						disableCheckbox: true,
						yaptideEditor,
						getJobResults
					});
			})
			.catch(() => {
				enqueueSnackbar('Could not load simulation data', { variant: 'error' });
			});
	};

	const onClickLoadToEditor = async (simulation: JobStatusData) => {
		const inputJson = (await getJobInputs(simulation))?.input.inputJson;

		if (!inputJson) {
			setDisableLoadJson(true);

			return enqueueSnackbar('Could not load json file', { variant: 'error' });
		}

		loadFromJson(inputJson);
	};

	return {
		statusColor,
		onClickLoadResults,
		onClickInputFiles,
		onClickShowError,
		onClickSaveToFile,
		onClickLoadToEditor
	};
};

export default SimulationCardHelpers;
