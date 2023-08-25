import CableIcon from '@mui/icons-material/Cable';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import {
	AppBar,
	AppBarProps,
	Box,
	Button,
	ButtonBase,
	ButtonGroup,
	ButtonProps,
	Card,
	CardProps,
	IconButton,
	Pagination,
	styled,
	Toolbar,
	Tooltip,
	Typography
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

export const InputGroup: typeof ButtonGroup = styled(ButtonGroup)(
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

export function BackendStatusIndicator({
	isBackendAlive,
	...other
}: { isBackendAlive: boolean } & CardProps) {
	return (
		<Tooltip
			title={
				<Typography>{`Server connection: ${
					isBackendAlive ? 'connected' : 'unreachable'
				}`}</Typography>
			}
			arrow>
			<Card
				component={ButtonBase}
				{...other}
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					p: ({ spacing }) => spacing(1),
					...other.sx
				}}
				variant='outlined'>
				<CableIcon
					color={isBackendAlive ? 'success' : 'error'}
					sx={{ marginLeft: 'auto' }}
					fontSize='large'></CableIcon>
			</Card>
		</Tooltip>
	);
}

export function SimulationAppBar({
	stickTo = 'top',
	position,
	color = 'inherit',
	elevation = 1,
	children,
	accordion = {},
	sx,
	...other
}: SimulationAppBarProps) {
	position ??= !!stickTo ? 'sticky' : position;

	return (
		<Box
			position={'sticky'}
			p={({ spacing }) => spacing(3, 0)}
			mt={({ spacing }) => spacing(-3)}
			mb={({ spacing }) => spacing(-3)}
			sx={{
				width: '100%',
				inset: ({ spacing }) => spacing(-2, 0),
				zIndex: ({ zIndex }) => zIndex.appBar,
				background: ({ palette }) =>
					!stickTo
						? 'transparent'
						: `linear-gradient(${stickTo === 'top' ? '180' : '0'}deg , ${
								palette.background.default
						  } 50%, transparent 100%)`,
				...sx
			}}>
			<AppBar
				position='relative'
				color={color}
				elevation={elevation}
				sx={{
					borderRadius: 1
				}}>
				<Toolbar
					sx={{
						gap: ({ spacing }) => spacing(2),
						p: ({ spacing }) => spacing(1, 3)
					}}>
					{children}
					{isAccordionHeader(accordion) && (
						<IconButton
							aria-label='expand'
							onClick={accordion.toggleExpanded}
							sx={{
								transform: accordion.expanded ? 'rotate(180deg)' : undefined,
								// animate rotation
								transition: ({ transitions }) =>
									transitions.create('transform', {
										duration: transitions.duration.standard
									})
							}}>
							<ExpandMoreIcon />
						</IconButton>
					)}
				</Toolbar>
			</AppBar>
		</Box>
	);
}

export type SimulationAccordionProps = {
	expanded?: boolean;
	toggleExpanded?: () => void;
};

type SimulationLabelBarProps = SimulationAppBarProps & {
	title: string;
	subtitle?: string;
	accordion?: SimulationAccordionProps | { [key: string]: never };
};

function isAccordionHeader(x: Partial<SimulationAccordionProps>): x is SimulationAccordionProps {
	return x.toggleExpanded !== undefined && x.expanded !== undefined;
}

export function SimulationLabelBar({
	title,
	subtitle,
	accordion = {},
	children,
	...other
}: SimulationLabelBarProps) {
	return (
		<SimulationAppBar {...other}>
			<Typography
				variant='h5'
				component='div'
				sx={{
					flexGrow: 1,
					display: 'flex',
					flexDirection: 'column'
				}}>
				<Box>{title}</Box>
				{subtitle && (
					<Typography
						variant='subtitle1'
						component='div'
						sx={{
							color: ({ palette }) => palette.text.secondary
						}}>
						{subtitle}
					</Typography>
				)}
			</Typography>
			{children}
			{isAccordionHeader(accordion) && (
				<IconButton
					aria-label='expand'
					onClick={accordion.toggleExpanded}
					sx={{
						transform: accordion.expanded ? 'rotate(180deg)' : undefined,
						// animate rotation
						transition: ({ transitions }) =>
							transitions.create('transform', {
								duration: transitions.duration.standard
							})
					}}>
					<ExpandMoreIcon />
				</IconButton>
			)}
		</SimulationAppBar>
	);
}

export type PageParamProps = {
	orderType: OrderType;
	orderBy: OrderBy;
	pageSize: number;
	handleOrderChange: (orderType: OrderType, orderBy: OrderBy, pageSize: number) => void;
};

type SimulationBackendHeaderBar = PageParamProps & SimulationLabelBarProps;

export function SimulationBackendHeader({
	orderType,
	orderBy,
	pageSize,
	handleOrderChange,
	children,
	...other
}: SimulationBackendHeaderBar) {
	return (
		<SimulationLabelBar {...other}>
			<InputGroup>
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
			{children}
		</SimulationLabelBar>
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
	handlePageChange,
	...other
}: SimulationPaginationFooterProps) {
	return (
		<SimulationAppBar {...other}>
			<Pagination
				sx={{
					display: 'flex',
					justifyContent: 'end',
					p: ({ spacing }) => spacing(2)
				}}
				count={pageCount}
				page={pageIdx}
				onChange={handlePageChange}
			/>
		</SimulationAppBar>
	);
}
