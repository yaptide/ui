import {
	Box,
	Divider,
	IconButton,
	ListItem,
	ListItemButton,
	ListItemButtonProps,
	ListItemIcon,
	ListItemText,
	SxProps,
	Theme,
	Tooltip,
	Typography
} from '@mui/material';
import { MenuOption } from './NavDrawer';
import deployInfo from '../../../util/identify/deployInfo.json';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useAuth } from '../../../services/AuthService';
import NotListedLocationIcon from '@mui/icons-material/NotListedLocation';
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';
import { DEMO_MODE } from '../../../config/Config';
import { Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { ReactNode, SyntheticEvent } from 'react';
import PersonIcon from '@mui/icons-material/Person';

export type NavDrawerListProps = {
	tabsValue: string;
	menuOptions: MenuOption[];
	layout: 'open' | 'closed' | 'mobile';
	handleChange: (event: SyntheticEvent, value: string) => void;
};
type NavDrawerElementProps = {
	selected?: boolean;
	handleChange?: (event: SyntheticEvent, value: string) => void;
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
};

export function NavDrawerList({
	menuOptions,
	layout,
	handleChange,
	tabsValue
}: NavDrawerListProps) {
	const { isAuthorized, user, logout } = useAuth();
	const userLogout =
		!DEMO_MODE || !isAuthorized ? (
			<Tooltip title={<Typography>Log out</Typography>}>
				<IconButton
					sx={
						layout === 'closed'
							? {
									marginTop: 5
							  }
							: {
									marginTop: 1,
									marginLeft: '100%',
									transform: 'translateX(-100%)'
							  }
					}
					onClick={event => {
						logout();
						handleChange(event, 'login');
					}}>
					<LogoutIcon
						sx={{
							fontSize: 14
						}}
					/>
				</IconButton>
			</Tooltip>
		) : undefined;
	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				flexGrow: 1
			}}>
			<Box>
				<NavDrawerElement
					menuOption={{
						label: DEMO_MODE
							? 'Guest'
							: isAuthorized
							? user!.username
							: 'Not logged in',
						richLabel: (
							<Typography
								textAlign='right'
								marginRight={1}
								fontSize={16}>
								{DEMO_MODE ? (
									'Guest'
								) : isAuthorized ? (
									user!.username
								) : (
									<Button
										variant='outlined'
										onClick={event => handleChange(event, 'login')}>
										Log in
									</Button>
								)}
							</Typography>
						),
						description: layout === 'open' ? userLogout : undefined,
						value: 'deployInfo',
						disabled: false,
						icon: (
							<PersonIcon
								fontSize='large'
								sx={{
									marginBottom: !DEMO_MODE ? 4.5 : undefined
								}}
							/>
						)
					}}
					secondaryAction={layout === 'closed' ? userLogout : undefined}
					open={layout === 'open'}
					buttonProps={{
						type: 'label'
					}}
					sx={{
						minHeight: !DEMO_MODE ? 96 : 64
					}}
				/>
				<Divider />
			</Box>
			<Box
				sx={{
					paddingBottom: 25
				}}>
				{menuOptions.map(menuOption => (
					<NavDrawerElement
						key={menuOption.value}
						menuOption={menuOption}
						open={layout === 'open'}
						handleChange={handleChange}
						selected={menuOption.value === tabsValue}
					/>
				))}
			</Box>
			<Box>
				<Divider />
				<Tooltip
					title={
						<Typography>
							{`${deployInfo.date} ${deployInfo.commit}`}
							<br />
							{deployInfo.branch}
						</Typography>
					}>
					<NavDrawerElement
						menuOption={{
							label: deployInfo.commit,
							value: 'deployInfo',
							disabled: false,
							description: deployInfo.date,
							icon: <GitHubIcon fontSize='large' />
						}}
						open={layout === 'open'}
						buttonProps={{
							href: 'https://github.com/yaptide/ui/commit/' + deployInfo.commit,
							type: 'link'
						}}
					/>
				</Tooltip>
			</Box>
		</Box>
	);
}

function NavDrawerElement({
	menuOption: { label, richLabel, value, disabled, description, icon },
	open,
	selected,
	secondaryAction,
	sx = {},
	handleChange = () => {},
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
				sx={{ opacity: open ? 1 : 0 }}
			/>
		</>
	);
	return (
		<ListItem
			secondaryAction={secondaryAction}
			disablePadding
			sx={{ display: 'block' }}>
			{buttonProps.type === 'label' ? (
				<ListItem
					aria-label={label}
					sx={{
						minHeight: 64,
						justifyContent: open ? 'initial' : 'center',
						px: 2.5,
						...sx
					}}
					disabled={disabled}>
					{listItemContent}
				</ListItem>
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
					onClick={event => handleChange(event, value)}>
					{listItemContent}
				</ListItemButton>
			)}
		</ListItem>
	);
}
