import { Box } from '@mui/material';
import { useContext } from 'react';

import { useStore } from '../../../services/StoreService';
import { EditorToolbar } from '../../../ThreeEditor/componentsNew/Editor/EditorToolbar';
import { EditorMenu } from '../../../ThreeEditor/componentsNew/Editor/Header/EditorMenu';
import { EditorTitleBar } from '../../../ThreeEditor/componentsNew/Editor/Header/EditorTitlebar';
import { NavDrawerContext } from '../NavDrawer/NavDrawerContext';
import { ProjectMenu } from './ProjectMenu';
import SimulatorSelect from './SimulatorSelect';

export default function HeaderPanel() {
	const { yaptideEditor } = useStore();
	const currentTab = useContext(NavDrawerContext);

	return (
		<Box
			sx={{
				overflow: 'hidden',
				display: 'flex',
				flexDirection: 'row',
				alignItems: 'center',
				flexGrow: 1,
				padding: 1
			}}>
			<Box sx={{ flexGrow: 1, flexBasis: 0 }}>
				<ProjectMenu editor={yaptideEditor} />
				{currentTab === 'editor' && <EditorMenu editor={yaptideEditor} />}
			</Box>
			<EditorTitleBar sx={{ flexGrow: 1, flexBasis: 0 }} />
			<Box
				sx={{
					flexGrow: 1,
					flexBasis: 0,
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'flex-end'
				}}>
				<SimulatorSelect />
			</Box>
		</Box>
	);
}
