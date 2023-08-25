import { Box, Chip, ChipProps, TextField, Typography } from '@mui/material';
import { ChangeEvent, useRef } from 'react';

type EditableChipProps = {
	option: { optionKey: string; optionValue: string };
	onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
	onDelete?: () => void;
} & ChipProps;

export function EditableChip({ option, onDelete, onChange }: EditableChipProps) {
	const textFieldRef = useRef<HTMLInputElement>(null);

	return (
		<Chip
			sx={{
				'display': 'flex',
				'width': 'fit-content',
				'& .MuiChip-label': {}
			}}
			variant='outlined'
			label={
				<Typography
					component={Box}
					sx={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						gap: 1
					}}>
					{option.optionKey}
					<TextField
						inputRef={textFieldRef}
						onChange={onChange}
						size='small'
						hiddenLabel
						variant='filled'
						value={option.optionValue}
						sx={{}}
					/>
				</Typography>
			}
			onDelete={onDelete}
			onClick={() => {
				textFieldRef.current?.focus();
			}}
		/>
	);
}
