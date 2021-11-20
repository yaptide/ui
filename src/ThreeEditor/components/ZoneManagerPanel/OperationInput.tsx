import { MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useState, useEffect } from 'react';
import { Operation } from '../../util/Operation';

type OperationInputProps = {
	id: number;
	pushOperation: (op: Operation) => void;
	removeOperation: () => void;
	value?: Operation | null;
	canClear?: boolean;
};

type SelectType = Operation | '';

function OperationInput(props: OperationInputProps) {
	const [selected, setSelected] = useState<SelectType>(props?.value ?? '');

	const handleChange = (event: SelectChangeEvent<SelectType>) => {
		const value = event.target.value as SelectType;

		setSelected(value);

		if (event.target.value !== '') props.pushOperation(event.target.value as Operation);
		else props.removeOperation();
	};

	useEffect(() => {
		setSelected(props.value ?? '');
	}, [props, props.value]);

	return (
		<Select
			id={'OperationInput' + props.id}
			label={props.id}
			className='operationSelect'
			value={selected}
			onChange={handleChange}>
			<MenuItem disabled value={0}>
				<em>Operation</em>
			</MenuItem>
			{props.canClear && <MenuItem value={''}>X</MenuItem>}
			<MenuItem value={'left-subtraction'}>
				<img src='./images/L.png' alt='left subtraction' />
			</MenuItem>
			<MenuItem value={'intersection'}>
				<img src='./images/S.png' alt='intersection' />
			</MenuItem>
			<MenuItem value={'right-subtraction'}>
				<img src='./images/R.png' alt='right subtraction' />
			</MenuItem>
		</Select>
	);
}
export default OperationInput;
