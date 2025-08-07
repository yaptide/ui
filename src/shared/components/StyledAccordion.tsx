import { Accordion, AccordionProps, Box, styled } from '@mui/material';

const StyledAccordion = styled((props: AccordionProps) => (
	<Accordion
		{...props}
		disableGutters
		square
		slots={{
			// Override the default Paper; this gets rid of
			// predefined boxShadow and backgroundColor
			// and lets us do the styling
			root: Box,
			// Override the default h3; this lets us set
			// the bottom border as separator when expanded
			heading: Box
		}}>
		{props.children}
	</Accordion>
))(({ theme }) => ({
	'&.MuiBox-root': {
		borderRadius: theme.spacing(1),
		marginBottom: theme.spacing(1),
		backgroundColor: '#343434'
	},
	'&.Mui-expanded .MuiAccordion-heading': {
		borderBottomStyle: 'solid',
		borderBottomWidth: 1,
		borderBottomColor: theme.palette.divider
	},
	'& .MuiAccordionSummary-root': {
		minHeight: 0
	},
	'& .MuiOutlinedInput-root, & .MuiToggleButtonGroup-root': {
		backgroundColor: theme.palette.grey['900']
	}
}));

export default StyledAccordion;
