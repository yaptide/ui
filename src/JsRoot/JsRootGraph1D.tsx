import React, { useEffect, useState } from 'react';
import Skeleton from '@mui/material/Skeleton';
import { useJSROOT } from './JsRootService';
import { useVisible } from 'react-hooks-visible';
import { Page1D } from './GraphData';

export function JsRootGraph1D(props: Page1D) {
	const { JSROOT } = useJSROOT();
	const [containerEl, visible] = useVisible<HTMLDivElement>();

	const [obj, setObj] = useState(undefined);
	const [drawn, setDrawn] = useState(false);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		setIsVisible(visible > 0.3);
		return () => setIsVisible(false);
	}, [visible]);

	useEffect(() => {
		if (drawn || !visible) return;
		// create example graph
		const npoints = props.data.values.length;
		const y = props.data.values;
		const x = props.first_axis.values;

		const gr = JSROOT.createTGraph(npoints, x, y);

		gr.fName = props.data.name;
		gr.fTitle = `${props.data.name} [${props.data.unit}]`;

		setObj(gr);
		setDrawn(false);
	}, [JSROOT, drawn, props, visible]);

	useEffect(() => {
		if (obj && !drawn && isVisible) {
			JSROOT.cleanup(containerEl.current);
			JSROOT.redraw(containerEl.current, obj, '');
			setDrawn(true);
		}
	}, [JSROOT, containerEl, drawn, obj, isVisible]);

	return (
		<div
			style={{
				width: 500,
				height: 500,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center'
			}}
			ref={containerEl}>
			<Skeleton hidden={drawn} variant='rectangular' width={'80%'} height={'80%'} />
		</div>
	);
}

export default JsRootGraph1D;
