import * as React from 'react';

const SvgComponent = props => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width='36mm'
		height='36mm'
		viewBox='0 0 36 36'
		{...props}>
		<g
			style={{
				display: 'inline'
			}}>
			<path
				d='M31.131 27.789s-.171.454-.7.905c-.527.451-1.434.957-2.631 1.39-2.394.866-5.908 1.454-9.798 1.454-3.89 0-7.406-.588-9.8-1.454-1.197-.433-2.104-.939-2.632-1.39-.528-.451-.686-.873-.686-.873'
				style={{
					baselineShift: 'baseline',
					display: 'inline',
					overflow: 'visible',
					opacity: 1,
					fill: 'none',
					strokeWidth: 3.1434,
					strokeLinecap: 'round',
					strokeLinejoin: 'round',
					strokeDasharray: 'none',
					enableBackground: 'accumulate',
					stopOpacity: 1
				}}
			/>
			<path
				d='M18.002 4.747c3.89 0 7.404.588 9.798 1.453 1.197.433 2.104.937 2.632 1.389.528.45.653.768.653 1.022 0 .253-.125.57-.653 1.022-.528.451-1.435.957-2.632 1.39-2.394.865-5.908 1.453-9.798 1.453-3.89 0-7.406-.588-9.8-1.453-1.197-.433-2.104-.939-2.632-1.39-.528-.452-.653-.769-.653-1.022 0-.254.125-.571.653-1.022.528-.452 1.435-.956 2.632-1.389 2.394-.865 5.91-1.453 9.8-1.453z'
				style={{
					baselineShift: 'baseline',
					display: 'inline',
					overflow: 'visible',
					fill: 'none',
					strokeWidth: 3.1434,
					strokeLinecap: 'round',
					strokeLinejoin: 'round',
					strokeDasharray: 'none',
					enableBackground: 'accumulate'
				}}
			/>
			<path
				d='m4.796 8.527.016 19.167M31.188 8.527l.016 19.167'
				style={{
					display: 'inline',
					fill: 'none',
					strokeWidth: 3,
					strokeLinecap: 'round',
					strokeLinejoin: 'round',
					strokeDasharray: 'none'
				}}
			/>
		</g>
	</svg>
);

export default SvgComponent;
