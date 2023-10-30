import { Box, Button, ButtonGroup, Divider, Menu, MenuItem } from '@mui/material';
import { MouseEvent, useCallback, useEffect, useState } from 'react';
import { Object3D } from 'three';

import { useDialog } from '../../../../services/DialogService';
import { useStore } from '../../../../services/StoreService';
import { useSignal } from '../../../../util/hooks/signals';
import { toggleFullscreen } from '../../../../util/toggleFullscreen';
import {
	CommandButtonProps,
	getAddElementButtonProps
} from '../../../../util/Ui/CommandButtonProps';
import { YaptideEditor } from '../../../js/YaptideEditor';

type EditorMenuProps = {
	editor?: YaptideEditor;
};

type MenuPositionProps = {
	label: string;
	idx: number;
	openIdx: number;
	setOpenIdx: (open: number) => void;
	options: CommandButtonProps[][];
};

function MenuPosition({ label, idx, openIdx, setOpenIdx, options }: MenuPositionProps) {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const handleClick = (_: MouseEvent<HTMLButtonElement>) => {
		setOpenIdx(idx);
	};

	const handleEnter = (_: MouseEvent<HTMLButtonElement>) => {
		if (openIdx !== -1) setOpenIdx(idx);
	};

	const handleClose = (action?: () => void) => {
		if (action) action();
		setOpenIdx(-1);
	};

	useEffect(() => {
		if (openIdx === idx) setAnchorEl(document.getElementById('basic-button-' + idx.toString()));
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
				id={'basic-button-' + idx.toString()}
				aria-controls={Boolean(anchorEl) ? 'basic-menu' : undefined}
				aria-haspopup='true'
				aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
				onClick={handleClick}
				onMouseOver={handleEnter}>
				{label}
			</Button>
			<Menu
				sx={{
					'transform': 'translateY(3px)',
					'& .MuiPaper-root': {
						borderRadius: '0 0 5px 5px'
					}
				}}
				id='basic-menu'
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={() => handleClose()}
				MenuListProps={{
					'aria-labelledby': 'basic-button',
					'dense': true
				}}>
				{options.map((section, row) => (
					<Box key={row}>
						{section.map((option, idx) => (
							<MenuItem
								sx={{
									fontSize: '.75rem',
									lineHeight: '1rem',
									padding: '.2rem .5rem'
								}}
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
	const { open: openClearHistory } = useDialog('clearHistory');
	const [openIdx, setOpenIdx] = useState(-1);
	const { yaptideEditor } = useStore();
	const [, setSelectedObject] = useState(editor?.selected);

	const handleObjectUpdate = useCallback((o: Object3D) => {
		setSelectedObject(o);
	}, []);

	useSignal(editor, 'objectSelected', handleObjectUpdate);

	return (
		<>
			<ButtonGroup
				sx={{
					display: 'flex',
					zIndex: openIdx !== -1 ? 2000 : 1,
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
						...(editor ? Object.values(getAddElementButtonProps(editor)) : []),
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
					idx={3}
					openIdx={openIdx}
					setOpenIdx={setOpenIdx}
					options={[
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
			</ButtonGroup>
		</>
	);
}
