import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import DescriptionIcon from '@mui/icons-material/Description';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Folder from '@mui/icons-material/Folder';
import GitHubIcon from '@mui/icons-material/GitHub';
import InfoIcon from '@mui/icons-material/Info';
import LoginIcon from '@mui/icons-material/Login';
import Menu from '@mui/icons-material/Menu';
import MenuOpen from '@mui/icons-material/MenuOpen';
import NotListedLocationIcon from '@mui/icons-material/NotListedLocation';
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import { Tooltip, Typography } from '@mui/material';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { CSSObject, styled, Theme } from '@mui/material/styles';
import React, { Dispatch, SetStateAction, SyntheticEvent, useState } from 'react';
import { useAuth } from '../../../services/AuthService';
import { useStore } from '../../../services/StoreService';
import deployInfo from '../../../util/identify/deployInfo.json';

type MenuOption = {
	label: string;
	value: string;
	disabled?: boolean;
	icon: React.ReactElement;
};

type NavDrawerProps = {
	drawerWidth?: number;
	handleChange: (event: SyntheticEvent, value: string) => void;
	tabsValue: string;
	open: boolean;
	setOpen: (open: boolean) => void;
};

const openedMixin = (width: number, { transitions }: Theme): CSSObject => ({
	width,
	transition: transitions.create('width', {
		easing: transitions.easing.sharp,
		duration: transitions.duration.enteringScreen
	}),
	overflowX: 'hidden'
});

const closedMixin = ({ transitions, breakpoints, spacing }: Theme): CSSObject => ({
	transition: transitions.create('width', {
		easing: transitions.easing.sharp,
		duration: transitions.duration.leavingScreen
	}),
	overflowX: 'hidden',
	width: `calc(${spacing(7)} + 1px)`,
	[breakpoints.up('sm')]: {
		width: `calc(${spacing(8)} + 1px)`
	}
});

const DrawerHeader = styled('div')(({ theme }) => ({
	'display': 'flex',
	'alignItems': 'center',
	'justifyContent': 'flex-end',
	'padding': theme.spacing(0, 1),
	'marginRight': theme.spacing(0.5),
	'marginLeft': theme.spacing(2),
	'cursor': 'pointer',
	'&:hover .MuiIconButton-root': {
		backgroundColor: 'rgba(255, 255, 255, 0.08)'
	},
	// necessary for content to be below app bar
	...theme.mixins.toolbar
}));

const getDrawer = (width: number) =>
	styled(MuiDrawer, { shouldForwardProp: prop => prop !== 'open' })(({ theme, open }) => ({
		width,
		flexShrink: 0,
		whiteSpace: 'nowrap',
		boxSizing: 'border-box',
		...(open && {
			...openedMixin(width, theme),
			'& .MuiDrawer-paper': openedMixin(width, theme)
		}),
		...(!open && {
			...closedMixin(theme),
			'& .MuiDrawer-paper': closedMixin(theme)
		})
	}));

