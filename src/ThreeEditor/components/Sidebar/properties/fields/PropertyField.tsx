import { Box, Checkbox, Grid, Stack, TextField, Typography } from '@mui/material';
import { ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';
import { Vector2 } from 'three';
import { Vector3 } from 'three/src/math/Vector3.js';

import { InfoTooltip } from '../../../../../shared/components/tooltip/InfoTooltip';
import {
	KEYWORD_OPTIONS,
	KEYWORD_SORT_ORDER,
	OPERATOR_OPTIONS,
	PARTICLE_OPTIONS,
	RULE_UNITS,
	RULE_VALUE_RANGES
} from '../../../../../types/SimulationTypes/DetectTypes/DetectRuleTypes';
import { AutoCompleteSelect } from '../../../../../util/genericComponents/AutoCompleteSelect';
import { createRowColor } from '../../../../../util/Ui/Color';
import { createNumberInput } from '../../../../../util/Ui/Number';
import {
	createDifferentialConfigurationRow,
	createModifiersOutliner,
	createRuleConfigurationRow,
	createRulesOutliner,
	FilterRule
} from '../../../../../util/Ui/PropertiesOutliner';
import { hideUIElement, showUIElement } from '../../../../../util/Ui/Uis';
import { YaptideEditor } from '../../../../js/YaptideEditor';
import { isFloatRule, isIDRule, isIntRule } from '../../../../Simulation/Scoring/FilterRule';
import { SCORING_MODIFIERS_TYPE } from '../../../../Simulation/Scoring/ScoringOutputTypes';
import { DifferentialModifier } from '../../../../Simulation/Scoring/ScoringQtyModifiers';
import { ObjectSelectProperty, ObjectSelectProps } from './ObjectSelectPropertyField';

export function PropertyField(props: { label?: string; disabled?: boolean; children: ReactNode }) {
	return (
		<>
			{props.label !== undefined && (
				<Grid
					size={4}
					sx={{
						opacity: props.disabled ? 0.5 : 'inherit',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'end',
						textAlign: 'right'
					}}>
					{props.label}
				</Grid>
			)}
			<Grid
				size={props.label !== undefined ? 8 : 12}
				sx={theme => ({
					'opacity': props.disabled ? 0.5 : 'inherit',
					'& .MuiOutlinedInput-input': {
						py: theme.spacing(0.5)
					}
				})}>
				{props.children}
			</Grid>
		</>
	);
}

interface LabelPropertyFieldProps {
	label: string;
	value: string;
}

export function LabelPropertyField(props: LabelPropertyFieldProps) {
	return (
		<PropertyField
			label={props.label}
			children={<Typography>{props.value}</Typography>}
		/>
	);
}

interface TextPropertyFieldProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
}

export function TextPropertyField(props: TextPropertyFieldProps) {
	return (
		<PropertyField label={props.label}>
			<TextField
				size='small'
				variant='outlined'
				value={props.value}
				onChange={event => props.onChange(event.target.value)}
			/>
		</PropertyField>
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
		if (props.unit) {
			inputRef.current.setUnit(props.unit);
		}
	}, [props.unit]);

	useEffect(() => {
		inputRef.current.setValue(props.value);
	}, [props.value, props.unit]);

	useEffect(() => {
		if (!boxRef.current) return;
		const input = inputRef.current;
		input.dom.style.width = '100%';
		const box = boxRef.current;
		box.appendChild(input.dom);

		return () => {
			box?.removeChild(input.dom);
		};
	}, []);

	useEffect(() => {
		inputRef.current.onChange((event: any) => {
			props.onChange(parseFloat(event.target.value));
		});
	}, [props]);

	return (
		<Box
			sx={theme => ({
				backgroundColor:
					theme.palette.grey[theme.palette.mode === 'light' ? 'A100' : '900'],
				py: theme.spacing(0.25),
				px: theme.spacing(0.5),
				borderRadius: theme.spacing(1),
				borderStyle: 'solid',
				borderWidth: 1,
				// https://github.com/mui/material-ui/blob/46e6588cf53a7abef986a6111e0ed49dace0bc98/packages/mui-material/src/OutlinedInput/OutlinedInput.js#L123
				borderColor:
					theme.palette.mode === 'light'
						? 'rgba(0, 0, 0, 0.23)'
						: 'rgba(255, 255, 255, 0.23)'
			})}
			ref={boxRef}
		/>
	);
}

