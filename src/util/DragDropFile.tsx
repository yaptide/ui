// Concept from https://www.codemzy.com/blog/react-drag-drop-file-upload

import { Box, Button, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

type DragDropProps = {
	id: string;
	onSubmit: (file: FileList) => void;
	currentFiles?: FileList;
	acceptedFiles: string;
};

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
	const handleDragEnter = function (e: React.DragEvent<HTMLElement>) {
		e.preventDefault();
		e.stopPropagation();
		if (disableDrag) clearTimeout(disableDrag);
		setDragActive(true);
	};
	let disableDrag: NodeJS.Timeout | undefined;

	const handleDragLeave = function (e: React.DragEvent<HTMLElement>) {
		e.preventDefault();
		e.stopPropagation();
		if (disableDrag) clearTimeout(disableDrag);
		disableDrag = setTimeout(() => {
			setDragActive(false);
		}, 10);
	};

	// triggers when file is dropped
	const handleDrop = function (e: React.DragEvent<HTMLElement>) {
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
	const handleChange = function (e: React.ChangeEvent<HTMLInputElement>) {
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

			<Box
				sx={{
					borderRadius: 1,
					border: '2px dashed',
					boxSizing: 'border-box',
					position: 'relative',
					padding: 0,
					borderColor: theme => (dragActive ? 'primary.main' : 'grey.500')
				}}>
				<Box
					sx={{
						p: 6,
						pb: 13,
						pt: 11,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: 2,
						opacity: dragActive || hasFiles ? 0 : 1
					}}>
					<Button component={'label'} htmlFor={id} startIcon={<FileUploadIcon />}>
						Upload project file
					</Button>
					or drag and drop it here.
				</Box>

				<Box
					sx={{
						boxSizing: 'border-box',
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						display: dragActive ? 'flex' : 'none'
					}}>
					<FileUploadIcon
						sx={{
							fontSize: 100,
							color: 'grey.500'
						}}
					/>
				</Box>

				<Box
					sx={{
						boxSizing: 'border-box',
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						flexDirection: 'column',
						display: hasFiles && !dragActive ? 'flex' : 'none',
						alignItems: 'center'
					}}>
					<InsertDriveFileIcon
						sx={{
							fontSize: 100,
							color: 'grey.500'
						}}
					/>
					<Typography
						variant='h6'
						sx={{
							height: 10
						}}>
						{hasFiles && currentFiles && currentFiles[0].name}
					</Typography>
				</Box>
			</Box>
		</form>
	);
}
