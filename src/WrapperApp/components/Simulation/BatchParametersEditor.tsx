import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import IntegrationInstructionsOutlinedIcon from '@mui/icons-material/IntegrationInstructionsOutlined';
import {
	Autocomplete,
	Box,
	Checkbox,
	FormControl,
	ListItem,
	ListItemButton,
	ListItemText,
	TextField,
	Typography,
	createFilterOptions,
	useTheme
} from '@mui/material';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { useState } from 'react';
import { EditableChip } from './EditableChip';
import { ScriptOption } from './RunSimulationForm';

type BatchParametersEditorProps = {
	scriptHeader: string;
	scriptOptions: ScriptOption[];
	handleScriptHeaderChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
	handleScriptOptionsChange: (newValue: ScriptOption[]) => void;
	scriptName: string;
};

const _PROPOSED_OPTIONS = [
	{ optionKey: '-a', optionLabel: 'option a', optionValue: '' },
	{ optionKey: '-b', optionLabel: 'option b', optionValue: '' },
	{ optionKey: '-c', optionLabel: 'option c', optionValue: '' },
	{ optionKey: '-d', optionLabel: 'option d', optionValue: '' }
] as const;

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
		stringify: option => option.optionKey
	});
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
						filterOptions={(options, params) => {
							let filtered: (ScriptOption & { optionTitle?: string })[] =
								filterKeysAndLabels(options, params);

							// Filter out existing options
							filtered = filtered.filter(
								o => !scriptOptions.some(so => so.optionKey === o.optionKey)
							);

							const { inputValue } = params;
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
										optionLabel: '',
										optionValue: '',
										optionTitle: `Add new option "${inputValue}"`
									},
									{
										optionKey: `-${inputValue}`,
										optionLabel: '',
										optionValue: '',
										optionTitle: `Add new option "-${inputValue}"`
									},
									{
										optionKey: `--${inputValue}`,
										optionLabel: '',
										optionValue: '',
										optionTitle: `Add new option "--${inputValue}"`
									}
								);
							}
							return filtered;
						}}
						id={`tags-options-${scriptName}`}
						options={_PROPOSED_OPTIONS}
						// getOptionLabel={option => option.optionLabel}
						defaultValue={[]}
						value={scriptOptions}
						onChange={(_e, newValue) => {
							const newOptions: ScriptOption[] = newValue.map(option => {
								if (typeof option === 'string')
									return {
										optionKey: option,
										optionLabel: '',
										optionValue: ''
									};

								const existingOption = scriptOptions.find(
									o => o.optionKey === option.optionKey
								);
								return {
									optionKey: option.optionKey,
									optionLabel: option.optionLabel || '',
									optionValue:
										existingOption?.optionValue || option.optionValue || ''
								};
							});
							handleScriptOptionsChange(newOptions);
						}}
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
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
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
