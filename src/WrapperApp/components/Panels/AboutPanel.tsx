import { Box, Link } from '@mui/material';

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
				{'This work was supported by the '}
				<Link
					href='https://www.cyfronet.pl/18286,artykul,projekt_eurohpc_pl.html'
					target='_blank'
					variant='body1'
					color='secondary'
					sx={{ fontWeight: 'bold' }}
					underline='hover'>
					{'EuroHPC PL'}
				</Link>
				{
					' infrastructure funded at the Smart Growth Operational Programme (2014-2020), Measure 4.2 under the grant agreement no. POIR.04.02.00-00-D014/20-00'
				}
			</p>
		</Box>
	);
}
