import * as React from 'react';

const SvgComponent = props => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width='36mm'
		height='36mm'
		viewBox='0 0 36 36'
		{...props}>
		<circle
			cx={17.995}
			cy={18}
			r={15.032}
			style={{
				fill: 'none',
				strokeWidth: 3,
				strokeLinecap: 'round',
				strokeLinejoin: 'round',
				strokeDasharray: 'none'
			}}
		/>
		<path
			d='M32.957 18.337c0 .119-.163.45-.852.857-.688.407-1.786.82-3.166 1.164-2.758.69-6.648 1.131-10.943 1.131s-8.187-.441-10.945-1.13c-1.38-.346-2.475-.758-3.164-1.165-.69-.407-.852-.738-.852-.857'
			style={{
				baselineShift: 'baseline',
				display: 'inline',
				overflow: 'visible',
				opacity: 1,
				fill: 'none',
				strokeWidth: 3,
				strokeLinecap: 'round',
				strokeLinejoin: 'round',
				strokeDasharray: 'none',
				enableBackground: 'accumulate',
				stopOpacity: 1
			}}
		/>
		<path
			d='M16.858 32.888c-.118 0-.45-.163-.857-.852s-.82-1.787-1.164-3.166c-.69-2.758-1.13-6.648-1.13-10.943s.44-8.187 1.13-10.945c.345-1.38.757-2.476 1.164-3.164.407-.69.739-.852.857-.852'
			style={{
				baselineShift: 'baseline',
				display: 'inline',
				overflow: 'visible',
				fill: 'none',
				strokeWidth: 3,
				strokeLinecap: 'round',
				strokeLinejoin: 'round',
				strokeDasharray: 'none',
				enableBackground: 'accumulate'
			}}
		/>
	</svg>
);

export default SvgComponent;
