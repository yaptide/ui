import { useTheme } from '@mui/material';
import CodeMirror, { EditorView, Extension } from '@uiw/react-codemirror';
import { useEffect, useMemo, useState } from 'react';

import { loadLanguageForFile } from './inputFileLanguages';

interface InputFileCodeEditorProps {
	name: string;
	value: string;
	onChange: (value: string) => void;
}

export function InputFileCodeEditor({ name, value, onChange }: InputFileCodeEditorProps) {
	const theme = useTheme();

	const [language, setLanguage] = useState<Extension>();

	useEffect(() => {
		let current = true;

		loadLanguageForFile(name).then(loaded => {
			if (current) setLanguage(loaded);
		});

		return () => {
			current = false;
		};
	}, [name]);

	const extensions = useMemo(() => {
		return [
			...(language ? [language] : []),
			EditorView.contentAttributes.of({ 'aria-label': `${name} text field` })
		];
	}, [language, name]);

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
