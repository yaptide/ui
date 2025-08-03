import { Box } from '@mui/material';

import { useStore } from '../../../services/StoreService';
import { EditorMenu } from '../../../ThreeEditor/componentsNew/Editor/Header/EditorMenu';
import { EditorTitleBar } from '../../../ThreeEditor/componentsNew/Editor/Header/EditorTitlebar';
import { EditorToolbar } from '../../../ThreeEditor/componentsNew/Editor/Header/EditorToolbar';
import { ProjectMenu } from './ProjectMenu';

export default function HeaderPanel() {
	const { yaptideEditor } = useStore();

	return (
		<Box
			sx={{
				overflow: 'hidden',
				display: 'flex',
				flexDirection: 'row',
				flexGrow: 1,
				padding: 1
			}}>
			<Box sx={{ flexGrow: 1 }}>
				<ProjectMenu editor={yaptideEditor} />
				<EditorMenu editor={yaptideEditor} />
			</Box>
			<EditorTitleBar />
			<Box sx={{ flexGrow: 1 }}>
				<EditorToolbar editor={yaptideEditor} />
			</Box>
		</Box>
	);
}
