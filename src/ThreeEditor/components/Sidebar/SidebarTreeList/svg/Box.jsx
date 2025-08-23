import * as React from 'react';

const SvgComponent = props => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width='36mm'
		height='36mm'
		viewBox='0 0 36 36'
		{...props}>
		<path
			d='m76.32 47.612-8.093 6.838'
			style={{
				fill: 'none',
				strokeWidth: 2,
				strokeLinecap: 'round',
				strokeLinejoin: 'round',
				strokeDasharray: 'none'
			}}
			transform='translate(-42.686 -21.454)'
		/>
		<path
			d='M45.046 31.303h23.159v23.159H45.046z'
			style={{
				fill: 'none',
				strokeWidth: 2,
				strokeLinejoin: 'round',
				strokeDasharray: 'none'
			}}
			transform='translate(-42.686 -21.454)'
		/>
		<path
			d='M53.166 23.445a1 1 0 0 0-1 1v4.858h2v-3.858h21.16v21.16h-5.121v2h6.121a1 1 0 0 0 1-1v-23.16a1 1 0 0 0-1-1Zm-1 9.858v14.302a1 1 0 0 0 1 1h13.04v-2h-12.04V33.303Z'
			style={{
				baselineShift: 'baseline',
				display: 'inline',
				overflow: 'visible',
				opacity: 1,
				vectorEffect: 'none',
				strokeLinejoin: 'round',
				enableBackground: 'accumulate',
				stopOpacity: 1
			}}
			transform='translate(-42.686 -21.454)'
		/>
		<path
			d='m53.146 24.46-8.093 6.838M76.284 24.47 68.19 31.31M53.184 47.557l-8.093 6.838'
			style={{
				fill: 'none',
				strokeWidth: 2,
				strokeLinecap: 'round',
				strokeLinejoin: 'round',
				strokeDasharray: 'none'
			}}
			transform='translate(-42.686 -21.454)'
		/>
	</svg>
);

export default SvgComponent;
