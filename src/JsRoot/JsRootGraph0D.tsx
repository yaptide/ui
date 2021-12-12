import React, { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { useJSROOT } from './JsRootService';
import { useVisible } from 'react-hooks-visible';
import { Page0D } from './GraphData';
import { width } from '@mui/system';

export function JsRootGraph0D(props: Page0D) {
	const { JSROOT } = useJSROOT();
	const [containerEl, visible] = useVisible<HTMLDivElement>();

	const [resultValue, setResultValue] = useState(0)
	const [drawn, setDrawn] = useState(false);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		setIsVisible(visible > 0.2);
		return () => setIsVisible(false);
	}, [visible]);

	useEffect(() => {

		setResultValue(props.data.values[0])

		setDrawn(false)
	}, [drawn, props, visible]);

	return (
		<div style={{ width: 500, height: 200 , display:'flex',alignItems:'center',justifyContent:'center'}}>
			<h1 style={{ margin: '10px auto', display: 'block' }}>{resultValue.toExponential(6)}</h1>
		</div>
	);
}

export default JsRootGraph0D;
