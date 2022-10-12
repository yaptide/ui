import { Accordion, AccordionSummary, Typography, AccordionDetails, Grid } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export function PropertiesCategory(props: {
	category: string;
	children: React.ReactNode;
	visible?: boolean;
}) {
	const { category, children, visible = true } = props;

	return (
		<Accordion key={category} sx={{ display: visible ? '' : 'none' }}>
			<AccordionSummary expandIcon={<ExpandMoreIcon />}>
				<Typography>{category}</Typography>
			</AccordionSummary>
			<AccordionDetails>
				{visible && (
					<Grid container spacing={2}>
						{children}
					</Grid>
				)}
			</AccordionDetails>
		</Accordion>
	);
}
