import { useTheme } from '@mui/material';
import CodeMirror, { EditorView } from '@uiw/react-codemirror';
import { useMemo } from 'react';

interface InputFileCodeEditorProps {
	name: string;
	value: string;
	onChange: (value: string) => void;
}

export function InputFileCodeEditor({ name, value, onChange }: InputFileCodeEditorProps) {
	const theme = useTheme();

	const extensions = useMemo(
		() => [EditorView.contentAttributes.of({ 'aria-label': `${name} text field` })],
		[name]
	);

	return (
		<CodeMirror
			value={value}
			onChange={onChange}
			extensions={extensions}
			theme={theme.palette.mode}
			placeholder={`Please enter ${name} content.`}
			maxHeight='60vh'
			basicSetup={{ autocompletion: false, closeBrackets: false }}
			style={{
				fontSize: 12,
				borderRadius: theme.spacing(1),
				overflow: 'hidden',
				border: `1px solid ${theme.palette.divider}`
			}}
		/>
	);
}
