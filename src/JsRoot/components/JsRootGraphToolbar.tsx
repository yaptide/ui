import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { Box, Chip, IconButton } from '@mui/material';

type JsRootGraphToolbarProps = {
	zoomIn: () => void;
	zoomOut: () => void;
	resetZoom: () => void;
};

export function JsRootGraphToolbar(props: JsRootGraphToolbarProps) {
	const { zoomIn, zoomOut, resetZoom } = props;

	return (
		<Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
			<IconButton
				aria-label='Zoom in'
				onClick={zoomIn}
				sx={{
					margin: 0.5,
					backgroundColor: 'primary.main',
					color: 'primary.contrastText'
				}}>
				<ZoomInIcon />
			</IconButton>
			<IconButton
				aria-label='Zoom out'
				onClick={zoomOut}
				sx={{
					margin: 0.5,
					backgroundColor: 'primary.main',
					color: 'primary.contrastText'
				}}>
				<ZoomOutIcon />
			</IconButton>
			<Chip
				color='primary'
				sx={{ fontSize: 12, margin: 0.5 }}
				label='Reset Zoom'
				onClick={resetZoom}
			/>
		</Box>
	);
}

export default JsRootGraphToolbar;
