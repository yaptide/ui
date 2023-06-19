import { Box, Button } from '@mui/material';
import {
	DragDropFile,
	DragDropInnerElementProps,
	DragDropProps
} from '../../../util/genericComponents/DragDropFile';
import FileUploadIcon from '@mui/icons-material/FileUpload';

const innerElement = (props: DragDropInnerElementProps) => {
	const { dragActive, id } = props;

	return (
		<Box
			sx={{
				borderRadius: 1,
				border: '2px dashed',
				boxSizing: 'border-box',
				position: 'relative',
				padding: 0,
				mb: 2,
				borderColor: _ => (dragActive ? 'primary.main' : 'grey.500')
			}}>
			<Box
				sx={{
					p: 6,
					pb: 1,
					pt: 1,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					opacity: dragActive ? 0 : 1
				}}>
				<Button
					component={'label'}
					htmlFor={id}
					startIcon={<FileUploadIcon />}>
					Upload files
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
						fontSize: 60,
						color: 'grey.500'
					}}
				/>
			</Box>
		</Box>
	);
};

type DragDropFilesProps = Omit<DragDropProps, 'innerElement'>;

export function DragDropFiles(props: DragDropFilesProps) {
	return (
		<DragDropFile
			{...props}
			innerElement={innerElement}
		/>
	);
}
