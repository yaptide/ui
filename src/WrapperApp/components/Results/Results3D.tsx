import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Box, Button, Stack, Typography } from '@mui/material';

import { Page3D } from '../../../JsRoot/GraphData';
import CopyToClipboard from '../CopyToCliboard/CopyToCliboard';

export function Result3D(props: { page: Page3D; title?: string }) {
	const { page, title } = props;

	return (
		<Box sx={{ margin: ({ spacing }) => spacing(1, 0) }}>
			<Typography variant='h4'>{title ?? 'Quantity'}</Typography>
			<Box
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'flex-start'
				}}>
				<Stack
					direction={'row'}
					gap='1rem'
					alignItems={'center'}>
					<Typography variant='h6'>Url on server: </Typography>
					<Typography
						variant='h6'
						fontWeight={'bold'}>
						{page.resultsUrl}
					</Typography>
					<CopyToClipboard text={page.resultsUrl}>
						<Button
							variant='text'
							color='secondary'>
							<ContentCopyIcon sx={{ marginRight: ({ spacing }) => spacing(0.5) }} />{' '}
							Copy to clipboard
						</Button>
					</CopyToClipboard>
				</Stack>
			</Box>
		</Box>
	);
}

export default Result3D;
