import * as React from 'react';

const SvgComponent = props => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width='36mm'
		height='36mm'
		viewBox='0 0 36 36'
		{...props}>
		<g transform='translate(-114.751 -66.758)'>
			<circle
				cx={132.746}
				cy={84.758}
				r={15.032}
				style={{
					fill: 'none',
					strokeWidth: 2,
					strokeLinecap: 'round',
					strokeLinejoin: 'round',
					strokeDasharray: 'none'
				}}
			/>
			<path
				d='M116.726 84.58a1.729 1.729 0 0 0-.009.178c0 .535.259 1.008.574 1.347.316.34.7.594 1.147.827.893.464 2.056.83 3.469 1.14 2.824.622 6.634.992 10.845.992s8.02-.37 10.846-.992c1.412-.31 2.576-.676 3.469-1.14.446-.233.83-.487 1.146-.827.316-.34.575-.812.575-1.347 0-.06-.004-.12-.01-.178h-1.898c-.05.061-.102.12-.153.178-.09.092-.279.242-.582.4-.629.327-1.669.674-2.977.961-2.616.576-6.324.945-10.416.945-4.092 0-7.8-.37-10.416-.945-1.308-.287-2.346-.634-2.975-.96a2.386 2.386 0 0 1-.584-.401 1 1 0 0 1-.115-.178z'
				style={{
					baselineShift: 'baseline',
					display: 'inline',
					overflow: 'visible',
					opacity: 1,
					vectorEffect: 'none',
					strokeLinecap: 'round',
					strokeLinejoin: 'round',
					enableBackground: 'accumulate',
					stopOpacity: 1
				}}
			/>
			<path
				d='M132.752 80.126c-4.211 0-8.02.37-10.846.992-.657.145-1.26.301-1.807.474-.181.73-.3 1.486-.353 2.26.632-.271 1.52-.546 2.59-.781 2.616-.576 6.324-.945 10.416-.945 4.092 0 7.8.37 10.416.945 1.063.234 1.948.506 2.58.776a13.083 13.083 0 0 0-.354-2.259 21.145 21.145 0 0 0-1.797-.47c-2.824-.621-6.634-.992-10.845-.992z'
				style={{
					baselineShift: 'baseline',
					display: 'inline',
					overflow: 'visible',
					vectorEffect: 'none',
					strokeLinecap: 'round',
					strokeLinejoin: 'round',
					enableBackground: 'accumulate'
				}}
			/>
		</g>
	</svg>
);

export default SvgComponent;
