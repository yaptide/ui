import { YaptideEditor } from './YaptideEditor';

export type EditorJson = ReturnType<typeof YaptideEditor.prototype.toSerialized>;

export interface SerializableState<S> {
	toSerialized(): S;
	fromSerialized(state: S): this;
}
