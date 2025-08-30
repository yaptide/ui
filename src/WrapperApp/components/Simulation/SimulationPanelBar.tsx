import {
	Box,
	FormControlLabel,
	MenuItem,
	Pagination,
	Select,
	Typography,
	useTheme
} from '@mui/material';
import { ChangeEvent } from 'react';

import { OrderBy, OrderType } from '../../../types/RequestTypes';

// ordering was originally split into orderType and orderBy
// To simplify the UI, they were joined together, without touching internal logic
// so some mean of translating between 1 and 2 variables is necessary
const OrderLabeller = {
	makeKey: (orderType: OrderType, orderBy: OrderBy) => {
		return `${orderType}#${orderBy}`;
	},
	makeLabel: (orderType: OrderType, orderBy: OrderBy) => {
		return (
			(orderBy === OrderBy.START_TIME ? 'Start Time' : 'End Time') +
			', ' +
			(orderType === OrderType.ASCEND ? 'ascending' : 'descending')
		);
	},
	fromKey: (key: string): [OrderType, OrderBy] => {
		let orderType = OrderType.ASCEND,
			orderBy = OrderBy.START_TIME; // default (fallback) values

		try {
			const [typeStr, byStr] = key.split('#');

			if (typeStr === OrderType.DESCEND) {
				orderType = OrderType.DESCEND;
			}

			if (byStr === OrderBy.END_TIME) {
				orderBy = OrderBy.END_TIME;
			}
		} catch {}

		return [orderType, orderBy];
	}
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
				margin: theme.spacing(1)
			}}>
			<FormControlLabel
				label={<Typography sx={{ mx: theme.spacing(1) }}>Order by:</Typography>}
				labelPlacement='start'
				control={
					<Select
						value={OrderLabeller.makeKey(orderType, orderBy)}
						variant='outlined'
						size='small'
						onChange={e =>
							handleOrderChange(...OrderLabeller.fromKey(e.target.value), pageSize)
						}>
						<MenuItem
							value={OrderLabeller.makeKey(OrderType.ASCEND, OrderBy.START_TIME)}>
							{OrderLabeller.makeLabel(OrderType.ASCEND, OrderBy.START_TIME)}
						</MenuItem>
						<MenuItem
							value={OrderLabeller.makeKey(OrderType.DESCEND, OrderBy.START_TIME)}>
							{OrderLabeller.makeLabel(OrderType.DESCEND, OrderBy.START_TIME)}
						</MenuItem>
						<MenuItem value={OrderLabeller.makeKey(OrderType.ASCEND, OrderBy.END_TIME)}>
							{OrderLabeller.makeLabel(OrderType.ASCEND, OrderBy.END_TIME)}
						</MenuItem>
						<MenuItem
							value={OrderLabeller.makeKey(OrderType.DESCEND, OrderBy.END_TIME)}>
							{OrderLabeller.makeLabel(OrderType.DESCEND, OrderBy.END_TIME)}
						</MenuItem>
					</Select>
				}
			/>
			<FormControlLabel
				label={<Typography sx={{ mx: theme.spacing(1) }}>On page:</Typography>}
				labelPlacement='start'
				control={
					<Select
						value={pageSize}
						variant='outlined'
						size='small'
						onChange={e => handleOrderChange(orderType, orderBy, e.target.value)}>
						{[6, 10, 14, 18, 22].map(v => (
							<MenuItem value={v}>{v}</MenuItem>
						))}
					</Select>
				}
			/>
		</Box>
	);
}

export type PageNavigationProps = {
	pageCount: number;
	pageIdx: number;
	handlePageChange: (event: ChangeEvent<unknown>, value: number) => void;
};

export type PageParamProps = {
	orderType: OrderType;
	orderBy: OrderBy;
	pageSize: number;
	handleOrderChange: (orderType: OrderType, orderBy: OrderBy, pageSize: number) => void;
};

type SimulationPaginationFooterProps = PageNavigationProps & PageParamProps;

export function SimulationPaginationFooter(props: SimulationPaginationFooterProps) {
	const theme = useTheme();
	const { pageCount, pageIdx, handlePageChange, ...rest } = props;

	return (
		<Box
			sx={{
				display: 'flex',
				justifyContent: 'center',
				p: theme.spacing(2),
				marginTop: 'auto',
				marginBottom: theme.spacing(3)
			}}>
			<Pagination
				sx={{
					display: 'flex',
					justifyContent: 'center'
				}}
				count={pageCount}
				page={pageIdx}
				onChange={handlePageChange}
			/>
			<SimulationPaginationControls {...rest} />
		</Box>
	);
}
