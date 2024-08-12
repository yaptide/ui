import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import GitHubIcon from '@mui/icons-material/GitHub';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import {
	Box,
	Divider,
	IconButton,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	SxProps,
	Theme,
	Tooltip,
	Typography
} from '@mui/material';
import { ReactNode, SyntheticEvent, useMemo } from 'react';

import { useConfig } from '../../../config/ConfigService';
import { useAuth } from '../../../services/AuthService';
import deployInfo from '../../../util/identify/deployInfo.json';
import { MenuOption } from './NavDrawer';

export type NavDrawerListProps = {
	tabsValue: string;
	menuOptions: MenuOption[];
	layout: 'open' | 'closed' | 'mobile';
	handleChange: (event: SyntheticEvent, value: string) => void;
};
type NavDrawerElementProps = {
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
	sx?: SxProps<Theme>;
	textSx?: SxProps<Theme>;
};

export function NavDrawerList({
	menuOptions,
	layout,
	handleChange,
	tabsValue
}: NavDrawerListProps) {
	const { demoMode } = useConfig();
	const { isAuthorized, user, logout } = useAuth();

	const username = useMemo(
		() => (isAuthorized && user ? `Log out ${user.username}` : 'Log in'),
		[isAuthorized, user]
	);

	return (
		<Box
			sx={{
				display: 'grid',
				gridAutoRows: '1fr auto',
				height: 'calc(100% - 64px)',
				width: 'inherit'
			}}>
			{!demoMode ? (
				<Box
					sx={{
						width: 'inherit'
					}}>
					<List
						sx={{
							paddingBottom: '0px',
							paddingTop: '0px'
						}}>
						<NavDrawerElement
							menuOption={{
								label: username,
								richLabel: (
									<Typography
										sx={{
											marginRight: 1,
											textOverflow: 'ellipsis',
											overflow: 'hidden'
										}}>
										{isAuthorized && user ? (
											<Box>
												Log out{' '}
												<Box
													sx={{
														fontWeight: 'bold',
														overflowWrap: 'break-word',
														whiteSpace: 'nowrap',
														overflow: 'hidden',
														textOverflow: 'ellipsis'
													}}>
													{user.username}
												</Box>
											</Box>
										) : (
											'Log in'
										)}
									</Typography>
								),
								description: <Typography />,
								value: 'deployInfo',
								disabled: false,
								info: isAuthorized ? username : 'Log in',
								icon: <PersonIcon fontSize='large' />
							}}
							open={layout === 'open'}
							onClick={(event: SyntheticEvent<Element, Event>) => {
								if (isAuthorized) logout();
								else handleChange(event, 'login');
							}}
							buttonProps={{
								type: 'button'
							}}
							sx={{
								height: 64
							}}
						/>
					</List>
					<Divider />
				</Box>
			) : (
				<Box />
			)}

			<Box>
				<List>
					{menuOptions.map(menuOption => (
						<NavDrawerElement
							key={menuOption.value}
							menuOption={menuOption}
							open={layout === 'open'}
							handleChange={handleChange}
							selected={menuOption.value === tabsValue}
						/>
					))}
				</List>
			</Box>

			<Box />
			<Box
				sx={{
					marginTop: 'auto'
				}}>
				<Divider />
				<List>
					<NavDrawerElement
						textSx={{
							'& .MuiListItemText-primary': {
								fontSize: '0.675rem'
							}
						}}
						menuOption={{
							label: 'Documentation',
							tooltipLabel: 'Documentation',
							value: 'documentation',
							disabled: false,
							icon: <AutoStoriesIcon fontSize='large' />
						}}
						open={layout === 'open'}
						buttonProps={{
							href: 'https://yaptide.github.io/docs/',
							type: 'link'
						}}
					/>
					<NavDrawerElement
						menuOption={{
							label: deployInfo.commit,
							value: 'deployInfo',
							disabled: false,
							info: (
								<>
									{`${deployInfo.date} ${deployInfo.commit}`}
									<br />
									{deployInfo.branch}
								</>
							),
							description: deployInfo.date,
							icon: <GitHubIcon fontSize='large' />
						}}
						open={layout === 'open'}
						buttonProps={{
							href: 'https://github.com/yaptide/ui/commit/' + deployInfo.commit,
							type: 'link'
						}}
					/>
				</List>
			</Box>
		</Box>
	);
}

function NavDrawerElement({
	menuOption: { label, richLabel, tooltipLabel, value, disabled, info, description, icon },
	open,
	selected,
	secondaryAction,
	sx = {},
	textSx = {},
	handleChange = () => {},
	onClick = () => {},
	buttonProps = { type: 'button' }
}: NavDrawerElementProps) {
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
				sx={{ opacity: open ? 1 : 0, ...textSx }}
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
				sx={{ display: 'block' }}>
				{buttonProps.type === 'label' ? (
					<Box
						aria-label={label}
						sx={{
							display: 'flex',
							minHeight: 64,
							alignItems: 'center',
							justifyContent: open ? 'initial' : 'center',
							px: 2.5,
							...sx
						}}>
						{listItemContent}
					</Box>
				) : (
					<ListItemButton
						aria-label={label}
						sx={{
							minHeight: 64,
							justifyContent: open ? 'initial' : 'center',
							px: 2.5,
							...sx
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
