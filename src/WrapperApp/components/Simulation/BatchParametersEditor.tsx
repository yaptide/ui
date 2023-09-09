import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import IntegrationInstructionsOutlinedIcon from '@mui/icons-material/IntegrationInstructionsOutlined';
import {
	Autocomplete,
	Box,
	Checkbox,
	createFilterOptions,
	FilterOptionsState,
	FormControl,
	ListItem,
	ListItemButton,
	ListItemText,
	TextField,
	Typography,
	useTheme
} from '@mui/material';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { ChangeEvent, useCallback, useState } from 'react';

import { EditableChip } from '../../../util/genericComponents/EditableChip';
import { ScriptOption } from './RunSimulationForm';

type BatchParametersEditorProps = {
	scriptHeader: string;
	scriptOptions: ScriptOption[];
	handleScriptHeaderChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
	handleScriptOptionsChange: (newValue: ScriptOption[]) => void;
	scriptName: string;
};

const _PROPOSED_OPTIONS = [
	{
		optionKey: 'time',
		optionLabel: 'Time limit on the total run time of the job allocation',
		optionValue: '0:15:00'
	}
] as readonly ScriptOption[];

function parseOptions(input: string): ScriptOption[] {
	const options: ScriptOption[] = [];
	const regex =
		/[\s]--([\w-]+)=([^"\s]+|"[^"]*")|[\s]-([\w-])+[\s]([^"\s]+|"[^"]*")|[\s]--([\w-]+)/g;
	let match: RegExpExecArray | null;

	while ((match = regex.exec(` ${input}`)) !== null) {
		const [, key1, value1, key2, value2, key3] = match;
		const optionKey = key1 ?? key2 ?? key3;
		const optionValue = key1 ? value1 : key2 ? value2 : '';
		options.push({ optionKey, optionValue });
	}

	return options;
}

export function BatchScriptParametersEditor({
	scriptHeader,
	scriptOptions,
	handleScriptHeaderChange,
	handleScriptOptionsChange,
	scriptName
}: BatchParametersEditorProps) {
	const theme = useTheme();
	const [useCommandLineOptionsChecked, setUseCommandLineOptionsChecked] = useState(
		scriptOptions.length > 0
	);

	const filterKeysAndLabels = createFilterOptions<ScriptOption>({
		matchFrom: 'any',
		stringify: ({ optionKey }) => optionKey
	});

	const handleFilterOptions = useCallback(
		(options: ScriptOption[], state: FilterOptionsState<ScriptOption>): ScriptOption[] => {
			let filtered: (ScriptOption & { optionTitle?: string })[] = filterKeysAndLabels(
				options,
				state
			);

			// Filter out existing options
			filtered = filtered.filter(
				o => !scriptOptions.some(so => so.optionKey === o.optionKey)
			);

			const { inputValue } = state;

			// if inputValue has whitespace, parse it with regex and filter out existing options
			if (inputValue.includes(' ') || inputValue.includes('=')) {
				const newOptions = parseOptions(inputValue);
				filtered = [
					{
						optionKey: '',
						optionValue: '',
						optionTitle: `Parse all options "${
							inputValue.length > 20 ? inputValue.slice(0, 20) + '(...)' : inputValue
						}"`,
						optionList: newOptions
					}
				];
			} else {
				// Suggest the creation of a new value
				const isExisting = options.some(
					o =>
						inputValue === o.optionKey ||
						`-${inputValue}` === o.optionKey ||
						`--${inputValue}` === o.optionKey
				);

				if (inputValue !== '' && !isExisting) {
					filtered.push(
						{
							optionKey: inputValue,
							optionValue: '',
							optionTitle: `Add new option "${inputValue}"`
						},
						{
							optionKey: `-${inputValue}`,
							optionValue: '',
							optionTitle: `Add new option "-${inputValue}"`
						},
						{
							optionKey: `--${inputValue}`,
							optionValue: '',
							optionTitle: `Add new option "--${inputValue}"`
						}
					);
				}
			}

			return filtered;
		},
		[filterKeysAndLabels, scriptOptions]
	);

	const handleAutocompleteChange = useCallback(
		(newValue: readonly (string | ScriptOption)[]) => {
			const newOptions: ScriptOption[] = newValue.reduce((acc, option) => {
				let candidateOptions: ScriptOption[] = [];

				if (typeof option === 'string') {
					candidateOptions = parseOptions(option);

					if (candidateOptions.length === 0 && option.includes(' '))
						candidateOptions = parseOptions(`-${option}`);
				} else candidateOptions = option.optionList ? option.optionList : [option];

				return [
					...acc,
					...candidateOptions
						.filter(o => !acc.some(a => a.optionKey === o.optionKey))
						.map(o => ({
							optionKey: o.optionKey,
							optionValue:
								scriptOptions.find(so => so.optionKey === o.optionKey)
									?.optionValue ||
								o.optionValue ||
								''
						}))
				];
			}, [] as ScriptOption[]);
			handleScriptOptionsChange(newOptions);
		},
		[handleScriptOptionsChange, scriptOptions]
	);

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				gap: 3,
				flexGrow: 1,
				p: ({ spacing }) => spacing(1)
			}}>
			<Box>
				<Typography variant='subtitle2'>{`${
					scriptName.charAt(0).toUpperCase() + scriptName.slice(1)
				} Script Header`}</Typography>
				<CodeEditor
					value={scriptHeader}
					language='bash'
					placeholder={`Enter ${scriptName.toLocaleLowerCase()} script header here`}
					onChange={handleScriptHeaderChange}
					data-color-mode={theme.palette.mode}
					padding={15}
					style={{
						marginTop: theme.spacing(1),
						borderRadius: theme.shape.borderRadius,
						fontSize: 12,
						backgroundColor: theme.palette.action.disabledBackground,
						fontFamily:
							'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
						maxHeight: '15rem',
						overflowY: 'auto'
					}}
				/>
			</Box>
			<ListItem disablePadding>
				<ListItemButton
					role={undefined}
					onClick={() => {
						setUseCommandLineOptionsChecked(prev => !prev);
						handleScriptOptionsChange([]);
					}}
					dense>
					<Checkbox
						edge='start'
						checked={useCommandLineOptionsChecked}
						tabIndex={-1}
						disableRipple
						inputProps={{ 'aria-labelledby': 'useCommandLineOptions' }}
						icon={<IntegrationInstructionsOutlinedIcon />}
						checkedIcon={<IntegrationInstructionsIcon />}
					/>
					<ListItemText
						primary={`Use ${scriptName.toLocaleLowerCase()} command line options`}
					/>
				</ListItemButton>
			</ListItem>
			{useCommandLineOptionsChecked && (
				<FormControl>
					<Autocomplete
						selectOnFocus
						clearOnBlur
						sx={{
							flexGrow: 1,
							flexWrap: 'wrap'
						}}
						multiple
						freeSolo
						filterOptions={handleFilterOptions}
						id={`tags-options-${scriptName}`}
						options={_PROPOSED_OPTIONS}
						defaultValue={[]}
						value={scriptOptions}
						onChange={(_, newValue) => handleAutocompleteChange(newValue)}
						filterSelectedOptions
						getOptionLabel={option => {
							// Value selected with enter, right from the input
							if (typeof option === 'string') {
								return option;
							}

							const { optionTitle } = option as {
								optionTitle?: string;
							};

							// Add "xxx" option created dynamically
							if (optionTitle) {
								return optionTitle;
							}

							// Regular option
							return `${option.optionKey}${
								option.optionLabel ? ' "' + option.optionLabel + '"' : ''
							}`;
						}}
						renderInput={params => (
							<TextField
								{...params}
								variant='standard'
								label={`Add ${scriptName.toLocaleLowerCase()} command line options`}
							/>
						)}
						// Value is rendered as chips below the input
						renderTags={() => null}
					/>
					<Box
						sx={{
							display: 'grid',
							flexWrap: 'wrap',
							gap: ({ spacing }) => spacing(1),
							p: ({ spacing }) => spacing(1),
							maxHeight: '8rem',
							overflowY: 'auto'
						}}>
						{scriptOptions.map((option, index) => (
							<EditableChip
								key={option.optionKey}
								option={option}
								onChange={(event: ChangeEvent<HTMLInputElement>) => {
									const { value } = event.target;
									const newOptions = [...scriptOptions];
									newOptions[index].optionValue = value;
									handleScriptOptionsChange(newOptions);
								}}
								onDelete={() => {
									const newOptions = scriptOptions.filter(
										o => o.optionKey !== option.optionKey
									);

									handleScriptOptionsChange(newOptions);
								}}
							/>
						))}
					</Box>
				</FormControl>
			)}
		</Box>
	);
}
