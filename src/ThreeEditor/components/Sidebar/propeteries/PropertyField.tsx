import { Box, Grid, Stack, TextField, Typography } from '@mui/material';
import { ReactElement, useEffect, useRef } from 'react';
import { Vector3 } from 'three/src/math/Vector3';
import { createNumberInput } from '../../../util/Ui/Number';

export function PropertyField(props: { label: string; field: ReactElement }) {
	return (
		<>
			<Grid item xs={3} sx={{ textAlign: 'right' }}>
				{props.label}
			</Grid>
			<Grid item xs={9}>
				{props.field}
			</Grid>
		</>
	);
}

interface LabelPropertyFieldProps {
	label: string;
	value: string;
}

export function LabelPropertyField(props: LabelPropertyFieldProps) {
	return <PropertyField label={props.label} field={<Typography>{props.value}</Typography>} />;
}

interface TextPropertyFieldProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
}

export function TextPropertyField(props: TextPropertyFieldProps) {
	return (
		<PropertyField
			label={props.label}
			field={
				<TextField
					size='small'
					variant='standard'
					value={props.value}
					onChange={event => props.onChange(event.target.value)}
				/>
			}
		/>
	);
}

export function NumberInput(props: {
	value: number;
	precision?: number;
	min?: number;
	max?: number;
	unit?: string;
	nudge?: number;
	step?: number;
	onChange: (value: number) => void;
}) {
	const boxRef = useRef<HTMLDivElement>(null);


	// TODO: Update when props change
	const inputRef = useRef(
		createNumberInput({
			...props,
			update: event => {
				props.onChange(parseFloat(event.target.value));
			}
		})
	);

	useEffect(() => {
		inputRef.current.setValue(props.value);
	}, [props.value]);

	useEffect(() => {
		if (!boxRef.current) return;
		const input = inputRef.current;
		const box = boxRef.current;
		box.appendChild(input.dom);
		return () => {
			box?.removeChild(input.dom);
		};
	}, []);

	useEffect(() => {
		(inputRef.current as any).onChange((event: any) => {
			props.onChange(parseFloat(event.target.value));
		});
	}, [props]);

	return (
		<Box>
			<Box ref={boxRef}></Box>
		</Box>
	);
}

interface NumberPropertyFieldProps {
	label: string;
	value: number;
	precision?: number;
	min?: number;
	max?: number;
	unit?: string;
	nudge?: number;
	step?: number;
	onChange: (value: number) => void;
}

export function NumberPropertyField(props: NumberPropertyFieldProps) {
	return <PropertyField label={props.label} field={<NumberInput {...props} />} />;
}

interface XYZPropertyFieldProps {
	label: string;
	value: { x: number; y: number; z: number };
	precision?: number;
	min?: number;
	max?: number;
	unit?: string;
	nudge?: number;
	step?: number;
	onChange: (value: Vector3) => void;
}

export function Vector3PropertyField(props: XYZPropertyFieldProps) {
	const onChange = (value: { x: number; y: number; z: number }) => {
		const newVector = new Vector3(value.x, value.y, value.z);
		props.onChange(newVector);
	};

	const getValue = () => {
		return props.value;
	};

	const onChangeX = (value: number) => {
		onChange({ ...getValue(), x: value });
	};
	const onChangeY = (value: number) => {
		onChange({ ...getValue(), y: value });
	};
	const onChangeZ = (value: number) => {
		onChange({ ...getValue(), z: value });
	};

	return (
		<PropertyField
			label={props.label}
			field={
				<Stack direction='row' spacing={1}>
					<NumberInput {...props} value={props.value.x} onChange={onChangeX} />
					<NumberInput {...props} value={props.value.y} onChange={onChangeY} />
					<NumberInput {...props} value={props.value.z} onChange={onChangeZ} />
				</Stack>
			}
		/>
	);
}
