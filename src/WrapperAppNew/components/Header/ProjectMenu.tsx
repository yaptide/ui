import { useCallback, useState } from 'react';
import { Object3D } from 'three';

import { useDialog } from '../../../services/DialogService';
import { useLoader } from '../../../services/LoaderService';
import { useShSimulation } from '../../../services/ShSimulatorService';
import MenuPosition from '../../../shared/components/Menu/MenuPosition';
import { YaptideEditor } from '../../../ThreeEditor/js/YaptideEditor';
import { useSignal } from '../../../util/hooks/signals';

type EditorMenuProps = {
	editor?: YaptideEditor;
};

export function ProjectMenu({ editor }: EditorMenuProps) {
	const [openIdx, setOpenIdx] = useState(-1);
	const [, setSelectedObject] = useState(editor?.selected);
	const { getJobResults } = useShSimulation();
	const { loadFromJson, loadFromFiles, loadFromUrl, loadFromJsonString } = useLoader();
	const { open: openTheOpenFileDialog } = useDialog('openFile');
	const { open: openTheSaveFileDialog } = useDialog('saveFile');
	const { open: openTheNewProjectDialog } = useDialog('newProject');

	const handleObjectUpdate = useCallback((o: Object3D) => {
		setSelectedObject(o);
	}, []);

	console.log(editor);

	useSignal(editor, 'objectSelected', handleObjectUpdate);

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
								openTheSaveFileDialog({ yaptideEditor: editor, getJobResults })
						}
					]
				]}
			/>
		</>
	);
}
