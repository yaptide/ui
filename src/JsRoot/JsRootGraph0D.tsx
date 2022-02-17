import React, { useEffect, useState } from 'react';
import { Page0D } from './GraphData';

export function JsRootGraph0D(props: Page0D) {
	const [resultValue, setResultValue] = useState(0);

	useEffect(() => {
		setResultValue(props.data.values[0]);
	}, [props]);

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
