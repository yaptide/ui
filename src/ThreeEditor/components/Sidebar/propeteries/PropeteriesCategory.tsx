import { Accordion, AccordionSummary, Typography, AccordionDetails, Grid } from '@mui/material';
import { Euler, MathUtils, Object3D, Vector3 } from 'three';
import { SetValueCommand } from '../../../js/commands/SetValueCommand';
import { Editor } from '../../../js/Editor';
import { LabelPropertyField, TextPropertyField, Vector3PropertyField } from './PropertyField';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useCallback, useEffect, useState } from 'react';
import { ISimulationObject } from '../../../util/SimulationBase/SimulationObject';
import { Beam, isBeam } from '../../../util/Beam';
import { isWorldZone } from '../../../util/WorldZone/WorldZone';
import { isDetectGeometry } from '../../../util/Detect/DetectGeometry';
import { SetDetectPositionCommand } from '../../../js/commands/SetDetectPositionCommand';
import { SetPositionCommand } from '../../../js/commands/SetPositionCommand';
import { SetRotationCommand } from '../../../js/commands/SetRotationCommand';
import { SetBeamDirectionCommand } from '../../../js/commands/SetBeamDirectionCommand';

const useObjectChanged = (editor: Editor, object: Object3D, callback: () => void) => {
	useEffect(() => {
		editor.signals.objectChanged.add(callback);
		return () => {
			editor.signals.objectChanged.remove(callback);
		};
	}, [editor.signals.objectChanged, callback]);

	useEffect(() => {
		callback();
	}, [callback, object]);
};

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

export function ObjectInfo(props: { editor: Editor; object: Object3D }) {
	const { object, editor } = props;
	const [name, setName] = useState(object.name);

	const update = useCallback(() => {
		setName(object.name);
	}, [object.name]);

	useObjectChanged(editor, object, update);

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

export function ObjectPlacement(props: { editor: Editor; object: Object3D }) {
	const { object, editor } = props;
	const [position, setPosition] = useState<Vector3>();
	const [rotation, setRotation] = useState<Euler>();
	const [direction, setDirection] = useState<Vector3>();

	const hasPosition = (object: ISimulationObject): boolean => {
		return !object.notMovable;
	};

	const hasRotation = (object: ISimulationObject): boolean => {
		return !object.notRotatable && !isBeam(object);
	};

	const hasDirection = (object: ISimulationObject): object is Beam => {
		return isBeam(object);
	};

	const updatePosition = (newPosition: Vector3) => {
		if (object && object.position.distanceTo(newPosition) >= 0.01) {
			if (isWorldZone(object))
				editor.execute(new SetValueCommand(editor, object, 'center', newPosition));
			else if (isDetectGeometry(object))
				editor.execute(new SetDetectPositionCommand(editor, object, newPosition));
			else editor.execute(new SetPositionCommand(editor, object, newPosition));

			setPosition(object.position.clone());
		}
	};

	const updateRotation = (rotation: Vector3) => {
		const newRotation = new Euler(
			rotation.x * MathUtils.DEG2RAD,
			rotation.y * MathUtils.DEG2RAD,
			rotation.z * MathUtils.DEG2RAD
		);
		if (!newRotation.equals(object.rotation))
			editor.execute(new SetRotationCommand(editor, object, newRotation));

		setRotation(object.rotation.clone());
	};

	const updateDirection = (newDirection: Vector3) => {
		if (hasDirection(object) && !newDirection.equals(object.direction))
			editor.execute(new SetBeamDirectionCommand(editor, newDirection));

		setRotation(object.rotation.clone());
	};

	const update = useCallback(() => {
		setPosition(object.position.clone());
		setRotation(object.rotation.clone());
		if (hasDirection(object)) setDirection(object.direction.clone());
	}, [object]);

	useObjectChanged(editor, object, update);

	const hasPlacement = hasPosition(object) || hasRotation(object) || hasDirection(object);

	return (
		<PropertiesCategory category='Placement' visible={hasPlacement}>
			{hasPosition(object) && position && (
				<Vector3PropertyField
					label='Position'
					value={position}
					onChange={updatePosition}
					unit={editor.unit.name}
				/>
			)}

			{hasRotation(object) && rotation && (
				<Vector3PropertyField
					label='Rotation'
					step={0.1}
					unit='°'
					value={new Vector3().setFromEuler(rotation).multiplyScalar(MathUtils.RAD2DEG)}
					onChange={updateRotation}
				/>
			)}

			{hasDirection(object) && direction && (
				<Vector3PropertyField
					label='Direction'
					value={direction}
					onChange={updateDirection}
					unit={editor.unit.name}
				/>
			)}
		</PropertiesCategory>
	);
}


export function ObjectMaterial(props: { editor: Editor; object: Object3D }) {
	const { object, editor } = props;
	const [name, setName] = useState(object.name);

	const update = useCallback(() => {
		setName(object.name);
	}, [object.name]);

	useObjectChanged(editor, object, update);

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
