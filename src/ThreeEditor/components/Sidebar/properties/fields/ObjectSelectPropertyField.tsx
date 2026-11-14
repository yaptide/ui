import { AutoCompleteSelect } from '../../../../../util/genericComponents/AutoCompleteSelect';
import { PropertyField } from './PropertyField';

export interface ObjectSelectProps {
	options: Record<string | number, string>;
	groups?: Record<string, string>;
	value: string | number;
	onChange: (value: ObjectSelectOptionType) => void;
}

export type ObjectSelectOptionType = {
	uuid: string;
	label: string;
};

export function ObjectSelectProperty(props: ObjectSelectProps) {
	const optionMap = new Map<string | number, ObjectSelectOptionType>();

	const { groups } = props;

	const options = Object.entries(props.options).map(([key, value]) => {
		const option = { uuid: key, label: value };
		optionMap.set(key, option);

		return option;
	});

	if (groups) options.sort((a, b) => (groups[a.uuid] ?? '').localeCompare(groups[b.uuid] ?? ''));

	return (
		<AutoCompleteSelect
			onChange={(_event, newValue) => {
				if (newValue !== null) props.onChange?.call(null, newValue);
			}}
			value={optionMap.get(props.value) ?? null}
			options={options}
			groupBy={groups ? option => groups[option.uuid] ?? '' : undefined}
			getOptionLabel={option => option.label || ''}
			isOptionEqualToValue={(option, value) => option.uuid === value.uuid}
		/>
	);
}

export interface ObjectSelectPropertyFieldProps extends ObjectSelectProps {
	label: string;
}

export function ObjectSelectPropertyField(props: ObjectSelectPropertyFieldProps) {
	return (
		<PropertyField
			label={props.label}
			children={<ObjectSelectProperty {...props} />}
		/>
	);
}
