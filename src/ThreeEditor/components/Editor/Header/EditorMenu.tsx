import { useCallback, useEffect, useState } from 'react';
import { Object3D } from 'three';

import { useDialog } from '../../../../services/DialogService';
import { useStore } from '../../../../services/StoreService';
import MenuPosition from '../../../../shared/components/Menu/MenuPosition';
import { useSignal } from '../../../../util/hooks/signals';
import { toggleFullscreen } from '../../../../util/toggleFullscreen';
import { getAddElementButtonProps } from '../../../../util/Ui/CommandButtonProps';
import { YaptideEditor } from '../../../js/YaptideEditor';

type EditorMenuProps = {
	editor?: YaptideEditor;
};

export function EditorMenu({ editor }: EditorMenuProps) {
	const { open: openClearHistory } = useDialog('clearHistory');
	const [openIdx, setOpenIdx] = useState(-1);
	const { yaptideEditor } = useStore();
	const [, setSelectedObject] = useState(editor?.selected);
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
						: []),
					[
						{
							label: 'Paste from Clipboard',
							onClick: () => {},
							disabled: true
						}
					]
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
							onClick: () => {},
							disabled: true
						},
						{
							label: 'Delete Object',
							onClick: () => {},
							disabled: true
						},
						{
							label: 'Move to Center',
							onClick: () => {},
							disabled: true
						}
					],
					[
						{
							label: 'Copy to Clipboard',
							onClick: () => {},
							disabled: true
						}
					]
				]}
			/>
		</>
	);
}
