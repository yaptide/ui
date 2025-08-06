import { getBackendOptions, MultiBackend } from '@minoru/react-dnd-treeview';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
	AccordionDetails,
	AccordionSummary,
	Box,
	Button,
	ButtonGroup,
	Divider,
	Stack,
	Typography
} from '@mui/material';
import { ReactElement } from 'react';
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

function EditorSidebarTabTreeElement(props: TreeElement): ReactElement {
	return (
		<StyledAccordion key={props.title}>
			<AccordionSummary expandIcon={<ExpandMoreIcon />}>
				<Typography>{props.title}</Typography>
			</AccordionSummary>
			<AccordionDetails>
				<Stack
					direction='row'
					spacing={2}
					alignItems='center'>
					<Box>Add:</Box>
					<ButtonGroup
						size='small'
						fullWidth>
						{props.add.map(add => (
							<Button
								key={add.label}
								onClick={add.onClick}
								disabled={add.disabled}>
								{add.label}
							</Button>
						))}
					</ButtonGroup>
				</Stack>
				<Divider sx={{ margin: '.5rem 0' }}></Divider>

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
