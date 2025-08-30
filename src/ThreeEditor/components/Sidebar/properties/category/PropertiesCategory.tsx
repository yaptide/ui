import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { AccordionDetails, AccordionSummary, Grid, Typography } from '@mui/material';
import { ReactNode } from 'react';

import StyledAccordion from '../../../../../shared/components/StyledAccordion';

export function PropertiesCategory(props: {
	category: string;
	children?: ReactNode;
	visible?: boolean;
}) {
	const { category, children, visible = true } = props;

	return (
		<StyledAccordion
			key={category}
			sx={{ display: visible ? '' : 'none' }}>
			<AccordionSummary expandIcon={<ExpandMoreIcon />}>
				<Typography>{category}</Typography>
			</AccordionSummary>
			<AccordionDetails>
				<Grid
					container
					spacing={1}>
					{children}
				</Grid>
			</AccordionDetails>
		</StyledAccordion>
	);
}
