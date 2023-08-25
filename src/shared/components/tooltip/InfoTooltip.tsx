import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Tooltip from '@mui/material/Tooltip';
import * as React from 'react';

interface InfoTooltipProps {
	title: string;
}

export const InfoTooltip = (props: InfoTooltipProps) => {
	return (
		<Tooltip title={props.title}>
			<InfoOutlinedIcon />
		</Tooltip>
	);
};
