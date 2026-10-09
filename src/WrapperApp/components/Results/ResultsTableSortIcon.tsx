import { IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
	gridClasses,
	GridColumnHeaderSortIconProps,
	GridSortDirection,
	useGridApiContext,
	useGridRootProps
} from '@mui/x-data-grid';
import { memo, ReactNode } from 'react';

const IconButtonContainer = styled('div')({
	display: 'flex',
	visibility: 'hidden',
	width: 0
});

const SortButton = styled(IconButton)({
	transition:
		'opacity var(--DataGrid-t-transition-duration-short) var(--DataGrid-t-transition-easing-ease-in-out) 0ms'
});

function ResultsTableSortIcon(props: GridColumnHeaderSortIconProps) {
	const { direction, index, sortingOrder, disabled, className, ...other } = props;
	const apiRef = useGridApiContext();
	const rootProps = useGridRootProps();
	const label = apiRef.current.getLocaleText('columnHeaderSortIconLabel');

	const {
		columnSortedAscendingIcon: AscendingIcon,
		columnSortedDescendingIcon: DescendingIcon,
		columnUnsortedIcon: UnsortedIcon
	} = rootProps.slots;
	let icon: ReactNode = null;

	if (direction === 'asc' && AscendingIcon)
		icon = (
			<AscendingIcon
				fontSize='small'
				className={gridClasses.sortIcon}
			/>
		);
	else if (direction === 'desc' && DescendingIcon)
		icon = (
			<DescendingIcon
				fontSize='small'
				className={gridClasses.sortIcon}
			/>
		);
	else if (!direction && UnsortedIcon)
		icon = (
			<UnsortedIcon
				fontSize='small'
				className={gridClasses.sortIcon}
				sortingOrder={sortingOrder as GridSortDirection[]}
			/>
		);

	if (!icon) return null;

	const button = (
		<SortButton
			as={rootProps.slots.baseIconButton}
			aria-label={label}
			title={label}
			size='small'
			disabled={disabled}
			className={
				className ? `${gridClasses.sortButton} ${className}` : gridClasses.sortButton
			}
			{...other}
			tabIndex={-1}>
			{icon}
		</SortButton>
	);

	return (
		<IconButtonContainer className={gridClasses.iconButtonContainer}>
			{index != null ? (
				<rootProps.slots.baseBadge
					badgeContent={index}
					color='default'
					overlap='circular'>
					{button}
				</rootProps.slots.baseBadge>
			) : (
				button
			)}
		</IconButtonContainer>
	);
}

export default memo(ResultsTableSortIcon);
