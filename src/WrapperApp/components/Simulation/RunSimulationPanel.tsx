import RecentSimulations from './RecentSimulations';
import { RunSimulationForm, RunSimulationFormProps } from './RunSimulationForm';

export type RunSimulationPanelProps = RunSimulationFormProps;

export default function RunSimulationPanel(props: RunSimulationPanelProps) {
	return (
		<>
			<RunSimulationForm {...props} />
			<RecentSimulations />
		</>
	);
}
