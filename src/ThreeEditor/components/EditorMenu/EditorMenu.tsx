import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, ButtonGroup, Divider, Menu, MenuItem } from '@mui/material';
import { Editor } from '../../js/Editor';
import { toggleFullscreen } from '../../util/toggleFullscreen';
import {
	AddDetectGeometryCommand,
	AddObjectCommand,
	AddZoneCommand
} from '../../js/commands/Commands';
import { BoxMesh, CylinderMesh, SphereMesh } from '../../util/BasicMeshes';

type EditorMenuProps = {
	editor?: Editor;
};
type MenuOption = {
	label: string;
	onClick: () => void;
	disabled?: boolean;
};
type MenuPositionProps = {
	label: string;
	idx: number;
	openIdx: number;
	setOpenIdx: (open: number) => void;
	options: MenuOption[][];
};
function MenuPosition({ label, idx, openIdx, setOpenIdx, options }: MenuPositionProps) {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setOpenIdx(idx);
	};
	const handleEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
		if (openIdx !== -1) setOpenIdx(idx);
	};
	const handleClose = (action?: () => void) => {
		if (action) action();
		setOpenIdx(-1);
	};
	useEffect(() => {
		if (openIdx === idx) setAnchorEl(document.getElementById('basic-button-' + idx));
		else setAnchorEl(null);
	}, [openIdx, idx]);

	return (
		<div>
			<Button
				variant='text'
				sx={{
					padding: '0',
					margin: '.2rem',
					fontSize: '.75rem',
					lineHeight: '1rem',
					width: 65,
					color: 'white'
				}}
				id={'basic-button-' + idx}
				aria-controls={Boolean(anchorEl) ? 'basic-menu' : undefined}
				aria-haspopup='true'
				aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
				onClick={handleClick}
				onMouseOver={handleEnter}>
				{label}
			</Button>
			<Menu
				id='basic-menu'
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={() => handleClose()}
				MenuListProps={{
					'aria-labelledby': 'basic-button',
					'dense': true
				}}
				sx={{}}>
				{options.map((section, row) => (
					<Box key={row}>
						{section.map((option, idx) => (
							<MenuItem
								key={idx}
								onClick={() => {
									handleClose(option.onClick);
								}}
								disabled={option.disabled}>
								{option.label}
							</MenuItem>
						))}
						{row < options.length - 1 && <Divider />}
					</Box>
				))}
			</Menu>
		</div>
	);
}

export function EditorMenu({ editor }: EditorMenuProps) {
	const [openIdx, setOpenIdx] = useState(-1);

	return (
		<ButtonGroup
			sx={{
				display: 'flex',
				zIndex: openIdx != -1 ? 2000 : 1,
				position: 'absolute',
				top: 80,
				transform: 'translateX(15px)',
				backgroundColor: 'rgba(0,0,0,.5)'
			}}>
			<MenuPosition
				label='View'
				idx={0}
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
				label='Add'
				idx={2}
				openIdx={openIdx}
				setOpenIdx={setOpenIdx}
				options={[
					[
						{
							label: 'Material Zone',
							onClick: () => {
								editor?.execute(new AddZoneCommand(editor));
							}
						}
					],
					[
						{
							label: 'Detect Geometry',
							onClick: () => {
								editor?.execute(new AddDetectGeometryCommand(editor));
							}
						}
					],
					[
						{
							label: 'Box Mesh',
							onClick: () => {
								editor?.execute(new AddObjectCommand(editor, new BoxMesh(editor)));
							}
						},
						{
							label: 'Sphere Mesh',
							onClick: () => {
								editor?.execute(
									new AddObjectCommand(editor, new SphereMesh(editor))
								);
							}
						},
						{
							label: 'Cylinder Mesh',
							onClick: () => {
								editor?.execute(
									new AddObjectCommand(editor, new CylinderMesh(editor))
								);
							}
						}
					]
				]}
			/>
			<MenuPosition
				label='Edit'
				idx={3}
				openIdx={openIdx}
				setOpenIdx={setOpenIdx}
				options={[[{ label: 'TODO', disabled: true, onClick: () => {} }]]}
			/>
		</ButtonGroup>
	);
}
