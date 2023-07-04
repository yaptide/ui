import { NodeModel, TreeMethods } from '@minoru/react-dnd-treeview/dist/types';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Checkbox, Menu, MenuItem, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { Stack } from '@mui/system';
import { bindContextMenu, bindMenu, usePopupState } from 'material-ui-popup-state/hooks';
import { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';
import { Object3D } from 'three';

import { SimulationPropertiesType } from '../../../../types/SimulationProperties';
import { useSignal, useSmartWatchEditorState } from '../../../../util/hooks/signals';
import {
	canChangeName,
	getRemoveCommand,
	hasVisibleChildren,
	isRemovable
} from '../../../../util/hooks/useKeyboardEditorControls';
import { AddQuantityCommand } from '../../../js/commands/AddQuantityCommand';
import { SetValueCommand } from '../../../js/commands/SetValueCommand';
import { YaptideEditor } from '../../../js/YaptideEditor';
import { SimulationElement } from '../../../Simulation/Base/SimulationElement';
import { isOutput } from '../../../Simulation/Scoring/ScoringOutput';

export type TreeItem = NodeModel<{
	object: Object3D<THREE.Event> | SimulationElement;
	treeId: string;
	index?: number;
}>;

function isHidable(object: Object3D | SimulationPropertiesType) {
	if ('notHidable' in object) {
		return !object.notHidable;
	}

	return true;
}

export function SidebarTreeItem(props: {
	treeRef: TreeMethods | null;
	objectRefs: MutableRefObject<Map<string, HTMLDivElement>>;
	node: NodeModel<{
		object: Object3D | SimulationElement;
	}>;
	depth: number;
	isOpen: boolean;
	onToggle: () => void;
	editor: YaptideEditor;
}) {
	const { objectRefs, node, depth, isOpen, onToggle, editor, treeRef } = props;
	const inputRef = useRef<HTMLInputElement>(null);

	const object = node.data!.object;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object);

	const [mode, setMode] = useState<'view' | 'edit'>('view');

	const popupState = usePopupState({ variant: 'popover', popupId: 'sidebarTreeItemMenu' });

	const contextOptions = (() => {
		const options: JSX.Element[] = [];

		if (canChangeName(object)) {
			options.push(
				<MenuItem
					key={'rename'}
					onClick={() => {
						popupState.close();
						setMode('edit');
					}}>
					Rename
				</MenuItem>
			);
		}

		if (isOutput(object))
			options.push(
				<MenuItem
					key={'addQuantity'}
					onClick={() => {
						editor.execute(new AddQuantityCommand(editor, object));

						if (!isOpen) onToggle();
						popupState.close();
					}}>
					Add Quantity
				</MenuItem>
			);

		if (isRemovable(object))
			options.push(
				<MenuItem
					key={'delete'}
					onClick={() => {
						editor.execute(getRemoveCommand(editor, object));
						popupState.close();
					}}>
					Delete
				</MenuItem>
			);

		return options;
	})();

	useEffect(() => {
		if (mode === 'edit') {
			inputRef?.current?.focus();
		}
	}, [mode]);

	const onObjectAdded = useCallback(
		(newObject: Object3D) => {
			if (newObject.parent === object) {
				treeRef?.open(node.id);
			}
		},
		[node.id, object, treeRef]
	);

	useSignal(editor, 'objectAdded', onObjectAdded);

	const onRequestRenameAction = useCallback(
		(objectToRename: Object3D) => {
			if (objectToRename === object) {
				setMode('edit');
			}
		},
		[object]
	);

	useSignal(editor, 'requestRenameAction', onRequestRenameAction);

	return (
		<>
			<Box
				ref={ref => objectRefs.current.set(object.uuid, ref! as HTMLDivElement)}
				sx={{
					'marginLeft': ({ spacing }) => spacing(depth * 2.5),

					'display': 'flex',
					'flexDirection': 'row',
					'alignItems': 'center',
					'paddingLeft': ({ spacing }) => spacing(0.5),
					':hover': {
						backgroundColor: ({ palette }) => palette.action.hover
					}
				}}>
				{hasVisibleChildren(object) && (
					<ChevronRightIcon
						onClick={onToggle}
						sx={{
							transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
							transition: 'transform 0.2s'
						}}
					/>
				)}
				<Stack
					direction='row'
					onClick={() => editor.selectById(object.id)}
					width='100%'
					sx={{ cursor: 'pointer' }}
					{...bindContextMenu(popupState)}>
					<Typography
						component={Box}
						sx={{
							color: ({ palette }) =>
								editor.selected === object
									? palette.primary.main
									: palette.text.primary,
							fontWeight: ({ typography }) =>
								editor.selected === object
									? typography.fontWeightBold
									: typography.fontWeightRegular
						}}>
						<TextField
							inputRef={inputRef}
							sx={{ display: mode === 'view' ? 'none' : '' }}
							size='small'
							variant='standard'
							value={watchedObject.name}
							onChange={event =>
								editor.execute(
									new SetValueCommand(
										editor,
										watchedObject.object,
										'name',
										event.target.value
									)
								)
							}
							onKeyDown={ev => {
								if (ev.key === 'Enter') {
									ev.preventDefault();
									setMode('view');
								}
							}}
							onBlur={() => setMode('view')}
						/>
						<span style={{ display: mode === 'view' ? '' : 'none' }}>{node.text}</span>
					</Typography>

					{isHidable(object) && (
						<Checkbox
							sx={{ padding: 0, marginLeft: 'auto' }}
							checked={object.visible}
							onClick={e => e.stopPropagation()}
							onChange={(_, value) => {
								editor.execute(
									new SetValueCommand(editor, object, 'visible', value)
								);
							}}
							disabled={object.parent?.visible === false}
							icon={<VisibilityOffIcon />}
							checkedIcon={<VisibilityIcon />}
						/>
					)}
				</Stack>
			</Box>

			{contextOptions.length > 0 && (
				<Menu
					{...bindMenu(popupState)}
					anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
					transformOrigin={{ vertical: 'top', horizontal: 'left' }}>
					{contextOptions}
				</Menu>
			)}
		</>
	);
}
