import {
	alpha,
	Autocomplete,
	AutocompleteProps,
	AutocompleteRenderInputParams,
	TextField,
	useTheme
} from '@mui/material';

export type AutoCompleteSelectProps<
	T,
	Multiple extends boolean | undefined = undefined,
	FreeSolo extends boolean | undefined = undefined
> = Omit<AutocompleteProps<T, Multiple, false, FreeSolo, 'div'>, 'renderInput'> & {
	/** `id` of the element that provides the accessible name (applied as `aria-labelledby`). */
	labelId?: string;
	/** Explicit accessible name (applied as `aria-label`). Takes precedence over `labelId`. */
	ariaLabel?: string;
};

export function AutoCompleteSelect<
	T,
	Multiple extends boolean | undefined = undefined,
	FreeSolo extends boolean | undefined = undefined
>(props: AutoCompleteSelectProps<T, Multiple, FreeSolo>) {
	const theme = useTheme();
	const { labelId, ariaLabel, ...autocompleteProps } = props;

	const renderInput = (params: AutocompleteRenderInputParams) => {
		return (
			<TextField
				{...params}
				slotProps={{
					...params.slotProps,
					htmlInput: {
						...params.slotProps.htmlInput,
						...(ariaLabel === undefined && { 'aria-labelledby': labelId }),
						...(ariaLabel !== undefined && { 'aria-label': ariaLabel })
					},
					input: {
						...params.slotProps.input,
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
			{...autocompleteProps}
			fullWidth
			size='small'
			sx={{ width: '100%' }}
			renderInput={renderInput}
			slotProps={{
				popper: {
					style: { width: 'fit-content' },
					placement: 'bottom-start'
				},
				listbox: {
					sx: {
						'fontSize': '12px',
						'width': 'fit-content',
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
