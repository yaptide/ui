// Concept from https://www.codemzy.com/blog/react-drag-drop-file-upload

import { ChangeEvent, DragEvent, FC, useEffect, useRef, useState } from 'react';

export interface DragDropProps {
	id: string;
	onSubmit: (file: FileList) => void;
	currentFiles?: FileList;
	acceptedFiles: string;
	innerElement: FC<DragDropInnerElementProps>;
}

export interface DragDropInnerElementProps {
	hasFiles: boolean;
	id: string;
	dragActive: boolean;
	currentFiles?: FileList;
}

// drag drop file component
export function DragDropFile(props: DragDropProps) {
	const { id, onSubmit, currentFiles, acceptedFiles } = props;
	// drag state
	const [dragActive, setDragActive] = useState(false);
	const [hasFiles, setHasFiles] = useState(currentFiles && currentFiles.length > 0);
	// ref
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		setHasFiles(currentFiles && currentFiles.length > 0);
	}, [currentFiles]);

	// handle drag events
	const handleDragEnter = function (e: DragEvent<HTMLElement>) {
		e.preventDefault();
		e.stopPropagation();
		if (disableDrag) clearTimeout(disableDrag);
		setDragActive(true);
	};
	let disableDrag: NodeJS.Timeout | undefined;

	const handleDragLeave = function (e: DragEvent<HTMLElement>) {
		e.preventDefault();
		e.stopPropagation();
		if (disableDrag) clearTimeout(disableDrag);
		disableDrag = setTimeout(() => {
			setDragActive(false);
		}, 10);
	};

	// triggers when file is dropped
	const handleDrop = function (e: DragEvent<HTMLElement>) {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);
		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			let files;
			if (currentFiles) {
				files = currentFiles;
				for (let i = 0; i < e.dataTransfer.files.length; i++)
					files[i + currentFiles.length] = e.dataTransfer.files[i];
			} else files = e.dataTransfer.files;
			onSubmit(files);
		}
	};

	// triggers when file is selected with click
	const handleChange = function (e: ChangeEvent<HTMLInputElement>) {
		e.preventDefault();
		if (e.target.files && e.target.files[0]) {
			onSubmit(e.target.files);
		}
		setHasFiles((e.target.files?.length ?? 0) > 0);
	};

	return (
		<form
			onDragEnter={handleDragEnter}
			onDragLeave={handleDragLeave}
			onDragOver={handleDragEnter}
			onDrop={handleDrop}
			onSubmit={e => {
				e.preventDefault();
				if (inputRef.current && inputRef.current.files) onSubmit(inputRef.current.files);
			}}>
			<input
				id={id}
				hidden
				accept={acceptedFiles}
				ref={inputRef}
				type='file'
				onChange={handleChange}
				multiple
			/>

			<props.innerElement
				id={id}
				dragActive={dragActive}
				hasFiles={!!hasFiles}
				currentFiles={currentFiles}
			/>
		</form>
	);
}
