import {
	Box,
	Accordion as MuiAccordion,
	AccordionDetails as MuiAccordionDetails,
	AccordionSummary as MuiAccordionSummary,
	Typography,
	Button,
	ButtonGroup,
	AccordionSummaryProps,
	styled,
	Divider,
	Stack,
	AccordionProps,
	useMediaQuery
} from '@mui/material';
import { ReactElement } from 'react';
import { Object3D } from 'three';
import { SimulationObject3D } from '../../../util/SimulationBase/SimulationMesh';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DndProvider } from 'react-dnd';
import { getBackendOptions, MultiBackend } from '@minoru/react-dnd-treeview';

export interface TreeItem {
	id: number;
	parent: number;
	droppable: boolean;
	text: string;
	data: {
		object: Object3D | SimulationObject3D;
	};
}

const AccordionSummary = styled((props: AccordionSummaryProps) => (
	<MuiAccordionSummary {...props} />
))(({ theme }) => ({
	'backgroundColor': useMediaQuery('(prefers-color-scheme: dark)')
		? theme.palette.grey['800']
		: theme.palette.grey['300'],

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

const Accordion = styled((props: AccordionProps) => <MuiAccordion square {...props} />)(
	({ theme }) => ({
		'&.Mui-expanded': {
			margin: '0'
		}
	})
);

interface TreeElement {
	title: string;
	add: { title: string; onClick: () => void; isDisabled?: () => boolean }[];
	tree: ReactElement;
}

export interface EditorSidebarTabTreeProps {
	elements: TreeElement[];
}

function EditorSidebarTabTreeElement(props: TreeElement): ReactElement {
	return (
		<Accordion key={props.title}>
			<AccordionSummary expandIcon={<ExpandMoreIcon />}>
				<Typography>{props.title}</Typography>
			</AccordionSummary>
			<AccordionDetails>
				<Stack direction='row' spacing={2} alignItems='center'>
					<Typography>Add:</Typography>
					<ButtonGroup size='small'>
						{props.add.map(add => (
							<Button
								key={add.title}
								onClick={add.onClick}
								disabled={add.isDisabled?.call(null) ?? false}>
								{add.title}
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
		<DndProvider backend={MultiBackend} options={getBackendOptions()}>
			<Box
				sx={{
					width: '100%',
					resize: 'vertical',
					overflowY: 'scroll',
					height: '300px',
					padding: '.5rem'
				}}>
				{elements.map(element => (
					<EditorSidebarTabTreeElement key={element.title} {...element} />
				))}
			</Box>
		</DndProvider>
	);
}
