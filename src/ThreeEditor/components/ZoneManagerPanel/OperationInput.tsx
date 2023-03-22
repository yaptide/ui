import JoinInnerIcon from '@mui/icons-material/JoinInner';
import JoinLeftIcon from '@mui/icons-material/JoinLeft';
import UndoIcon from '@mui/icons-material/Undo';
import { IconButton, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useEffect, useState } from 'react';
import { Operation } from '../../util/Operation';

type OperationInputProps = {
	id: number;
	switchOperation: (op: SelectType) => void;
	value?: SelectType;
	canClear?: boolean;
};

type SelectType = Operation | null;

function OperationInput(props: OperationInputProps) {
	const [selected, setSelected] = useState<SelectType | null>(props?.value ?? null);

	const handleChange = (value: any) => {
		if (props.canClear || value !== null) {
			setSelected(value);
			props.switchOperation(value);
		}
	};

	useEffect(() => {
		setSelected(props.value ?? null);
	}, [props, props.value]);

	return (
		<>
			{props.canClear && selected !== null && (
				<IconButton
					onClick={() => handleChange(null)}
					sx={{
						margin: '0 auto'
					}}>
					<UndoIcon />
				</IconButton>
			)}
			<ToggleButtonGroup
				value={selected}
				exclusive
				onChange={(e, v) => handleChange(v)}
				sx={{
					'width': '100%',
					'& .MuiToggleButton-root': {
						borderRadius: '4px 4px 0 0',
						width: '100%'
					}
				}}
				aria-label='operation-select'>
				<ToggleButton value='intersection' aria-label='intersection'>
					<JoinInnerIcon />
					{/* <img src='./images/S.png' alt='intersection' /> */}
				</ToggleButton>
				<ToggleButton value='subtraction' aria-label='subtraction'>
					<JoinLeftIcon />
					{/* <img src='./images/L.png' alt='subtraction' /> */}
				</ToggleButton>
			</ToggleButtonGroup>
		</>
	);
}
export default OperationInput;
