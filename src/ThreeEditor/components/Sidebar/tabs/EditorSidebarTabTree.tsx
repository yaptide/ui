import { getBackendOptions, MultiBackend } from '@minoru/react-dnd-treeview';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
	AccordionDetails,
	AccordionSummary,
	Box,
	Button,
	Stack,
	Typography,
	useTheme
} from '@mui/material';
import { ReactElement, useCallback, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { Object3D } from 'three';

import StyledAccordion from '../../../../shared/components/StyledAccordion';
import { useSignal } from '../../../../util/hooks/signals';
import { isDescendantOf } from '../../../../util/isDescendantOf';
import { CommandButtonProps } from '../../../../util/Ui/CommandButtonProps';
import { YaptideEditor } from '../../../js/YaptideEditor';
import { SimulationElement } from '../../../Simulation/Base/SimulationElement';

export interface TreeItem {
	id: number;
	parent: number;
	droppable: boolean;
	text: string;
	data: {
		object: Object3D | SimulationElement;
	};
}

export type TreeElement = {
	title: string;
	add: CommandButtonProps[];
	tree: ReactElement;
	sources: Object3D[];
};

export interface EditorSidebarTabTreeProps {
	editor: YaptideEditor;
	children: TreeElement[];
}

function EditorSidebarTabTreeElement(props: TreeElement & { editor: YaptideEditor }): ReactElement {
	const { editor, sources } = props;
	const theme = useTheme();

	const containsObject = useCallback(
		(object: Object3D | null) =>
			sources.some(source => object === source || isDescendantOf(object, source)),
		[sources]
	);

	const [expanded, setExpanded] = useState(() => containsObject(editor.selected));
	const [containsSelected, setContainsSelected] = useState(() => containsObject(editor.selected));

	useSignal(
		editor,
		'objectSelected',
		useCallback(
			(object: Object3D | null) => {
				const isInside = containsObject(object);
				setContainsSelected(isInside);

				if (isInside) {
					setExpanded(true);
				}
			},
			[containsObject]
		)
	);

	return (
		<StyledAccordion
			key={props.title}
			expanded={expanded}
			onChange={(_, isExpanded) => setExpanded(isExpanded)}>
			<AccordionSummary
				expandIcon={
					<ExpandMoreIcon
						color={containsSelected && !expanded ? 'secondary' : undefined}
					/>
				}>
				<Typography>{props.title}</Typography>
			</AccordionSummary>
			<AccordionDetails>
				<Stack
					direction='row'
					spacing={1}
					sx={{
						alignItems: 'center',
						marginBottom: theme.spacing(1)
					}}>
					{props.add.map(add => (
						<Button
							key={add.label}
							onClick={add.onClick}
							disabled={add.disabled}
							variant='contained'
							size='small'
							startIcon={<AddIcon />}
							disableElevation>
							{add.label}
						</Button>
					))}
				</Stack>
				{props.tree}
			</AccordionDetails>
		</StyledAccordion>
	);
}

export function EditorSidebarTabTree(props: EditorSidebarTabTreeProps) {
	return (
		<DndProvider
			backend={MultiBackend}
			options={getBackendOptions()}>
			<Box
				sx={{
					resize: 'vertical',
					minHeight: '300px',
					overflowY: 'auto'
				}}>
				{props.children.map(child => (
					<EditorSidebarTabTreeElement
						key={child.title}
						editor={props.editor}
						{...child}
					/>
				))}
			</Box>
		</DndProvider>
	);
}
