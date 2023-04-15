import {
	AppBar,
	AppBarProps,
	Box,
	Button,
	ButtonGroup,
	Container,
	Toolbar,
	ToolbarProps,
	Typography,
	ButtonProps,
	MenuItem,
	Select,
	SelectProps,
	styled,
	Card,
	Tooltip,
	CardProps,
	IconButton,
	Pagination
} from '@mui/material';
import { OrderBy, OrderType } from '../../../services/RequestTypes';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import React from 'react';
import CableIcon from '@mui/icons-material/Cable';
import QueuePlayNextIcon from '@mui/icons-material/QueuePlayNext';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export type SimulationAppBarProps = AppBarProps & {
	stickTo?: 'top' | 'bottom';
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
					// borderRadius: '4px 0 0 4px'
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

type OrderBySelectProps = Omit<SelectProps<OrderBy>, 'onChange'> & {
	onChange?: (orderBy: OrderBy) => void;
};

export function OrderBySelect({ children, onChange, ...other }: OrderBySelectProps) {
	return (
		<Select onChange={({ target }) => onChange?.(target.value as OrderBy)} {...other}>
			{children}
			<MenuItem value={OrderBy.START_TIME}>Start Time</MenuItem>
			<MenuItem value={OrderBy.END_TIME}>End Time</MenuItem>
		</Select>
	);
}

type PageSizeSelectProps = Omit<SelectProps<number>, 'onChange'> & {
	onChange?: (pageSize: number) => void;
};

export function PageSizeSelect({
	children = new Array(6).fill(NaN).map((_, index) => (
		<MenuItem
			value={4 * index + 2}
			dense={true}
			sx={{
				display: 'block',
				lineHeight: ({ spacing }) => spacing(2.5),
				minHeight: 'unset',
				height: ({ spacing }) => spacing(3.5)
			}}>
			{4 * index + 2}
		</MenuItem>
	)),
	onChange,
	...other
}: PageSizeSelectProps) {
	return (
		<Select
			onChange={({ target: { value } }) =>
				onChange?.(typeof value === 'string' ? parseInt(value) : value)
			}
			{...other}>
			{children}
		</Select>
	);
}

const InputGroup: typeof ButtonGroup = styled(ButtonGroup)(
	({
		theme: {
			shape: { borderRadius },
			spacing
		}
	}) => ({
		'height': spacing(5),
		'&:not(.MuiButtonGroup-vertical) > *': {
			'borderRadius': '0',
			'&:first-child': {
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
			'&:first-child': {
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

function BackendStatusIndicator({
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
				{...other}
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					p: ({ spacing }) => spacing(1),
					...other.sx
				}}
				elevation={1}
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
				{children}
			</AppBar>
			{/* <Container>
				<Typography sx={{ my: 2 }} variant='h5'>
					{[...new Array(48)]
						.map(
							() => `Cras mattis consectetur purus sit amet fermentum.
Cras justo odio, dapibus ac facilisis in, egestas eget quam.
Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
Praesent commodo cursus magna, vel scelerisque nisl consectetur et.`
						)
						.join('\n')}
				</Typography>
			</Container> */}
		</Box>
	);
}

type SimulationAccordionProps = {
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
			<Toolbar
				sx={{
					gap: ({ spacing }) => spacing(2)
				}}>
				<Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
					{title}
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
			</Toolbar>
		</SimulationAppBar>
	);
}

export type PageParamProps = {
	orderType: OrderType;
	orderBy: OrderBy;
	pageSize: number;
	handleOrderChange: (orderType: OrderType, orderBy: OrderBy, pageSize: number) => void;
};

type SimulationBackendHeaderBar = {
	isBackendAlive: boolean;
} & PageParamProps &
	SimulationLabelBarProps;

export function SimulationBackendHeader({
	isBackendAlive,
	orderType,
	orderBy,
	pageSize,
	handleOrderChange,
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
			<InputGroup
				sx={{
					marginLeft: 'auto'
				}}>
				<Button
					variant='contained'
					color='info'
					startIcon={<QueuePlayNextIcon />}
					disabled={!isBackendAlive}>
					Run new simulation
				</Button>
				<BackendStatusIndicator
					sx={{
						p: ({ spacing }) => spacing(2)
					}}
					isBackendAlive={isBackendAlive}
				/>
			</InputGroup>
		</SimulationLabelBar>
	);
}

export type PageNavigationProps = {
	pageCount: number;
	page: number;
	handlePageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
};

type SimulationPaginationFooterProps = SimulationAppBarProps & PageNavigationProps;

export function SimulationPaginationFooter({
	pageCount,
	page,
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
				page={page}
				onChange={handlePageChange}
			/>
		</SimulationAppBar>
	);
}
