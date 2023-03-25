import { MenuItem, Select } from '@mui/material';
import { SelectChangeEvent, SelectProps } from '@mui/material/Select/Select';
import { useRef } from 'react';
import { Object3D, Color } from 'three';

type GeometryIdSelectProps = SelectProps<string> & {
	allObjects: Object3D[];
	canSelectEmpty?: boolean;
};

export function GeometryIdSelect({
	labelId = 'GeometryLabel',
	id = 'GeometryInput',
	fullWidth = true,
	defaultOpen = true,
	...props
}: GeometryIdSelectProps) {
	const { allObjects, canSelectEmpty, ...restProps } = props;
	const selectRef = useRef<HTMLSelectElement>(null);
	if (selectRef.current) selectRef.current.focus();
	return (
		<Select
			ref={selectRef}
			labelId={labelId}
			id={id}
			fullWidth={fullWidth}
			defaultOpen={defaultOpen}
			{...restProps}>
			{canSelectEmpty && (
				<MenuItem
					value={''}
					divider
					sx={{
						'& em': {
							color: 'text.secondary',
							paddingBlock: 0.5
						}
					}}>
					<em>Unselect</em>
				</MenuItem>
			)}
			{allObjects.map((geo, index) => {
				return (
					<MenuItem key={geo.id} value={geo.id} dense>
						{geo.name}:{geo.id}
					</MenuItem>
				);
			})}
		</Select>
	);
}