function NavDrawer({ drawerWidth = 160, handleChange, tabsValue, open, setOpen }: NavDrawerProps) {
	const { resultsSimulationData } = useStore();
	const { isAuthorized } = useAuth();
	const [expand, setExpand] = useState(tabsValue === 'login');

	const handleDrawerToggle = () => {
		setOpen(!open);
	};
	const handleProfileToggle = () => {
		setExpand(prev => !prev);
	};

	const Drawer = getDrawer(drawerWidth);

	const MenuOptions: MenuOption[] = [
		// {
		// 	label: 'Projects',
		// 	value: 'projects',
		// 	disabled: true,
		// 	icon: <Folder />
		// },
		{
			label: 'Editor',
			value: 'editor',
			icon: <ViewInArIcon />
		},
		{
			label: 'Input files',
			value: 'inputFiles',
			icon: <DescriptionIcon />
		},
		{
			label: 'Simulations',
			value: 'simulations',
			disabled: !isAuthorized,
			icon: <OndemandVideoIcon />
		},
		{
			label: 'Results',
			value: 'results',
			disabled: !resultsSimulationData,
			icon: <AutoGraphIcon />
		},
		{
			label: 'About',
			value: 'about',
			icon: <InfoIcon />
		}
	];

	return (
		<Drawer
			variant='permanent'
			open={open}>
			<DrawerHeader onClick={handleDrawerToggle}>
				<ListItemText
					primary={<Typography variant='h5'>YAPTIDE</Typography>}
					sx={{ opacity: open ? 1 : 0 }}
				/>
				<IconButton>{open ? <Menu /> : <MenuOpen />}</IconButton>
			</DrawerHeader>
			<Divider />
			<List>
				<ListItemButton
					sx={{
						minHeight: 48,
						justifyContent: open ? 'initial' : 'center',
						px: 2.5
					}}
					onClick={handleProfileToggle}>
					<ListItemIcon
						sx={{
							minWidth: 0,
							mr: open ? 3 : 'auto',
							justifyContent: 'center'
						}}>
						{isAuthorized ? <PersonPinCircleIcon /> : <NotListedLocationIcon />}
					</ListItemIcon>
					<ListItemText
						primary={isAuthorized ? 'User' : 'Guest'}
						sx={{ opacity: open ? 1 : 0 }}
					/>
					{expand ? <ExpandLess /> : <ExpandMore />}
				</ListItemButton>
				<Collapse
					in={expand}
					timeout='auto'
					unmountOnExit>
					<List
						component='div'
						disablePadding
						sx={{
							backgroundColor: ({ palette }) => palette.primary.main
						}}>
						<ListItemButton
							sx={{
								pl: open ? 4 : 'auto'
							}}
							onClick={event => handleChange(event, 'login')}>
							<ListItemIcon>
								<LoginIcon />
							</ListItemIcon>
							<ListItemText
								primary={isAuthorized ? 'Logout' : 'Login'}
								sx={{
									opacity: open ? 1 : 0
								}}
							/>
						</ListItemButton>
					</List>
				</Collapse>
				<Divider />
				{MenuOptions.map(({ label, value, disabled, icon }) => (
					<ListItem
						key={label}
						disablePadding
						sx={{ display: 'block' }}>
						<ListItemButton
							sx={{
								minHeight: 48,
								justifyContent: open ? 'initial' : 'center',
								px: 2.5
							}}
							disabled={disabled}
							selected={tabsValue === value}
							onClick={event => handleChange(event, value)}>
							<ListItemIcon
								sx={{
									minWidth: 0,
									mr: open ? 3 : 'auto',
									justifyContent: 'center'
								}}>
								{icon}
							</ListItemIcon>
							<ListItemText
								primary={label}
								sx={{ opacity: open ? 1 : 0 }}
							/>
						</ListItemButton>
					</ListItem>
				))}
			</List>
			<Divider />

			<List sx={{ marginTop: 'auto' }}>
				<Divider />
				<ListItem
					disablePadding
					sx={{ display: 'block' }}>
					<Tooltip title={`${deployInfo.date} ${deployInfo.commit} ${deployInfo.branch}`}>
						<ListItemButton
							sx={{
								minHeight: 48,
								justifyContent: open ? 'initial' : 'center',
								px: 2.5
							}}
							component='a'
							href={'https://github.com/yaptide/ui/commit/' + deployInfo.commit}
							target='_blank'>
							<ListItemIcon
								sx={{
									minWidth: 0,
									mr: open ? 1.6 : 'auto',
									ml: open ? -1.6 : 'auto',
									justifyContent: 'center'
								}}>
								<GitHubIcon
									fontSize='large'
									sx={{ marginTop: 'auto', width: '100%', padding: 1 }}
								/>
							</ListItemIcon>
							<ListItemText
								primary={deployInfo.commit}
								secondary={deployInfo.date}
								sx={{ opacity: open ? 1 : 0 }}
							/>
						</ListItemButton>
					</Tooltip>
				</ListItem>
			</List>
		</Drawer>
	);
}

export default NavDrawer;
