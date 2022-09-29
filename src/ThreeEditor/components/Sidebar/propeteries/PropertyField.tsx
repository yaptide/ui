import { Grid, Stack, TextField, Typography } from '@mui/material';
import { ReactElement, useCallback, useEffect, useState } from 'react';
import { Vector3 } from 'three/src/math/Vector3';
import { isNumeric } from '../../../../util/util';

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
	unit?: string;
	step?: number;
	onChange: (value: number) => void;
}) {
	const [value, setValue] = useState('');

	const updateValue = useCallback(() => {
		setValue(props.value + '');
	}, [props.value]);

	const sendChange = () => {
		if (!isNumeric(value)) return updateValue();
		const newValue = parseFloat(value);
		props.onChange(newValue);
	};

	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setValue(event.target.value);
	};

	const onEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key !== 'Enter') return;
		console.log('enter');
		sendChange();
	};

	const onBlur = () => {
		sendChange();
	};

	useEffect(() => {
		updateValue();
	}, [updateValue]);

	return (
		<Stack direction='row' spacing={0} alignItems='center'>
			<TextField
				onBlur={onBlur}
				inputProps={{ inputMode: 'numeric', step: props.step ?? 0.01 }}
				size='small'
				variant='standard'
				value={value}
				onChange={onChange}
				onKeyPress={onEnter}
			/>
			{props.unit && <Typography>[{props.unit}]</Typography>}
		</Stack>
	);
}

interface NumberPropertyFieldProps {
	label: string;
	value: number;
	unit?: string;
	step?: number;
	onChange: (value: number) => void;
}

export function NumberPropertyField(props: NumberPropertyFieldProps) {
	return (
		<PropertyField
			label={props.label}
			field={
				<NumberInput
					value={props.value}
					unit={props.unit}
					step={props.step}
					onChange={props.onChange}
				/>
			}
		/>
	);
}

interface XYZPropertyFieldProps {
	label: string;
	value: { x: number; y: number; z: number };
	unit?: string;
	step?: number;
	onChange: (value: Vector3) => void;
}

export function Vector3PropertyField(props: XYZPropertyFieldProps) {
	const onChange = (value: { x: number; y: number; z: number }) => {
		const newVector = new Vector3(value.x, value.y, value.z);
		props.onChange(newVector);
	};

	return (
		<PropertyField
			label={props.label}
			field={
				<Stack direction='row' spacing={1}>
					<NumberInput
						value={props.value.x}
						unit={props.unit}
						step={props.step}
						onChange={x => onChange({ ...props.value, x })}
					/>
					<NumberInput
						value={props.value.y}
						unit={props.unit}
						step={props.step}
						onChange={y => onChange({ ...props.value, y })}
					/>
					<NumberInput
						value={props.value.z}
						unit={props.unit}
						step={props.step}
						onChange={z => onChange({ ...props.value, z })}
					/>
				</Stack>
			}
		/>
	);
}
