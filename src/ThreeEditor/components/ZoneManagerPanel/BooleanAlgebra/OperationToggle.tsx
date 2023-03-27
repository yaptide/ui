import JoinInnerIcon from '@mui/icons-material/JoinInner';
import JoinLeftIcon from '@mui/icons-material/JoinLeft';
import UndoIcon from '@mui/icons-material/Undo';
import {
	Box,
	Chip,
	IconButton,
	SvgIconProps,
	ToggleButton,
	ToggleButtonGroup,
	ToggleButtonGroupProps,
	Tooltip,
	Typography
} from '@mui/material';
import { Operation } from '../../../util/Operation';

const TOOLTIP_DELAY = 400;

type OperationInputProps = ToggleButtonGroupProps & {
	value?: SelectType;
	canClear?: boolean;
	objectName?: string;
	onChange?: (event: React.MouseEvent<HTMLElement, MouseEvent>, value?: SelectType) => void;
	allowedOperations?: Operation[];
};

type SelectType = Operation | null;

function LeftSubtract(props: SvgIconProps) {
	return (
		<>
			<JoinLeftIcon
				{...props}
				sx={{
					'& ellipse': {
						fill: 'transparent',
						stroke: 'currentColor',
						strokeWidth: 2,
						rx: 6,
						ry: 6,
						transform: 'translate(3.9px)'
					},
					...(props.sx ?? {})
				}}
			/>
		</>
	);
}

function OperationToIcon(operation: Operation, showLabel: boolean) {
	switch (operation) {
		case 'intersection':
			return (
				<>
					<JoinInnerIcon sx={{ transform: 'scale(1.3)' }} />
					{showLabel && (
						<Typography variant={'body1'} sx={{ fontSize: 10, textTransform: 'none' }}>
							Intersect
						</Typography>
					)}
				</>
			);
		case 'subtraction':
			return (
				<>
					<LeftSubtract sx={{ transform: 'scale(1.3)' }} />
					{showLabel && (
						<Typography variant={'body1'} sx={{ fontSize: 10, textTransform: 'none' }}>
							Subtract
						</Typography>
					)}
				</>
			);

		default:
			return null;
	}
}

function OperationToTooltip(operation: Operation, objectName: string = 'object') {
	switch (operation) {
		case 'intersection':
			return (
				<Typography>
					{'Intersect'}
					<Chip
						label={objectName}
						size='small'
						color='primary'
						sx={{
							margin: '0 6px'
						}}
					/>
					{'with a zone area'}
				</Typography>
			);
		case 'subtraction':
			return (
				<Typography>
					{'Subtract'}
					<Chip
						label={objectName}
						size='small'
						color='primary'
						sx={{
							margin: '0 6px'
						}}
					/>
					{'from a zone area'}
				</Typography>
			);
		default:
			return null;
	}
}

function OperationInput({
	exclusive = true,
	value,
	canClear,
	objectName,
	onChange,
	allowedOperations = ['intersection', 'subtraction'],
	...restProps
}: OperationInputProps) {
	return (
		<>
			{canClear && value && (
				<Box
					sx={{
						'display': 'flex',
						'justifyContent': 'center',
						'overflow': 'hidden',
						'position': 'relative',
						'marginTop': '-40px',
						'&:before': {
							content: '""',
							position: 'absolute',
							width: '100%',
							height: '20px',
							backgroundColor: theme =>
								theme.palette.mode === 'dark' ? 'background.paper' : 'grey.100',
							top: 10,
							left: 0
						},
						'height': 40
					}}>
					<Tooltip
						title={
							<Typography>
								{'Remove operation from a zone area calculations'}
							</Typography>
						}
						placement='left'
						arrow
						followCursor
						enterDelay={TOOLTIP_DELAY}>
						<IconButton
							onClick={onChange}
							sx={{
								'padding': 3,
								'borderRadius': '45% 45% 0 0',
								'height': 55,
								'width': 55,
								'margin': '0 auto',
								'&:hover': {
									color: 'error.main'
								}
							}}>
							<UndoIcon
								sx={{
									transform: 'translate(0, -40%)'
								}}
							/>
						</IconButton>
					</Tooltip>
				</Box>
			)}
			<ToggleButtonGroup
				{...restProps}
				exclusive={exclusive}
				value={value}
				onChange={onChange}
				sx={{
					'width': '100%',
					'& .MuiToggleButton-root': {
						borderRadius: `4px ${value ? '4px 0 0' : ''}`,
						width: '100%'
					}
				}}
				aria-label='operation-select'>
				{allowedOperations.map(operation => (
					<Tooltip
						title={OperationToTooltip(operation, objectName)}
						placement='left'
						arrow
						followCursor
						enterDelay={TOOLTIP_DELAY}>
						<ToggleButton
							value={operation}
							aria-label={operation}
							selected={operation === value}
							sx={{
								display: 'flex',
								flexDirection: 'column'
							}}>
							{OperationToIcon(
								operation,
								true // pass `!value` to show label only on a last operationToggle
							)}
							{/* <JoinInnerIcon /> */}
							{/* <img src='./images/S.png' alt='intersection' /> */}
						</ToggleButton>
					</Tooltip>
				))}
			</ToggleButtonGroup>
		</>
	);
}
export default OperationInput;
