import JoinInnerIcon from '@mui/icons-material/JoinInner';
import JoinLeftIcon from '@mui/icons-material/JoinLeft';
import UndoIcon from '@mui/icons-material/Undo';
import {
	Box,
	IconButton,
	SvgIconProps,
	ToggleButton,
	ToggleButtonGroup,
	ToggleButtonGroupProps
} from '@mui/material';
import { Operation } from '../../../util/Operation';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import zIndex from '@mui/material/styles/zIndex';

type OperationInputProps = ToggleButtonGroupProps & {
	value?: SelectType;
	canClear?: boolean;
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

function OperationInput({
	exclusive = true,
	value,
	canClear,
	onChange,
	allowedOperations = ['intersection', 'subtraction'],
	...restProps
}: OperationInputProps) {
	return (
		<>
			{canClear && value && (
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
				<ToggleButton value='intersection' aria-label='intersection'>
					<JoinInnerIcon />
					{/* <img src='./images/S.png' alt='intersection' /> */}
				</ToggleButton>
				<ToggleButton value='subtraction' aria-label='subtraction'>
					<LeftSubtract />
					{/* <img src='./images/L.png' alt='subtraction' /> */}
				</ToggleButton>
			</ToggleButtonGroup>
		</>
	);
}
export default OperationInput;
