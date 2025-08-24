import OpenWithIcon from '@mui/icons-material/OpenWith';
import ThreeSixtyIcon from '@mui/icons-material/ThreeSixty';
import TransformIcon from '@mui/icons-material/Transform';
import { Box, IconButton, Paper, styled, Tooltip, useTheme } from '@mui/material';
import { SxProps } from '@mui/material/styles';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { YaptideEditor } from '../../js/YaptideEditor';

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
	editor?: YaptideEditor;
	sx?: SxProps;
};

export function EditorToolbar({ editor, sx }: EditorToolbarProps) {
	const [tool, setTool] = useState<Tool>(Tool.MOVE);
	const theme = useTheme();

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
				value: Tool.TRANSFORM,
				disabled: true
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
		<Paper
			elevation={3}
			sx={{
				...sx,
				display: 'flex',
				flexDirection: 'row',
				alignItems: 'center',
				borderStyle: 'solid',
				borderWidth: 1,
				borderColor: theme.palette.divider,
				padding: 0.2
			}}>
			{toolButtons.map(({ label, icon, value, disabled }, idx) => (
				<Box
					key={idx}
					mr={1}>
					<Tooltip title={label}>
						{tool === value ? (
							<SelectedButton
								size='small'
								edge='end'
								color='inherit'
								disabled={disabled}
								aria-label={'menu-' + label}
								onClick={() => onClick(value)}>
								{icon}
							</SelectedButton>
						) : (
							<IconButton
								size='small'
								edge='end'
								color='inherit'
								disabled={disabled}
								component='span'
								aria-label={'menu-' + label}
								onClick={() => onClick(value)}>
								{icon}
							</IconButton>
						)}
					</Tooltip>
				</Box>
			))}
		</Paper>
	);
}
