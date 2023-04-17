import { Box, Button, Typography } from '@mui/material';
import React from 'react';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { DragDropFile, DragDropInnerElementProps, DragDropProps } from '../../../util/DragDropFile';

const innerElement = (props: DragDropInnerElementProps) => {
	const { dragActive, hasFiles, id, currentFiles } = props;

	return (
		<Box
			sx={{
				borderRadius: 1,
				border: '2px dashed',
				boxSizing: 'border-box',
				position: 'relative',
				padding: 0,
				borderColor: _ => (dragActive ? 'primary.main' : 'grey.500')
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
	);
};

type DragDropProjectProps = Omit<DragDropProps, 'innerElement'>;

export function DragDropProject(props: DragDropProjectProps) {
	return <DragDropFile {...props} innerElement={innerElement} />;
}
