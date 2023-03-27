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

const TOOLTIP_DELAY = 300;

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
						transform: 'translate(4px)'
					}
				}}
			/>
		</>
	);
}

function OperationToIcon(operation: Operation) {
	switch (operation) {
		case 'intersection':
			return <JoinInnerIcon />;
		case 'subtraction':
			return <LeftSubtract />;
		default:
			return null;
	}
}

function OperationToTooltip(operation: Operation, objectName: string = 'object') {
	switch (operation) {
		case 'intersection':
			return (
				<Typography>
					{'Intersect '}
					<Chip label={objectName} size='small' color='primary' />
					{' with a zone area'}
				</Typography>
			);
		case 'subtraction':
			return (
				<Typography>
					{'Subtract '}
					<Chip label={objectName} size='small' color='primary' />
					{' from a zone area'}
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
							height: 45
						}}>
						<IconButton
							onClick={onChange}
							sx={{
								padding: 3,
								borderRadius: '100% 100% 0 0',
								height: 75
							}}>
							<RestoreFromTrashIcon
								sx={{
									transform: 'scale(1.3) translate(0, -50%)'
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
							selected={operation === value}>
							{OperationToIcon(operation)}
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
