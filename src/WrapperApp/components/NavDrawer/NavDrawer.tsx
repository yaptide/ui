import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import DescriptionIcon from '@mui/icons-material/Description';
import InfoIcon from '@mui/icons-material/Info';
import Menu from '@mui/icons-material/Menu';
import MenuOpen from '@mui/icons-material/MenuOpen';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import { FormControlLabel, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import { CSSObject, Theme, styled } from '@mui/material/styles';
import React, { ReactNode, SyntheticEvent } from 'react';
import { useAuth } from '../../../services/AuthService';
import { useStore } from '../../../services/StoreService';
import { NavDrawerList } from './NavDrawerList';

export type MenuOption = {
	label: string;
	richLabel?: ReactNode;
	description?: ReactNode;
	info?: ReactNode;
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

	const handleDrawerToggle = () => {
		setOpen(!open);
	};

	const Drawer = getDrawer(drawerWidth);

	const menuOptions: MenuOption[] = [
		{
			label: 'Editor',
			value: 'editor',
			icon: <ViewInArIcon fontSize='large' />
		},
		{
			label: 'Input files',
			value: 'inputFiles',
			icon: <DescriptionIcon fontSize='large' />
		},
		{
			label: 'Simulations',
			value: 'simulations',
			disabled: !isAuthorized,
			info: !isAuthorized ? 'You need to be logged in to use this feature.' : undefined,
			icon: <OndemandVideoIcon fontSize='large' />
		},
		{
			label: 'Results',
			value: 'results',
			disabled: !resultsSimulationData,
			info: !resultsSimulationData ? 'There are no results to display.' : undefined,
			icon: <AutoGraphIcon fontSize='large' />
		},
		{
			label: 'About',
			value: 'about',
			icon: <InfoIcon fontSize='large' />
		}
	];

	return (
		<Drawer
			variant='permanent'
			aria-label='Navigation drawer for the YAPTIDE application'
			aria-expanded={open ? 'true' : 'false'}
			open={open}>
			<DrawerHeader>
				<ListItemText
					primary={
						<FormControlLabel
							labelPlacement='start'
							sx={{
								margin: 0,
								display: 'flex',
								justifyContent: 'space-between'
							}}
							control={
								<IconButton
									aria-label={'Toggle drawer button'}
									onClick={handleDrawerToggle}>
									{open ? <Menu /> : <MenuOpen />}
								</IconButton>
							}
							label={
								<Typography
									variant='h5'
									sx={{ opacity: open ? 1 : 0 }}>
									YAPTIDE
								</Typography>
							}
						/>
					}
				/>
			</DrawerHeader>
			<Divider />
			<NavDrawerList
				menuOptions={menuOptions}
				layout={open ? 'open' : 'closed'}
				handleChange={handleChange}
				tabsValue={tabsValue}
			/>
		</Drawer>
	);
}

export default NavDrawer;
