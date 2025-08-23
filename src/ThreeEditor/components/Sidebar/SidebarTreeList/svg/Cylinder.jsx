import * as React from 'react';

const SvgComponent = props => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width='36mm'
		height='36mm'
		viewBox='0 0 36 36'
		{...props}>
		<g transform='translate(-73.495 -66.71)'>
			<ellipse
				cx={91.496}
				cy={75.047}
				rx={13.2}
				ry={5.436}
				style={{
					fill: 'none',
					strokeWidth: 2,
					strokeLinecap: 'round',
					strokeLinejoin: 'round',
					strokeDasharray: 'none'
				}}
			/>
			<ellipse
				cx={91.496}
				cy={94.373}
				rx={13.2}
				ry={5.436}
				style={{
					fill: 'none',
					strokeWidth: 2,
					strokeLinecap: 'round',
					strokeLinejoin: 'round',
					strokeDasharray: 'none'
				}}
			/>
			<path
				d='m78.29 75.237.016 19.167M104.683 75.237l.016 19.167'
				style={{
					fill: 'none',
					strokeWidth: 2,
					strokeLinecap: 'round',
					strokeLinejoin: 'round',
					strokeDasharray: 'none'
				}}
			/>
		</g>
	</svg>
);

export default SvgComponent;
