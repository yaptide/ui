import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Grid } from '@mui/material';
import { BoxProps } from '@mui/system/Box/Box';
import { Object3D, Vector3 } from 'three';
import { Editor } from '../../../js/Editor';
import {
	LabelPropertyField,
	NumberPropertyField,
	TextPropertyField,
	Vector3PropertyField
} from './PropertyField';
import { useCallback, useEffect, useState } from 'react';
import { ObjectInfo, ObjectPlacement } from './PropeteriesCategory';

type FieldType = 'label' | 'text' | 'number' | 'vector3' | 'select';
interface IProprieties<T> {
	[propName: string]: {
		[filedName: string]: {
			property: keyof T;
			fieldType: FieldType;
			onChange?: (value: any) => void;
		};
	};
}

export function PropertiesPanel(props: { boxProps: BoxProps; editor: Editor }) {
	const { boxProps, editor } = props;
	const [selectedObject, setSelectedObject] = useState(editor.selected);

	const createInput = useCallback(
		(
			fieldType: FieldType,
			property: string,
			label: string,
			onChange: (value: string | number | Vector3) => void
		) => {
			switch (fieldType) {
				case 'label':
					return <LabelPropertyField label={label} value={selectedObject[property]} />;

				case 'text':
					return (
						<TextPropertyField
							label={label}
							value={selectedObject[property]}
							onChange={onChange}
						/>
					);

				case 'number':
					return (
						<NumberPropertyField
							label={label}
							value={selectedObject[property]}
							onChange={onChange}
						/>
					);
				case 'vector3':
					return (
						<Vector3PropertyField
							label={label}
							value={selectedObject[property]}
							onChange={onChange}
						/>
					);
			}
		},
		[selectedObject]
	);

	const updateProperties = useCallback(() => {
		const objectProperties: IProprieties<Object3D> = {
			'Placement': {
				Position: {
					property: 'position',
					fieldType: 'vector3',
					onChange: (newPosition: Vector3) => {
						
					}
				}
			},
			'Quantity': {},
			'Output': {},

			'Dimensions': {},
			'Grid': {},

			'Zone Operations': {},
			'Scoring Rules': {},
			'Material': {}
		};
		return Object.keys(objectProperties).map(category => {
			const fields = Object.keys(objectProperties[category]).map(fieldKey => {
				const field = objectProperties[category][fieldKey];
				return createInput(
					field.fieldType,
					field.property,
					fieldKey,
					field.onChange ?? (() => {})
				);
			});

			return (
				<Accordion key={category}>
					<AccordionSummary expandIcon={<ExpandMoreIcon />}>
						<Typography>{category}</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<Grid container spacing={2}>
							{fields}
						</Grid>
					</AccordionDetails>
				</Accordion>
			);
		});
	}, [createInput, editor, selectedObject]);

	const handleObjectUpdate = useCallback((object: Object3D | null) => {		
		setSelectedObject(object);
	}, []);

	useEffect(() => {
		editor.signals.objectSelected.add(handleObjectUpdate);
		editor.signals.objectChanged.add(handleObjectUpdate);
		return () => {
			editor.signals.objectSelected.remove(handleObjectUpdate);
			editor.signals.objectChanged.remove(handleObjectUpdate);
		};
	}, [editor.signals.objectChanged, editor.signals.objectSelected, handleObjectUpdate]);

	return (
		<Box {...boxProps}>
			{selectedObject && (
				<>
					<ObjectInfo editor={editor} object={selectedObject} />
					<ObjectPlacement editor={editor} object={selectedObject} />
					<ObjectInfo editor={editor} object={selectedObject} />
				</>
			)}
		</Box>
	);
}
