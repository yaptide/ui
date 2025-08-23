import * as React from 'react';

const SvgComponent = props => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width='36mm'
		height='36mm'
		viewBox='0 0 36 36'
		{...props}>
		<path
			d='m33.634 26.158-8.094 6.838'
			style={{
				fill: 'none',
				strokeWidth: 3,
				strokeLinecap: 'round',
				strokeLinejoin: 'round',
				strokeDasharray: 'none'
			}}
		/>
		<path
			d='M2.36 9.849h23.159v23.159H2.36z'
			style={{
				fill: 'none',
				strokeWidth: 3,
				strokeLinejoin: 'round',
				strokeDasharray: 'none'
			}}
		/>
		<path
			d='m10.55 3.034-8.184 6.81M33.598 3.017l-8.094 6.838M10.595 3.014h23.052v22.882'
			style={{
				fill: 'none',
				strokeWidth: 3,
				strokeLinecap: 'round',
				strokeLinejoin: 'round',
				strokeDasharray: 'none'
			}}
		/>
	</svg>
);

export default SvgComponent;
