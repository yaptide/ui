import { Editor } from './Editor';
import { MergeObjects } from '../../services/TypeTransformUtil';

export type EditorJson = ReturnType<typeof Editor.prototype.toJSON>;
