import CableIcon from '@mui/icons-material/Cable';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import {
	AppBarProps,
	Box,
	Button,
	ButtonBase,
	ButtonGroup,
	ButtonGroupProps,
	ButtonProps,
	Card,
	CardProps,
	Pagination,
	styled,
	Tooltip,
	Typography,
	useTheme
} from '@mui/material';
import { ChangeEvent } from 'react';

import { OrderBy, OrderType } from '../../../types/RequestTypes';
import {
	ButtonWithPopperList,
	ButtonWithPopperListProps
} from '../../../util/genericComponents/ButtonWithPopperList';

export type SimulationAppBarProps = AppBarProps & {
	stickTo?: 'top' | 'bottom';
	accordion?: SimulationAccordionProps | { [key: string]: never };
};

type OrderButtonProps = Omit<ButtonProps, 'onChange'> & {
	orderType: OrderType;
	onChange?: (orderType: OrderType) => void;
};

export function OrderButton({ orderType, color, onChange, ...other }: OrderButtonProps) {
	return (
		<Button
			color={color}
			sx={{
				'&.MuiButton-root': {
					p: '.5rem'
				},
				'& .MuiSvgIcon-root': {
					fontSize: '1rem'
				}
			}}
			onClick={() =>
				onChange?.(orderType === OrderType.ASCEND ? OrderType.DESCEND : OrderType.ASCEND)
			}
			{...other}>
			{orderType === OrderType.ASCEND ? (
				<KeyboardDoubleArrowDownIcon />
			) : (
				<KeyboardDoubleArrowUpIcon />
			)}
		</Button>
	);
}

type OrderBySelectProps = Omit<ButtonWithPopperListProps<OrderBy>, 'options'>;

const OrderByOptions = [
	{
		value: OrderBy.START_TIME,
		label: 'Start Time'
	},
	{
		value: OrderBy.END_TIME,
		label: 'End Time'
	}
];

const PageSelectOptions = new Array(6).fill(NaN).map((_, index) => ({
	value: 4 * index + 2,
	label: `${4 * index + 2}`
}));

export function OrderBySelect(props: OrderBySelectProps) {
	return (
		<ButtonWithPopperList
			options={OrderByOptions}
			{...props}
		/>
	);
}

type PageSizeSelectProps = Omit<ButtonWithPopperListProps<number>, 'options'>;

export function PageSizeSelect(props: PageSizeSelectProps) {
	return (
		<ButtonWithPopperList
			options={PageSelectOptions}
			{...props}
		/>
	);
}

type InputGroupProps = ButtonGroupProps & {
	children: React.ReactNode;
};

export const InputGroup = styled(ButtonGroup)<InputGroupProps>(
	({
		theme: {
			shape: { borderRadius },
			spacing
		}
	}) => ({
		'height': spacing(5),
		'&:not(.MuiButtonGroup-vertical) > *': {
			'borderRadius': '0',
			'&:first-of-type': {
				borderEndStartRadius: borderRadius,
				borderStartStartRadius: borderRadius
			},
			'&:last-child': {
				borderStartEndRadius: borderRadius,
				borderEndEndRadius: borderRadius
			}
		},
		'&.MuiButtonGroup-vertical > *': {
			'borderRadius': '0',
			'&:first-of-type': {
				borderStartEndRadius: borderRadius,
				borderStartStartRadius: borderRadius
			},
			'&:last-child': {
				borderEndStartRadius: borderRadius,
				borderEndEndRadius: borderRadius
			}
		}
	})
);

export type SimulationAccordionProps = {
	expanded?: boolean;
	toggleExpanded?: () => void;
};

export type PageParamProps = {
	orderType: OrderType;
	orderBy: OrderBy;
	pageSize: number;
	handleOrderChange: (orderType: OrderType, orderBy: OrderBy, pageSize: number) => void;
};

export function SimulationPaginationControls({
	orderType,
	orderBy,
	pageSize,
	handleOrderChange
}: PageParamProps) {
	const theme = useTheme();

	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'end',
				margin: theme.spacing(1)
			}}>
			<InputGroup sx={{ marginRight: theme.spacing(1) }}>
				<OrderButton
					orderType={orderType}
					onChange={orderType => handleOrderChange(orderType, orderBy, pageSize)}
				/>
				<OrderBySelect
					sx={{
						width: ({ spacing }) => spacing(15)
					}}
					value={orderBy}
					onChange={orderBy => handleOrderChange(orderType, orderBy, pageSize)}
				/>
			</InputGroup>
			<InputGroup>
				<PageSizeSelect
					sx={{
						width: ({ spacing }) => spacing(8)
					}}
					value={pageSize}
					onChange={pageSize => handleOrderChange(orderType, orderBy, pageSize)}
				/>
			</InputGroup>
		</Box>
	);
}

export type PageNavigationProps = {
	pageCount: number;
	pageIdx: number;
	handlePageChange: (event: ChangeEvent<unknown>, value: number) => void;
};

type SimulationPaginationFooterProps = SimulationAppBarProps & PageNavigationProps;

export function SimulationPaginationFooter({
	pageCount,
	pageIdx,
	handlePageChange
}: SimulationPaginationFooterProps) {
	return (
		<Pagination
			sx={{
				display: 'flex',
				justifyContent: 'center',
				p: ({ spacing }) => spacing(2)
			}}
			count={pageCount}
			page={pageIdx}
			onChange={handlePageChange}
		/>
	);
}
