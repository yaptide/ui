import { Accordion, AccordionSummary, Typography, AccordionDetails, Grid } from '@mui/material';
import { Object3D } from 'three';
import { SetValueCommand } from '../../../../js/commands/SetValueCommand';
import { Editor } from '../../../../js/Editor';
import { LabelPropertyField, TextPropertyField } from '../PropertyField';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useCallback, useState } from 'react';
import { useSignalObjectChanged } from '../../../../util/hooks/signals';

export function PropertiesCategory(props: {
	category: string;
	children: React.ReactNode;
	visible?: boolean;
}) {
	return (
		<Accordion key={props.category} sx={{ display: props.visible ?? true ? '' : 'none' }}>
			<AccordionSummary expandIcon={<ExpandMoreIcon />}>
				<Typography>{props.category}</Typography>
			</AccordionSummary>
			<AccordionDetails>
				<Grid container spacing={2}>
					{props.children}
				</Grid>
			</AccordionDetails>
		</Accordion>
	);
}

export function ObjectMaterial(props: { editor: Editor; object: Object3D }) {
	const { object, editor } = props;
	const [name, setName] = useState(object.name);

	const update = useCallback(() => {
		setName(object.name);
	}, [object.name]);

	useSignalObjectChanged(editor, update);

	return (
		<PropertiesCategory category='Information'>
			<LabelPropertyField label='ID' value={object.id.toString()} />
			<LabelPropertyField label='Type' value={object.type} />
			<TextPropertyField
				label='Name'
				value={name}
				onChange={value => {
					editor.execute(new SetValueCommand(editor, editor.selected, 'name', value));
				}}
			/>
		</PropertiesCategory>
	);
}
