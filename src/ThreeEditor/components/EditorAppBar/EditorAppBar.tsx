import { Editor } from '../../js/Editor';
import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import SaveAsIcon from '@mui/icons-material/SaveAs';
type AppBarProps = {
	editor?: Editor;
};

function EditorAppBar({ editor }: AppBarProps) {
	return (
		<AppBar position='static'>
			<Toolbar>
				<IconButton
					size='small'
					edge='start'
					color='inherit'
					aria-label='menu'
					sx={{ mr: 2 }}>
					<FiberNewIcon />
				</IconButton>
				<IconButton
					size='small'
					edge='start'
					color='inherit'
					aria-label='menu'
					sx={{ mr: 2 }}>
					<FolderOpenIcon />
				</IconButton>
				<IconButton
					size='small'
					edge='start'
					color='inherit'
					aria-label='menu'
					sx={{ mr: 2 }}>
					<UndoIcon />
				</IconButton>
				<IconButton
					size='small'
					edge='start'
					color='inherit'
					aria-label='menu'
					sx={{ mr: 2 }}>
					<SaveAsIcon />
				</IconButton>
				<IconButton
					size='small'
					edge='start'
					color='inherit'
					aria-label='menu'
					sx={{ mr: 2 }}>
					<RedoIcon />
				</IconButton>
				<Typography variant='subtitle1' component='div' align='center' sx={{ flexGrow: 1 }}>
					{editor?.config.getKey('project/title') as string}
				</Typography>
			</Toolbar>
		</AppBar>
	);
}
export default EditorAppBar;
