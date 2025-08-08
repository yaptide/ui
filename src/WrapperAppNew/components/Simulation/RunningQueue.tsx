import { AccordionDetails, AccordionSummary, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';

import StyledAccordion from '../../../shared/components/StyledAccordion';

export default function RunningQueue() {
	const theme = useTheme();

	return (
		<StyledAccordion
			expanded={true}
			sx={{
				margin: `0 ${theme.spacing(1)} ${theme.spacing(1)} ${theme.spacing(1)}`,
				flexGrow: 1
			}}>
			<AccordionSummary>
				<Typography
					textTransform='none'
					fontSize={16}>
					Queue
				</Typography>
			</AccordionSummary>
			<AccordionDetails></AccordionDetails>
		</StyledAccordion>
	);
}
