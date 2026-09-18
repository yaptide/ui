import {
	alpha,
	Autocomplete,
	AutocompleteProps,
	AutocompleteRenderInputParams,
	TextField,
	useTheme
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
	const theme = useTheme();

	const renderInput = (params: AutocompleteRenderInputParams) => {
		return (
			<TextField
				{...params}
				slotProps={{
					input: {
						...params?.InputProps,
						style: { fontSize: '12px' }
					}
				}}
				color='secondary'
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
			renderInput={renderInput}
			slotProps={{
				popper: {
					placement: 'bottom-start'
				},
				listbox: {
					sx: {
						'fontSize': '12px',
						'& .MuiAutocomplete-option[aria-selected="true"], & .MuiAutocomplete-option[aria-selected="true"].Mui-focused':
							{
								backgroundColor: alpha(theme.palette.secondary.main, 0.23)
							}
					}
				}
			}}
		/>
	);
}
