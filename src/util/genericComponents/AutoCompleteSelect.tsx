import {
	Autocomplete,
	AutocompleteProps,
	AutocompleteRenderInputParams,
	Popper,
	PopperProps,
	TextField
} from '@mui/material';

type AutoCompleteSelectProps<
	T,
	Multiple extends boolean | undefined = undefined,
	FreeSolo extends boolean | undefined = undefined
> = Omit<AutocompleteProps<T, Multiple, false, FreeSolo, 'div'>, 'renderInput'>;

export function AutoCompleteSelect<
	T,
	Multiple extends boolean | undefined = undefined,
	FreeSolo extends boolean | undefined = undefined
>(props: AutoCompleteSelectProps<T, Multiple, FreeSolo>) {
	const CustomPopper = (popperProps: PopperProps) => {
		return (
			<Popper
				{...popperProps}
				style={{ width: 'fit-content' }}
				placement='bottom-start'
			/>
		);
	};

	const renderInput = (params: AutocompleteRenderInputParams) => {
		return (
			<TextField
				{...params}
				InputProps={{
					...params?.InputProps,
					style: { fontSize: '12px' }
				}}
				size='small'
				variant='outlined'
			/>
		);
	};

	return (
		<Autocomplete
			{...props}
			fullWidth
			size='small'
			sx={{ width: '100%' }}
			PopperComponent={CustomPopper}
			renderInput={renderInput}
			ListboxProps={{
				style: {
					fontSize: '12px',
					width: 'fit-content'
				}
			}}
		/>
	);
}
