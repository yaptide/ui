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
	Stack
} from '@mui/material';
import { ReactElement } from 'react';
import { Object3D } from 'three';
import { SimulationObject3D } from '../../../util/SimulationBase/SimulationMesh';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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
	'& .MuiAccordionSummary-content:is(.MuiAccordionSummary-content,.Mui-expanded)': {
		marginLeft: theme.spacing(1),
		marginBottom: theme.spacing(1),
		marginTop: theme.spacing(1)
	},

	'minHeight': 'unset',
	'&.Mui-expanded': {
		minHeight: 'unset'
	}
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
	padding: theme.spacing(2),
	paddingTop: 0
}));

const Accordion = styled(MuiAccordion)(({ theme }) => ({
	'&.Mui-expanded': {
		margin: '0'
	}
}));

interface TreeElement {
	title: string;
	add: { title: string; onClick: () => void }[];
	tree: ReactElement;
}

export interface EditorSidebarTabTreeProps {
	elements: TreeElement[];
}

export function EditorSidebarTabTree(props: EditorSidebarTabTreeProps) {
	const { elements } = props;
	return (
		<Box
			sx={{
				width: '100%',
				resize: 'vertical',
				overflowY: 'scroll',
				height: '300px',
				padding: '.5rem'
			}}>
			{elements.map(element => (
				<Accordion>
					<AccordionSummary expandIcon={<ExpandMoreIcon />}>
						<Typography>{element.title}</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<Stack direction='row' spacing={2} alignItems='center'>
							<Typography>Add:</Typography>
							<ButtonGroup disableElevation size='small'>
								{element.add.map(add => (
									<Button onClick={add.onClick}>{add.title}</Button>
								))}
							</ButtonGroup>
						</Stack>
						<Divider sx={{ margin: '.5rem 0' }}></Divider>

						{element.tree}
					</AccordionDetails>
				</Accordion>
			))}
		</Box>
	);
}
