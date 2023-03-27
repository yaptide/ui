import {
	Accordion as MuiAccordion,
	AccordionSummary as MuiAccordionSummary,
	Typography,
	AccordionDetails as MuiAccordionDetails,
	Grid,
	AccordionProps,
	AccordionSummaryProps,
	styled,
	useMediaQuery
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const AccordionSummary = styled((props: AccordionSummaryProps) => (
	<MuiAccordionSummary {...props} />
))(({ theme }) => ({
	'backgroundColor':
		theme.palette.mode === 'dark' ? theme.palette.grey['800'] : theme.palette.grey['300'],

	'& .MuiAccordionSummary-content:is(.MuiAccordionSummary-content,.Mui-expanded)': {
		margin: theme.spacing(1),
		marginLeft: theme.spacing(0)
	},

	'minHeight': 'unset',
	'&.Mui-expanded': {
		minHeight: 'unset'
	}
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
	padding: theme.spacing(2),
	paddingTop: theme.spacing(1)
}));

const Accordion = styled((props: AccordionProps) => <MuiAccordion square {...props} />)(
	({ theme }) => ({
		'&.Mui-expanded': {
			margin: '0'
		}
	})
);

export function PropertiesCategory(props: {
	category: string;
	children: React.ReactNode;
	visible?: boolean;
}) {
	const { category, children, visible = true } = props;

	return (
		<Accordion defaultExpanded square key={category} sx={{ display: visible ? '' : 'none' }}>
			<AccordionSummary expandIcon={<ExpandMoreIcon />}>
				<Typography>{category}</Typography>
			</AccordionSummary>
			<AccordionDetails>
				<Grid container spacing={2}>
					{children}
				</Grid>
			</AccordionDetails>
		</Accordion>
	);
}
