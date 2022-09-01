import { Grid } from '@mui/material';
import React from 'react';
import { Page0D } from './GraphData';

export function JsRootGraph0D(props: { page: Page0D; title?: string }) {
	const { page, title } = props;
	const [resultValue, setResultValue] = useState(0);

	useEffect(() => {
		setResultValue(page.data.values[0]);
	}, [page]);

	return (
		<Grid container spacing={2}>
			<Grid item xs={12} md={6}>
				<h3>Custom name</h3>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'flex-start'
					}}>
					<p style={{ margin: '5px 10px' }}>{props.data.name}:</p>
					<p style={{ margin: '5px 10px' }}>{props.data.values[0]}</p>
					<p style={{ margin: '5px 10px' }}>[{props.data.unit}]</p>
				</div>
			</Grid>
			<Grid item xs={12} md={6}>
				<h4>Filters</h4>
				<div>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'flex-start'
						}}>
						<p style={{ margin: '5px' }}>Filter1</p>
						<p style={{ margin: '5px' }}>Filter2</p>
					</div>
				</div>
			</Grid>
		</Grid>
	);
}

export default JsRootGraph0D;
