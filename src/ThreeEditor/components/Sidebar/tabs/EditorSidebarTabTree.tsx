import { getBackendOptions, MultiBackend } from '@minoru/react-dnd-treeview';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
	AccordionDetails,
	AccordionSummary,
	Box,
	Button,
	Stack,
	Tooltip,
	Typography,
	useTheme
} from '@mui/material';
import { ReactElement, useId } from 'react';
import { DndProvider } from 'react-dnd';
import { Object3D } from 'three';

import StyledAccordion from '../../../../shared/components/StyledAccordion';
import { CommandButtonProps } from '../../../../util/Ui/CommandButtonProps';
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
};

export interface EditorSidebarTabTreeProps {
	children: TreeElement[];
}

function AddElementButton({ label, onClick, disabled, tooltip }: CommandButtonProps): ReactElement {
	const descriptionId = useId();

	const button = (
		<Button
			onClick={onClick}
			disabled={disabled}
			variant='contained'
			size='small'
			startIcon={<AddIcon />}
			disableElevation
			aria-describedby={tooltip ? descriptionId : undefined}>
			{label}
		</Button>
	);

	if (!tooltip) return button;

	return (
		<Tooltip title={tooltip}>
			<span
				aria-label={undefined}
				style={{ display: 'inline-flex' }}>
				{button}
				<span
					id={descriptionId}
					hidden>
					{tooltip}
				</span>
			</span>
		</Tooltip>
	);
}

function EditorSidebarTabTreeElement(props: TreeElement): ReactElement {
	const theme = useTheme();

	return (
		<StyledAccordion key={props.title}>
			<AccordionSummary expandIcon={<ExpandMoreIcon />}>
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
						<AddElementButton
							key={add.label}
							{...add}
						/>
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
						{...child}
					/>
				))}
			</Box>
		</DndProvider>
	);
}
