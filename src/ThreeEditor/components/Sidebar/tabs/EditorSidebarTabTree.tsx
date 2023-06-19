import {
	AccordionProps,
	AccordionSummaryProps,
	Box,
	Button,
	ButtonGroup,
	Divider,
	Accordion as MuiAccordion,
	AccordionDetails as MuiAccordionDetails,
	AccordionSummary as MuiAccordionSummary,
	Stack,
	Typography,
	styled
} from '@mui/material';
import { Object3D } from 'three';
import { ReactElement } from 'react';
import { SimulationElement } from '../../../Simulation/Base/SimulationElement';

import { CommandButtonProps } from '../../../../util/Ui/CommandButtonProps';
import { DndProvider } from 'react-dnd';
import { MultiBackend, getBackendOptions } from '@minoru/react-dnd-treeview';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export interface TreeItem {
	id: number;
	parent: number;
	droppable: boolean;
	text: string;
	data: {
		object: Object3D | SimulationElement;
	};
}

const AccordionSummary = styled((props: AccordionSummaryProps) => (
	<MuiAccordionSummary {...props} />
))(({ theme }) => ({
	'backgroundColor':
		theme.palette.mode === 'dark' ? theme.palette.grey['800'] : theme.palette.grey['300'],

	'& .MuiAccordionSummary-content:is(.MuiAccordionSummary-content,.Mui-expanded)': {
		margin: theme.spacing(1),
		marginLeft: theme.spacing(0)
	},

	'minHeight': 'unset',
	'&.Mui-expanded': {
		minHeight: 'unset'
	}
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
	padding: theme.spacing(1),
	paddingTop: theme.spacing(1)
}));

const Accordion = styled((props: AccordionProps) => (
	<MuiAccordion
		square
		{...props}
	/>
))({
	'&.Mui-expanded': {
		margin: '0'
	}
});

export type TreeElement = {
	title: string;
	add: CommandButtonProps[];
	tree: ReactElement;
};

export interface EditorSidebarTabTreeProps {
	elements: TreeElement[];
}

function EditorSidebarTabTreeElement(props: TreeElement): ReactElement {
	return (
		<Accordion
			key={props.title}
			sx={{
				'&.MuiAccordion-root.Mui-expanded:before': {
					opacity: 1
				}
			}}>
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
		</Accordion>
	);
}

export function EditorSidebarTabTree(props: EditorSidebarTabTreeProps) {
	const { elements } = props;
	return (
		<DndProvider
			backend={MultiBackend}
			options={getBackendOptions()}>
			<Box
				sx={{
					width: '100%',
					resize: 'vertical',
					overflowY: 'scroll',
					height: '300px',
					padding: '.5rem'
				}}>
				{elements.map(element => (
					<EditorSidebarTabTreeElement
						key={element.title}
						{...element}
					/>
				))}
			</Box>
		</DndProvider>
	);
}
