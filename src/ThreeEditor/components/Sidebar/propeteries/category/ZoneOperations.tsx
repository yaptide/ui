import { Editor } from '../../../../js/Editor';
import { useSmartWatchEditorState } from '../../../../util/hooks/signals';
import { PropertiesCategory } from './PropertiesCategory';
import { Object3D } from 'three';
import { isZone } from '../../../../util/CSG/CSGZone';
import ZoneManagerPanel from '../../../ZoneManagerPanel/ZoneManagerPanel';
import { Grid } from '@mui/material';

export function ZoneOperations(props: { editor: Editor; object: Object3D }) {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(
		editor,
		isZone(object) ? object : null
	);

	const visibleFlag = isZone(watchedObject);

	return (
		<PropertiesCategory category='Zone Operations' visible={visibleFlag}>
			{watchedObject && (
				<Grid item xs={12}>
					<ZoneManagerPanel editor={editor} zone={watchedObject.object} />
				</Grid>
			)}
		</PropertiesCategory>
	);
}