export function ColorInput(props: { value: string; onChange: (value: number) => void }) {
	const boxRef = useRef<HTMLDivElement>(null);

	const input = useMemo(() => {
		return createRowColor({})[1];
	}, []);

	useEffect(() => {
		if (!boxRef.current) return;
		const box = boxRef.current;
		box.appendChild(input.dom);

		return () => {
			box?.removeChild(input.dom);
		};
	}, [input.dom]);

	useEffect(() => {
		input.setHexValue(props.value);
	}, [input, props.value]);

	useEffect(() => {
		input.onChange(() => {
			props.onChange(input.getHexValue());
		});
	}, [input, props]);

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
	return (
		<PropertyField label={props.label}>
			<NumberInput {...props} />
		</PropertyField>
	);
}

type XYZPropertyFieldProps = Modify<
	NumberPropertyFieldProps,
	{
		value: { x: number; y: number; z: number };
		onChange: (value: Vector3) => void;
	}
>;

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
		<PropertyField label={props.label}>
			<Stack
				direction='row'
				spacing={1}>
				<NumberInput
					{...props}
					value={props.value.x}
					onChange={onChangeX}
				/>
				<NumberInput
					{...props}
					value={props.value.y}
					onChange={onChangeY}
				/>
				<NumberInput
					{...props}
					value={props.value.z}
					onChange={onChangeZ}
				/>
			</Stack>
		</PropertyField>
	);
}

type XYPropertyFieldProps = Modify<
	NumberPropertyFieldProps,
	{
		value: { x: number; y: number };
		onChange: (value: Vector2) => void;
	}
>;

export function Vector2PropertyField(props: XYPropertyFieldProps) {
	const onChange = (value: { x: number; y: number }) => {
		const newVector = new Vector2(value.x, value.y);
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

	return (
		<PropertyField label={props.label}>
			<Stack
				direction='row'
				spacing={1}>
				<NumberInput
					{...props}
					value={props.value.x}
					onChange={onChangeX}
				/>
				<NumberInput
					{...props}
					value={props.value.y}
					onChange={onChangeY}
				/>
			</Stack>
		</PropertyField>
	);
}

interface BooleanPropertyFieldProps {
	label: string;
	value: boolean;
	onChange: (value: boolean) => void;
}

export function BooleanPropertyField(props: BooleanPropertyFieldProps) {
	return (
		<PropertyField label={props.label}>
			<Checkbox
				sx={{ padding: 0 }}
				checked={props.value}
				onChange={event => props.onChange(event.target.checked)}
			/>
		</PropertyField>
	);
}

type ConditionalPropertyFieldProps = {
	label: string;
	enabled: boolean;
	propertyDisabled?: boolean;
	onChangeEnabled: (value: boolean) => void;
};

export function ConditionalPropertyField(
	props: ConditionalPropertyFieldProps & { children: ReactNode; info?: string }
) {
	return (
		<PropertyField
			label={props.label}
			disabled={props.propertyDisabled}>
			<Stack
				direction='row'
				spacing={1}>
				<Checkbox
					sx={{ padding: 0 }}
					disabled={props.propertyDisabled}
					checked={props.enabled}
					onChange={event => props.onChangeEnabled(event.target.checked)}
				/>
				{props.enabled && props.children}
				{props.info && <InfoTooltip title={props.info} />}
			</Stack>
		</PropertyField>
	);
}

type ConditionalNumberPropertyFieldProps = NumberPropertyFieldProps & ConditionalPropertyFieldProps;

export function ConditionalNumberPropertyField(props: ConditionalNumberPropertyFieldProps) {
	return (
		<ConditionalPropertyField {...props}>
			<NumberInput {...props} />
		</ConditionalPropertyField>
	);
}

type ConditionalObjectSelectPropertyFieldProps = ObjectSelectProps & ConditionalPropertyFieldProps;

export function ConditionalObjectSelectPropertyField(
	props: ConditionalObjectSelectPropertyFieldProps
) {
	return (
		<ConditionalPropertyField {...props}>
			<ObjectSelectProperty {...props} />
		</ConditionalPropertyField>
	);
}

interface SelectPropertyFieldProps<T> {
	label: string;
	value: T | null;
	options: readonly T[];
	onChange: (value: T) => void;
	getOptionLabel?: (option: T) => string;
	isOptionEqualToValue?: (option: T, value: T) => boolean;
	onEmptied?: () => void;
}

export function SelectPropertyField<T>(props: SelectPropertyFieldProps<T>) {
	return (
		<PropertyField label={props.label}>
			<AutoCompleteSelect
				onChange={(_event, newValue) => {
					if (newValue !== null) props.onChange?.call(null, newValue);
				}}
				value={props.value}
				options={props.options}
				getOptionLabel={props.getOptionLabel}
				isOptionEqualToValue={props.isOptionEqualToValue}
				onEmptied={props.onEmptied}
			/>
		</PropertyField>
	);
}

export function ModifiersOutliner(props: {
	editor: YaptideEditor;
	value: string | null;
	options: DifferentialModifier[];
	onChange: (value: string) => void;
}) {
	const boxRef = useRef<HTMLDivElement>(null);

	// TODO: Update when props change
	const inputRef = useRef(
		createModifiersOutliner(props.editor, {
			update: () => {
				props.onChange(inputRef.current.getValue());
			}
		})[0]
	);

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
		inputRef.current.onChange(() => {
			props.onChange(inputRef.current.getValue());
		});
		inputRef.current.setOptions(props.options);
		inputRef.current.setValue(props.value);
	}, [props]);

	return (
		<Box>
			<Box ref={boxRef}></Box>
		</Box>
	);
}

