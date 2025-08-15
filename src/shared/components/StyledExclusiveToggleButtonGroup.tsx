import { ToggleButtonGroup, ToggleButtonGroupProps, useTheme } from '@mui/material';

type StyledRadioButtonGroupProps = Omit<ToggleButtonGroupProps, 'exclusive' | 'orientation'>;

export function StyledExclusiveToggleButtonGroup(props: StyledRadioButtonGroupProps) {
	const theme = useTheme();
	const { sx: originalSx, ...rest } = props;

	return (
		<ToggleButtonGroup
			{...rest}
			exclusive
			orientation='horizontal'
			sx={{
				...originalSx,
				'boxSizing': 'border-box',
				'padding': theme.spacing(0.5),
				'borderRadius': theme.spacing(1),
				'borderStyle': 'solid',
				'borderWidth': 1,
				// https://github.com/mui/material-ui/blob/46e6588cf53a7abef986a6111e0ed49dace0bc98/packages/mui-material/src/OutlinedInput/OutlinedInput.js#L123
				'borderColor':
					theme.palette.mode === 'light'
						? 'rgba(0, 0, 0, 0.23)'
						: 'rgba(255, 255, 255, 0.23)',
				'gap': theme.spacing(0.5),
				'& .MuiToggleButtonGroup-lastButton, & .MuiToggleButtonGroup-firstButton, & .MuiToggleButtonGroup-centerButton':
					{
						backgroundColor: 'none',
						border: 'none',
						py: theme.spacing(0.75),
						px: theme.spacing(2),
						borderRadius: theme.spacing(1),
						fontSize: 10
					},
				'& .MuiToggleButton-root.Mui-disabled': {
					border: 'none'
				},
				'& .MuiToggleButton-root.Mui-selected': {
					color: theme.palette.primary.contrastText,
					backgroundColor: theme.palette.primary.main,
					borderRadius: theme.spacing(1)
				},
				'& .MuiToggleButton-root.Mui-selected:hover': {
					backgroundColor: theme.palette.primary.dark
				}
			}}>
			{props.children}
		</ToggleButtonGroup>
	);
}
