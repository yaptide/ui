import { Avatar, Box, Chip, ChipProps, Tooltip } from '@mui/material';

type GeometryInputProps = ChipProps & {
	label?: string;
	onClick?: React.MouseEventHandler<HTMLElement>;
	tooltipId?: string;
};

export function GeometryLabel({
	tooltipId = '',
	label = 'Not Selected',
	color = 'secondary',
	...restProps
}: GeometryInputProps) {
	return (
		<Chip
			{...restProps}
			color={color}
			label={label}
			avatar={
				<Avatar>
					<Tooltip title={tooltipId} placement='right'>
						<Box>ID</Box>
					</Tooltip>
				</Avatar>
			}
			sx={{
				'minWidth': '70px',
				'display': 'flex',
				'flexDirection': 'row-reverse',
				'borderRadius': '0 0 16px 16px',
				'padding': '5px 2px',
				'minHeight': 40,
				'height': 40,
				'& .MuiChip-avatar': {
					marginLeft: '-6px',
					marginRight: '5px'
				}
			}}
		/>
	);
}