type ModifiersOutlinerFieldProps = Parameters<typeof ModifiersOutliner>[0];

export function ModifiersOutlinerField(props: ModifiersOutlinerFieldProps) {
	return <PropertyField children={<ModifiersOutliner {...props} />} />;
}

export function DifferentialConfiguration(props: {
	keywordSelect: string;
	lowerLimit: number;
	upperLimit: number;
	binsNumber: number;
	logCheckbox: boolean;
	options: Record<SCORING_MODIFIERS_TYPE, SCORING_MODIFIERS_TYPE>;
	onChange: (value: {
		keywordSelect: string;
		lowerLimit: number;
		upperLimit: number;
		binsNumber: number;
		logCheckbox: boolean;
	}) => void;
	onDelete: () => void;
}) {
	const boxRef = useRef<HTMLDivElement>(null);

	// TODO: Update when props change
	const inputRef = useRef(
		(() => {
			const [
				modifierRow,
				keywordSelectField,
				lowerLimitField,
				upperLimitField,
				binsNumberField,
				logCheckboxField,
				removeButton
			] = createDifferentialConfigurationRow({
				update: () => {
					const keywordSelect = keywordSelectField.getValue();
					const lowerLimit = lowerLimitField.getValue();
					const upperLimit = upperLimitField.getValue();
					lowerLimitField.max = upperLimit;
					upperLimitField.min = lowerLimit;
					const binsNumber = binsNumberField.getValue();
					const logCheckbox = logCheckboxField.getValue();
					props.onChange({
						keywordSelect,
						lowerLimit,
						upperLimit,
						binsNumber,
						logCheckbox
					});
				},
				delete: () => {
					props.onDelete();
				},
				options: props.options
			});

			return {
				modifierRow,
				keywordSelectField,
				lowerLimitField,
				upperLimitField,
				binsNumberField,
				logCheckboxField,
				removeButton,
				group: {
					updateFields: [
						lowerLimitField,
						upperLimitField,
						binsNumberField,
						logCheckboxField,
						keywordSelectField
					],
					deleteFields: [removeButton]
				}
			};
		})()
	);

	useEffect(() => {
		if (!boxRef.current) return;
		const input = inputRef.current.modifierRow;
		const box = boxRef.current;
		box.appendChild(input.dom);

		return () => {
			box?.removeChild(input.dom);
		};
	}, []);

	useEffect(() => {
		const {
			keywordSelectField,
			lowerLimitField,
			upperLimitField,
			binsNumberField,
			logCheckboxField
		} = inputRef.current;

		inputRef.current.group.updateFields.forEach(field => {
			field.onChange(() => {
				const keywordSelect = keywordSelectField.getValue();
				const lowerLimit = lowerLimitField.getValue();
				const upperLimit = upperLimitField.getValue();
				lowerLimitField.max = upperLimit;
				upperLimitField.min = lowerLimit;
				const binsNumber = binsNumberField.getValue();
				const logCheckbox = logCheckboxField.getValue();
				props.onChange({
					keywordSelect,
					lowerLimit,
					upperLimit,
					binsNumber,
					logCheckbox
				});
			});
		});

		inputRef.current.group.deleteFields.forEach(field => {
			field.onClick(() => {
				props.onDelete();
			});
		});

		keywordSelectField.setValue(props.keywordSelect);
		lowerLimitField.setValue(props.lowerLimit);
		upperLimitField.setValue(props.upperLimit);
		binsNumberField.setValue(props.binsNumber);
		logCheckboxField.setValue(props.logCheckbox);
	}, [props]);

	return (
		<Box>
			<Box ref={boxRef}></Box>
		</Box>
	);
}

type DifferentialConfigurationFieldProps = Parameters<typeof DifferentialConfiguration>[0];

export function DifferentialConfigurationField(props: DifferentialConfigurationFieldProps) {
	return <PropertyField children={<DifferentialConfiguration {...props} />} />;
}

