import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { SxProps, Theme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import * as React from 'react';

interface InfoTooltipProps {
	title: string;
	sx?: SxProps<Theme> | undefined;
}

export const InfoTooltip = (props: InfoTooltipProps) => {
	return (
		<Tooltip
			title={props.title}
			sx={props.sx}>
			<InfoOutlinedIcon />
		</Tooltip>
	);
};
