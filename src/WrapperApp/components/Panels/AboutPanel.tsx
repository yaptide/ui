import { Link, Box } from '@mui/material';

export function AboutPanel() {
	return (
		<Box
			sx={{
				padding: '10px 30px',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between'
			}}>
			<h1>About</h1>
			<p>
				{'This work was partially funded by '}
				<Link
					href='https://www.cyfronet.pl/18286,artykul,projekt_eurohpc_pl.html'
					target='_blank'
					variant='body2'
					color='secondary'
					sx={{ fontWeight: 'bold' }}
					underline='hover'>
					{'EuroHPC PL Project'}
				</Link>
				{', Smart Growth Operational Programme 4.2'}
			</p>
		</Box>
	);
}
