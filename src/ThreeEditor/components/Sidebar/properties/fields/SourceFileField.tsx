import { Button, Stack } from '@mui/material';
import { ChangeEvent } from 'react';
import { ConfigSourceFile } from '../../../../../types/SimulationTypes/ConfigTypes';
import { PropertyField } from './PropertyField';

type ObjectWithSourceFile = { sourceFile: ConfigSourceFile };

/**
 * Field that allows to upload additional files to the simulation config
 */
export function SourceFileDefinitionField(props: {
	object: ObjectWithSourceFile;
	onChange: (value: ObjectWithSourceFile['sourceFile']) => void;
}) {
	const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files) {
			return;
		}
		const file = e.target.files[0];

		const { name } = file;

		const reader = new FileReader();
		reader.onload = evt => {
			if (!evt?.target?.result) {
				return;
			}
			const { result } = evt.target;
			if (typeof result === 'string') {
				props.onChange({ name, value: result });
			} else {
				console.error('Invalid file type');
			}
		};
		reader.readAsBinaryString(file);
	};

	const clearFile = () => {
		props.onChange({ name: '', value: '' });
	};

	return (
		<>
			{props.object.sourceFile.name && (
				<PropertyField label='Filename'>{props.object.sourceFile.name}</PropertyField>
			)}

			<PropertyField>
				<Stack
					gap={1}
					direction='row'>
					<Button
						sx={{ flexGrow: 1 }}
						variant='contained'
						component='label'>
						Upload File
						<input
							type='file'
							hidden
							onChange={handleFileUpload}
						/>
					</Button>

					<Button
						disabled={!props.object.sourceFile.name}
						sx={{ flexGrow: 1 }}
						variant='contained'
						component='label'
						onClick={clearFile}
						color='warning'>
						Clear File
					</Button>
				</Stack>
			</PropertyField>
		</>
	);
}
