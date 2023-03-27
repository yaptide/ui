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
	Tooltip
} from '@mui/material';
import { Operation } from '../../../util/Operation';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import zIndex from '@mui/material/styles/zIndex';
import { Typography } from '@mui/material';

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
				<Tooltip
					title={
						<Typography>{'Remove operation from a zone area calculations'}</Typography>
					}
					placement='left'
					arrow
					followCursor
					enterDelay={TOOLTIP_DELAY}>
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'center',
							overflow: 'hidden',
							height: 40
						}}>
						<IconButton
							onClick={onChange}
							sx={{
								padding: 3,
								borderRadius: '45% 45% 0 0',
								height: 75,
								width: 55,
								margin: '0 auto'
							}}>
							<RestoreFromTrashIcon
								sx={{
									transform: 'scale(1.3) translate(0, -70%)'
								}}
							/>
						</IconButton>
					</Box>
				</Tooltip>
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
