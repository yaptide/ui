import { NodeModel } from '@minoru/react-dnd-treeview/dist/types';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Box, Checkbox, Icon, Menu, Stack, TextField, Typography } from '@mui/material';
import { bindContextMenu, bindMenu, usePopupState } from 'material-ui-popup-state/hooks';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Object3D } from 'three';

import { SimulationPropertiesType } from '../../../../types/SimulationProperties';
import { useSignal, useSmartWatchEditorState } from '../../../../util/hooks/signals';
import { canChangeName, isRemovable } from '../../../../util/hooks/useKeyboardEditorControls';
import { canBeDuplicated } from '../../../js/commands/DuplicateObjectCommand';
import { SetValueCommand } from '../../../js/commands/SetValueCommand';
import { YaptideEditor } from '../../../js/YaptideEditor';
import { SimulationElement } from '../../../Simulation/Base/SimulationElement';
import { isOutput } from '../../../Simulation/Scoring/ScoringOutput';
import { AddQuantityAction, DeleteAction, DuplicateAction, RenameAction } from './contextActions';

export type TreeItemData = {
	object: Object3D | SimulationElement;
	treeId: string;
	index?: number;
};

export type TreeItem = NodeModel<TreeItemData>;

function isHidable(object: Object3D | SimulationPropertiesType) {
	if ('notHidable' in object) {
		return !object.notHidable;
	}

	return true;
}

export function SidebarTreeListItem(props: {
	depth: number;
	hasChild: boolean;
	isOpen: boolean;
	onToggle: () => void;
	editor: YaptideEditor;
	node: NodeModel<{
		object: Object3D | SimulationElement;
	}>;
}) {
	const { depth, hasChild, isOpen, onToggle, editor, node } = props;

	const inputRef = useRef<HTMLInputElement>(null);
	const object = node.data!.object;

	const [mode, setMode] = useState<'view' | 'edit'>('view');
	const popupState = usePopupState({ variant: 'popover', popupId: 'sidebarTreeItemMenu' });

	const { state: watchedObject } = useSmartWatchEditorState(editor, object);

	const actions = [
		canBeDuplicated(object) && (
			<DuplicateAction
				key={'duplicate'}
				object={object}
				editor={editor}
				popupState={popupState}
			/>
		),
		canChangeName(object) && (
			<RenameAction
				key={'rename'}
				object={object}
				editor={editor}
				popupState={popupState}
				setMode={setMode}
			/>
		),
		isOutput(object) && (
			<AddQuantityAction
				key={'addQuantity'}
				object={object}
				editor={editor}
				popupState={popupState}
				isOpen={isOpen}
				onToggle={onToggle}
			/>
		),
		isRemovable(object) && (
			<DeleteAction
				key={'delete'}
				object={object}
				editor={editor}
				popupState={popupState}
			/>
		)
	];

	useEffect(() => {
		if (mode === 'edit') {
			inputRef?.current?.focus();
		}
	}, [mode]);

	// handle rename signal dispatch when F2 is clicked
	useSignal(
		editor,
		'requestRenameAction',
		useCallback(
			(objectToRename: Object3D) => {
				if (objectToRename === object) {
					setMode('edit');
				}
			},
			[object]
		)
	);

	return (
		<>
			<Box
				id={object.uuid}
				sx={{
					'marginLeft': ({ spacing }) => spacing(depth * 1.5),
					'display': 'flex',
					'flexDirection': 'row',
					'alignItems': 'center',
					':hover': {
						backgroundColor: ({ palette }) => palette.action.hover
					}
				}}>
				{hasChild ? (
					<ChevronRightIcon
						onClick={onToggle}
						sx={{
							transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
							transition: 'transform 0.2s'
						}}
					/>
				) : (
					<Icon />
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
							icon={<VisibilityOffIcon />}
							checkedIcon={<VisibilityIcon />}
						/>
					)}
				</Stack>
			</Box>

			{actions.length > 0 && (
				<Menu
					{...bindMenu(popupState)}
					anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
					transformOrigin={{ vertical: 'top', horizontal: 'left' }}>
					{actions}
				</Menu>
			)}
		</>
	);
}