export function RulesOutliner(props: {
	editor: YaptideEditor;
	value: string | null;
	options: FilterRule[];
	onChange: (value: string) => void;
}) {
	const boxRef = useRef<HTMLDivElement>(null);

	// TODO: Update when props change
	const inputRef = useRef(
		createRulesOutliner(props.editor, {
			update: () => {
				props.onChange(inputRef.current.getValue());
			}
		})[0]
	);

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
		inputRef.current.onChange(() => {
			props.onChange(inputRef.current.getValue());
		});
		inputRef.current.setOptions(props.options);
		inputRef.current.setValue(props.value);
	}, [props]);

	return (
		<Box>
			<Box ref={boxRef}></Box>
		</Box>
	);
}

export function RulesConfiguration(props: {
	rule: FilterRule;
	onChange: (value: {
		keywordSelect: string;
		operatorSelect: string;
		idSelect: string;
		valueInput: number;
	}) => void;
	onDelete: () => void;
}) {
	const boxRef = useRef<HTMLDivElement>(null);
	const getRuleValue = (rule: FilterRule) => {
		const { idSelectField, valueInputField } = inputRef.current;
		let value;

		switch (true) {
			case isIDRule(rule):
				value = parseInt(idSelectField.getValue());

				break;
			case isFloatRule(rule):
				value = valueInputField.getValue();

				break;
			case isIntRule(rule):
				value = Math.floor(valueInputField.getValue());

				break;
			default:
				console.warn('Unknown rule type');
				value = 0;
		}

		return isNaN(value) ? valueInputField.min : value;
	};

	// TODO: Update when props change
	const inputRef = useRef(
		(() => {
			const [
				modifierRow,
				keywordSelectField,
				operatorSelectField,
				idSelectField,
				valueInputField,
				removeButton
			] = createRuleConfigurationRow({
				operators: OPERATOR_OPTIONS,
				options: KEYWORD_OPTIONS,
				particles: PARTICLE_OPTIONS,
				update: () => {
					const keywordSelect = keywordSelectField.getValue();
					const operatorSelect = operatorSelectField.getValue();
					const idSelect = idSelectField.getValue();

					props.onChange({
						keywordSelect,
						operatorSelect,
						idSelect,
						valueInput: getRuleValue(props.rule)
					});
				},
				delete: () => {
					props.onDelete();
				},
				sortFunc: KEYWORD_SORT_ORDER
			});

			return {
				modifierRow,
				keywordSelectField,
				operatorSelectField,
				idSelectField,
				valueInputField,
				removeButton,
				group: {
					updateFields: [
						keywordSelectField,
						operatorSelectField,
						idSelectField,
						valueInputField,
						keywordSelectField
					],
					deleteFields: [removeButton]
				}
			};
		})()
	);

	const updateRule = useCallback((rule: FilterRule) => {
		const { keywordSelectField, operatorSelectField, idSelectField, valueInputField } =
			inputRef.current;
		keywordSelectField.setValue(rule.keyword);
		operatorSelectField.setValue(rule.operator);
		idSelectField.setValue(rule.value.toString());

		if (isIDRule(rule)) {
			showUIElement(idSelectField);
			hideUIElement(valueInputField);
		} else {
			hideUIElement(idSelectField);
			showUIElement(valueInputField);
			valueInputField.setUnit(RULE_UNITS[rule.keyword as keyof typeof RULE_UNITS]);
			valueInputField.setRange(
				...RULE_VALUE_RANGES[rule.keyword as keyof typeof RULE_VALUE_RANGES]
			);

			if (isFloatRule(rule)) valueInputField.setPrecision(3);
			else valueInputField.setPrecision(0);
		}

		valueInputField.setValue(rule.value);
	}, []);

	useEffect(() => {
		if (!boxRef.current) return;
		const input = inputRef.current.modifierRow;
		const box = boxRef.current;
		box.appendChild(input.dom);

		return () => {
			box?.removeChild(input.dom);
		};
	}, []);

	useEffect(() => {
		const { keywordSelectField, operatorSelectField, idSelectField } = inputRef.current;

		inputRef.current.group.updateFields.forEach(field => {
			field.onChange(() => {
				const keywordSelect = keywordSelectField.getValue();
				const operatorSelect = operatorSelectField.getValue();
				const idSelect = idSelectField.getValue();

				props.onChange({
					keywordSelect,
					operatorSelect,
					idSelect,
					valueInput: getRuleValue(props.rule)
				});
			});
		});

		inputRef.current.group.deleteFields.forEach(field => {
			field.onClick(() => {
				props.onDelete();
			});
		});
		updateRule(props.rule);
	}, [props, updateRule]);

	return (
		<Box>
			<Box ref={boxRef}></Box>
		</Box>
	);
}
