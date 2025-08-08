import { Tab, Tabs } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTabs = styled(Tabs)(({ theme }) => ({
	'width': '100%',
	'marginBottom': theme.spacing(1),
	'& .MuiTabs-indicator': {
		display: 'none'
	},
	'& .MuiTab-root:not(:last-child)': {
		marginRight: theme.spacing(1)
	}
}));

const StyledTab = styled(Tab)(({ theme }) => ({
	'minHeight': '48px',
	'&:hover': {
		backgroundColor: theme.palette.action.hover,
		borderRadius: theme.shape.borderRadius
	},
	'&.Mui-selected': {
		backgroundColor: theme.palette.action.selected,
		borderRadius: theme.shape.borderRadius,
		color: theme.palette.text.primary
	}
}));

export { StyledTab, StyledTabs };
