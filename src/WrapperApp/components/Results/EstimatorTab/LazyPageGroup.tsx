import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';

import { PageGroup } from '../../../../util/lazyPages';

interface LazyPageGroupProps {
	group: PageGroup;
	loading: boolean;
	onLoad: (group: PageGroup) => void;
}

/**
 * The place of pages not loaded yet (2D maps, 3D volumes): they are fetched once the place comes into view, so the
 * researcher downloads only the pages they look at. A button loads them where the browser cannot tell.
 */
const LazyPageGroup = ({ group, loading, onLoad }: LazyPageGroupProps) => {
	const ref = useRef<HTMLDivElement>(null);
	// read when the place comes into view, so a new handler does not observe again
	const load = useRef(onLoad);
	load.current = onLoad;

	useEffect(() => {
		const element = ref.current;

		if (!element || typeof IntersectionObserver === 'undefined') return;
		const observer = new IntersectionObserver(entries => {
			if (entries.some(entry => entry.isIntersecting)) {
				observer.disconnect();
				load.current(group);
			}
		});
		observer.observe(element);

		return () => observer.disconnect();
	}, [group]);

	return (
		<Box
			ref={ref}
			data-testid={`lazy-pages-${group.dimension}d`}
			sx={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 1,
				minHeight: 120,
				margin: 1
			}}>
			{loading ? (
				<CircularProgress size={24} />
			) : (
				<>
					<Typography
						variant='body2'
						color='text.secondary'>
						{group.dimension}D results: {group.names.join(', ')}
					</Typography>
					<Button
						size='small'
						onClick={() => onLoad(group)}>
						Load
					</Button>
				</>
			)}
		</Box>
	);
};

export default LazyPageGroup;
