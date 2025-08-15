import {
	Box,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Tooltip,
	Typography,
	useTheme
} from '@mui/material';
import { ReactNode, SyntheticEvent } from 'react';

import { MenuOption } from './useMenuOptions';

type NavPanelElementProps = {
	selected?: boolean;
	handleChange?: (event: SyntheticEvent, value: string) => void;
	onClick?: (event: SyntheticEvent) => void;
	secondaryAction?: ReactNode;
	menuOption: MenuOption;
	open: boolean;
	buttonProps?:
		| {
				type: 'button';
		  }
		| {
				type: 'link';
				href?: string;
		  }
		| {
				type: 'label';
		  };
};

export default function NavPanelElement(props: NavPanelElementProps) {
	const theme = useTheme();
	const {
		open,
		selected,
		secondaryAction,
		buttonProps = { type: 'button' },
		onClick = () => {},
		handleChange = () => {}
	} = props;

	const { disabled, description, label, richLabel, tooltipLabel, icon, info, separator, value } =
		props.menuOption;

	const listItemContent = (
		<>
			<ListItemIcon
				sx={{
					minWidth: 0,
					mr: open ? 3 : 'auto',
					justifyContent: 'center'
				}}>
				{icon}
			</ListItemIcon>
			<ListItemText
				primary={richLabel ?? label}
				secondary={description}
				sx={{ opacity: open ? 1 : 0 }}
			/>
		</>
	);

	return (
		<Tooltip
			title={info ? <Typography>{info}</Typography> : <Typography>{tooltipLabel}</Typography>}
			placement='right'>
			<ListItem
				secondaryAction={secondaryAction}
				disablePadding
				sx={{
					'& .MuiListItemButton-root:hover': {
						backgroundColor: theme.palette.action.hover,
						borderRadius: theme.spacing(1)
					},
					'& .Mui-selected': {
						backgroundColor: theme.palette.action.selected,
						borderRadius: theme.spacing(1),
						color: theme.palette.text.primary
					},
					'marginBottom': theme.spacing(1)
				}}>
				{buttonProps.type === 'label' ? (
					<Box
						aria-label={label}
						sx={{
							display: 'flex',
							minHeight: 64,
							alignItems: 'center',
							justifyContent: open ? 'initial' : 'center'
						}}>
						{listItemContent}
					</Box>
				) : (
					<ListItemButton
						aria-label={label}
						sx={{
							minHeight: 64,
							justifyContent: open ? 'initial' : 'center'
						}}
						disabled={disabled}
						{...(buttonProps.type === 'link'
							? { component: 'a', href: buttonProps.href, target: '_blank' }
							: {})}
						selected={selected}
						aria-selected={selected}
						onClick={
							value === 'deployInfo'
								? onClick
								: (event: SyntheticEvent<Element, Event>) =>
										handleChange(event, value)
						}>
						{listItemContent}
					</ListItemButton>
				)}
			</ListItem>
		</Tooltip>
	);
}
