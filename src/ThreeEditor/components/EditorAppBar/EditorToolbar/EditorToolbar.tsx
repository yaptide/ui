import { Box, Divider, IconButton, styled, Tooltip } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SelectSpeedDial, SelectTool } from './SelectSpeedDial';
import HighlightAltIcon from '@mui/icons-material/HighlightAlt';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import ThreeSixtyIcon from '@mui/icons-material/ThreeSixty';
import TransformIcon from '@mui/icons-material/Transform';
import Toolbar from '@mui/material/Toolbar';
import { Editor } from '../../../js/Editor';

enum Tool {
	SELECT,
	MOVE,
	ROTATE,
	TRANSFORM
}

const ToolStrings = {
	[Tool.SELECT]: 'select',
	[Tool.MOVE]: 'translate',
	[Tool.ROTATE]: 'rotate',
	[Tool.TRANSFORM]: 'scale'
};

type EditorToolbarProps = {
	editor?: Editor;
};

export function EditorToolbar({ editor }: EditorToolbarProps) {
	const [tool, setTool] = useState<Tool>(Tool.MOVE);
	const [selectTool, setSelectTool] = useState<SelectTool | undefined>();

	const toolButtons = useMemo(
		() => [
			{
				label: 'Move',
				icon: <OpenWithIcon />,
				value: Tool.MOVE
			},
			{
				label: 'Rotate',
				icon: <ThreeSixtyIcon />,
				value: Tool.ROTATE
			},
			{
				label: 'Scale',
				icon: <TransformIcon />,
				value: Tool.TRANSFORM
			}
		],
		[]
	);
	const setTransformTool = useCallback(
		(tool: string) => {
			setTool(Object.values(ToolStrings).indexOf(tool) as Tool);
		},
		[setTool]
	);

	useEffect(() => {
		if (editor) {
			editor.signals.transformModeChanged.add(setTransformTool);
		}
		return () => editor?.signals.transformModeChanged.remove(setTransformTool);
	}, [editor, setTransformTool]);

	const onClick = (value: Tool) => {
		editor?.signals.transformModeChanged.dispatch(ToolStrings[value] ?? 'translate');
	};

	const SelectedButton = styled(IconButton)({
		backgroundColor: 'rgba(255, 255, 255, 0.08)'
	});
	return (
		<>
			<SelectSpeedDial
				selected={tool == Tool.SELECT}
				onClick={() => {}}
				tool={selectTool}
				setTool={setSelectTool}
			/>
			<Divider
				orientation='vertical'
				flexItem
				sx={{
					margin: '0 15px'
				}}
			/>
			{toolButtons.map(({ label, icon, value }, idx) => (
				<Box key={idx} mr={1}>
					<Tooltip title={label}>
						{tool == value ? (
							<SelectedButton
								size='small'
								edge='end'
								color='inherit'
								// component='span'
								aria-label={'menu-' + label}
								onClick={() => onClick(value)}>
								{icon}
							</SelectedButton>
						) : (
							<IconButton
								size='small'
								edge='end'
								color='inherit'
								component='span'
								aria-label={'menu-' + label}
								onClick={() => onClick(value)}>
								{icon}
							</IconButton>
						)}
					</Tooltip>
				</Box>
			))}
		</>
	);
}