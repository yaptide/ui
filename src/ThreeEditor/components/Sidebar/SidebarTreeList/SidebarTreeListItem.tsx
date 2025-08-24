import { useTreeContext } from '@minoru/react-dnd-treeview';
import { NodeModel } from '@minoru/react-dnd-treeview/dist/types';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Box, Checkbox, Icon, Menu, Stack, TextField, Typography, useTheme } from '@mui/material';
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
import { BoxFigure, CylinderFigure, SphereFigure } from '../../../Simulation/Figures/BasicFigures';
import { isOutput } from '../../../Simulation/Scoring/ScoringOutput';
import { AddQuantityAction, DeleteAction, DuplicateAction, RenameAction } from './contextActions';
import BoxIcon from './svg/Box';
import CylinderIcon from './svg/Cylinder';
import SphereIcon from './svg/Sphere';

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

function getObjectIcon(object: Object3D | SimulationElement, color: string) {
	const style = { stroke: color, paddingRight: 2, paddingBottom: 1 };

	switch (true) {
		case object instanceof BoxFigure:
			return (
				<BoxIcon
					width={14}
					height={14}
					stroke={color}
					style={style}
				/>
			);
		case object instanceof CylinderFigure:
			return (
				<CylinderIcon
					width={14}
					height={14}
					style={style}
				/>
			);
		case object instanceof SphereFigure:
			return (
				<SphereIcon
					width={14}
					height={14}
					style={style}
				/>
			);
		default:
			return undefined;
	}
}

export function SidebarTreeListItem(props: {
	depth: number;
	hasChild: boolean;
	isOpen: boolean;
	onToggle: () => void;
	editor: YaptideEditor;
	node: NodeModel<TreeItemData>;
}) {
	const { depth, hasChild, isOpen, onToggle, editor, node } = props;
	const treeContext = useTreeContext();
	const theme = useTheme();

	const visibleIds = treeContext.tree
		.filter(t => t.parent === 0 || treeContext.openIds.findIndex(s => t.parent === s) > -1)
		.map(t => t.id);
	const isOdd = visibleIds.findIndex(s => s === node.id) % 2 === 0;

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

	let collapseOrExpandIcon = undefined;

	if (hasChild) {
		const IconComponent = isOpen ? RemoveIcon : AddIcon;
		collapseOrExpandIcon = <IconComponent onClick={onToggle} />;
	} else if (node.parent) {
		collapseOrExpandIcon = <Icon />;
	}

	return (
		<>
			<Box
				id={object.uuid}
				sx={{
					'paddingLeft': theme.spacing(depth * 1.5),
					'backgroundColor': isOdd
						? theme.palette.mode === 'dark'
							? 'rgba(255,255,255,0.04)'
							: 'rgba(0,0,0,0.08)'
						: 'none',
					'display': 'flex',
					'flexDirection': 'row',
					'alignItems': 'center',
					':hover': {
						backgroundColor: ({ palette }) => palette.action.hover
					}
				}}>
				{collapseOrExpandIcon}
				{getObjectIcon(
					node.data!.object,
					editor.selected === object
						? theme.palette.secondary.main
						: theme.palette.text.primary
				)}
				<Stack
					direction='row'
					onClick={() => editor.selectById(object.id)}
					width='100%'
					sx={{
						cursor: 'pointer'
					}}
					{...bindContextMenu(popupState)}>
					<Typography
						component={Box}
						sx={{
							color:
								editor.selected === object
									? theme.palette.secondary.main
									: theme.palette.text.primary,
							fontWeight:
								editor.selected === object
									? theme.typography.fontWeightBold
									: theme.typography.fontWeightRegular
						}}>
						<TextField
							inputRef={inputRef}
							sx={{ display: mode === 'view' ? 'none' : '' }}
							size='small'
							variant='standard'
							color='secondary'
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
							color='secondary'
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
