import { useCallback, useState } from 'react';
import { Object3D } from 'three';

import { useDialog } from '../../../services/DialogService';
import { useGeant4LocalWorkerSimulation } from '../../../services/Geant4LocalWorkerSimulationContextProvider';
import { useLoader } from '../../../services/LoaderService';
import { useRemoteWorkerSimulation } from '../../../services/RemoteWorkerSimulationContextProvider';
import MenuPosition from '../../../shared/components/Menu/MenuPosition';
import { YaptideEditor } from '../../../ThreeEditor/js/YaptideEditor';
import { SimulatorType } from '../../../types/RequestTypes';
import { useSignal } from '../../../util/hooks/signals';

type EditorMenuProps = {
	editor?: YaptideEditor;
};

export function ProjectMenu({ editor }: EditorMenuProps) {
	const [openIdx, setOpenIdx] = useState(-1);
	const [, setSelectedObject] = useState(editor?.selected);
	const { getJobResults: getRemoteWorkerJobResults } = useRemoteWorkerSimulation();
	const { getJobResults: getGeant4LocalWorkerJobResults } = useGeant4LocalWorkerSimulation();
	const { loadFromJson, loadFromFiles, loadFromUrl, loadFromJsonString } = useLoader();
	const { open: openTheOpenFileDialog } = useDialog('openFile');
	const { open: openTheSaveFileDialog } = useDialog('saveFile');
	const { open: openTheNewProjectDialog } = useDialog('newProject');

	const handleObjectUpdate = useCallback((o: Object3D) => {
		setSelectedObject(o);
	}, []);

	useSignal(editor, 'objectSelected', handleObjectUpdate);

	const getJobResultsFn =
		editor?.contextManager.currentSimulator === SimulatorType.GEANT4
			? getGeant4LocalWorkerJobResults
			: getRemoteWorkerJobResults;

	return (
		<>
			<MenuPosition
				label='Project'
				idx={10}
				openIdx={openIdx}
				setOpenIdx={setOpenIdx}
				options={[
					[
						{
							label: 'New',
							onClick: () =>
								editor && openTheNewProjectDialog({ yaptideEditor: editor })
						},
						{
							label: 'Open',
							onClick: () =>
								openTheOpenFileDialog({
									loadFromFiles,
									loadFromJson,
									loadFromUrl,
									loadFromJsonString,
									dialogState: '0'
								})
						},
						{
							label: 'Save as',
							onClick: () =>
								editor &&
								openTheSaveFileDialog({
									yaptideEditor: editor,
									getJobResults: getJobResultsFn
								})
						}
					]
				]}
			/>
		</>
	);
}
