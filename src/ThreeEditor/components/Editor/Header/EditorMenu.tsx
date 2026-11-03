import { useCallback, useEffect, useReducer, useState } from 'react';
import { Object3D, Vector3 } from 'three';

import { useDialog } from '../../../../services/DialogService';
import { useStore } from '../../../../services/StoreService';
import MenuPosition from '../../../../shared/components/Menu/MenuPosition';
import { useSignal } from '../../../../util/hooks/signals';
import {
	getRemoveCommand,
	getSetPositionCommand,
	isMovable,
	isRemovable
} from '../../../../util/hooks/useKeyboardEditorControls';
import { toggleFullscreen } from '../../../../util/toggleFullscreen';
import { getAddElementButtonProps } from '../../../../util/Ui/CommandButtonProps';
import { canBeDuplicated, getDuplicateCommand } from '../../../js/commands/DuplicateObjectCommand';
import { YaptideEditor } from '../../../js/YaptideEditor';
import { isSimulationElement } from '../../../Simulation/Base/SimulationElement';

type EditorMenuProps = {
	editor?: YaptideEditor;
};

export function EditorMenu({ editor }: EditorMenuProps) {
	const { open: openClearHistory } = useDialog('clearHistory');
	const [openIdx, setOpenIdx] = useState(-1);
	const { yaptideEditor } = useStore();
	const [selected, setSelectedObject] = useState<Object3D | null>(editor?.selected ?? null);
	const [, refresh] = useReducer((x: number) => x + 1, 0);
	const [canUndo, setCanUndo] = useState((yaptideEditor?.history.undos.length ?? 0) > 0);
	const [canRedo, setCanRedo] = useState((yaptideEditor?.history.redos.length ?? 0) > 0);

	const updateHistoryButtons = useCallback(() => {
		setCanUndo((yaptideEditor?.history.undos.length ?? 0) > 0);
		setCanRedo((yaptideEditor?.history.redos.length ?? 0) > 0);
	}, [yaptideEditor]);

	useEffect(() => {
		yaptideEditor?.signals.historyChanged.add(updateHistoryButtons);

		return () => {
			yaptideEditor?.signals.historyChanged.remove(updateHistoryButtons);
		};
	}, [yaptideEditor, updateHistoryButtons]);

	const handleObjectUpdate = useCallback((o: Object3D) => {
		setSelectedObject(o);
	}, []);

	useSignal(editor, 'objectSelected', handleObjectUpdate);
	useSignal(editor, 'objectChanged', refresh);

	return (
		<>
			<MenuPosition
				label='View'
				idx={20} // arbitrary, larger than id for 'Project' menu
				openIdx={openIdx}
				setOpenIdx={setOpenIdx}
				options={[
					[
						{
							label: 'Toggle Fullscreen',
							onClick: () => {
								toggleFullscreen();
							}
						},
						{
							label: 'Reset Camera',
							onClick: () => {
								editor?.resetCamera();
							}
						}
					],
					[
						{
							label: 'Simple View',
							onClick: () => {
								editor?.signals.layoutChanged.dispatch('singleView');
							},
							disabled: editor?.config.getKey('layout') === 'singleView'
						},
						{
							label: 'Split View',
							onClick: () => {
								editor?.signals.layoutChanged.dispatch('fourViews');
							},
							disabled: editor?.config.getKey('layout') === 'fourViews'
						}
					]
				]}
			/>
			<MenuPosition
				label='Object'
				idx={21}
				openIdx={openIdx}
				setOpenIdx={setOpenIdx}
				options={[
					...(editor
						? Object.entries(getAddElementButtonProps(editor))
								.filter(
									([key, val]) =>
										key !== 'Special Components' && key !== 'Filters'
								)
								.map(([key, val]) => val)
						: [])
				]}
			/>
			<MenuPosition
				label='Edit'
				idx={22}
				openIdx={openIdx}
				setOpenIdx={setOpenIdx}
				options={[
					[
						{
							label: 'Undo',
							disabled: !canUndo,
							onClick: () => editor?.history.undo()
						},
						{
							label: 'Redo',
							disabled: !canRedo,
							onClick: () => editor?.history.redo()
						}
					],
					[
						{
							label: 'Clear history',
							onClick: () => yaptideEditor && openClearHistory({ yaptideEditor }),
							disabled:
								editor?.history.undos.length === 0 &&
								editor?.history.redos.length === 0
						}
					],
					[
						{
							label: 'Duplicate Object',
							onClick: () => {
								if (editor && selected && isSimulationElement(selected))
									editor.execute(getDuplicateCommand(editor, selected));
							},
							disabled:
								!selected ||
								!isSimulationElement(selected) ||
								!canBeDuplicated(selected)
						},
						{
							label: 'Delete Object',
							onClick: () => {
								if (editor && selected && isRemovable(selected))
									editor.execute(getRemoveCommand(editor, selected));
							},
							disabled: !selected || !isRemovable(selected)
						},
						{
							label: 'Move to Center',
							onClick: () => {
								if (editor && selected && isMovable(selected))
									editor.execute(
										getSetPositionCommand(editor, selected, new Vector3())
									);
							},
							disabled:
								!selected ||
								!isMovable(selected) ||
								selected.position.lengthSq() === 0
						}
					]
				]}
			/>
		</>
	);
}
