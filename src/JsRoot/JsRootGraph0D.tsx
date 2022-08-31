import React, { useEffect, useState } from 'react';
import { Page0D } from './GraphData';

export function JsRootGraph0D(props: { page: Page0D; title?: string }) {
	const { page, title } = props;
	const [resultValue, setResultValue] = useState(0);

	useEffect(() => {
		setResultValue(page.data.values[0]);
	}, [page]);

	return (
		<div
			style={{
				width: 500,
				height: 200,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center'
			}}>
			<h1 style={{ margin: '10px auto', display: 'block' }}>
				{resultValue.toExponential(6)}
			</h1>
		</div>
	);
}

export default JsRootGraph0D;
