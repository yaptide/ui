import { RefObject, useEffect } from "react";
import { Object3D } from "three";
import { RemoveDetectGeometryCommand } from "../../js/commands/RemoveDetectGeometryCommand";
import { RemoveDifferentialModifierCommand } from "../../js/commands/RemoveDifferentialModifierCommand";
import { RemoveFilterCommand } from "../../js/commands/RemoveFilterCommand";
import { RemoveObjectCommand } from "../../js/commands/RemoveObjectCommand";
import { RemoveQuantityCommand } from "../../js/commands/RemoveQuantityCommand";
import { RemoveZoneCommand } from "../../js/commands/RemoveZoneCommand";
import { SetFilterRuleCommand } from "../../js/commands/SetFilterRuleCommand";
import { Editor } from "../../js/Editor";
import { isZone } from "../CSG/CSGZone";
import { isDetectFilter } from "../Detect/DetectFilter";
import { isDetectGeometry } from "../Detect/DetectGeometry";
import { isOutput } from "../Scoring/ScoringOutput";
import { isQuantity } from "../Scoring/ScoringQuantity";


export const useKeyboardEditorControls = (editor: Editor | undefined, containerRef: RefObject<HTMLElement>) => {
    useEffect(() => {
        if (!editor || !containerRef.current) return;

        const container = containerRef.current;

        const { config } = editor;

        const IS_MAC = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

        const getRemoveCommand = (object: Object3D) => {

            if (isDetectGeometry(object)) {
                return new RemoveDetectGeometryCommand(editor, object);

            } else if (isZone(object)) {
                return new RemoveZoneCommand(editor, object);

            }
            else if (isDetectFilter(object)) {
                if (object.selectedRule) return new SetFilterRuleCommand(editor, object);
                return new RemoveFilterCommand(editor, object);

            } else if (isQuantity(object)) {
                if (object.selectedModifier)
                    return new RemoveDifferentialModifierCommand(
                        editor,
                        object,
                        object.selectedModifier
                    );

                if (isOutput(object.parent))
                    return new RemoveQuantityCommand(editor, object, object.parent);
                else throw new Error('Quantity has no parent output');
            }

            return new RemoveObjectCommand(editor, object);


        };

        const onKeyDown = (event: KeyboardEvent) => {

            console.log(event.key, container);
            switch (event.key.toLowerCase()) {
                case 'delete':
                    const object = editor.selected;

                    if (object === null || object.notRemovable === true) return;

                    const parent = object.parent;
                    if (parent !== null) editor.execute(getRemoveCommand(object));
                    break;

                // Disabled features
                // case config.getKey('settings/shortcuts/translate'):
                //     signals.transformModeChanged.dispatch('translate');

                //     break;

                // case config.getKey('settings/shortcuts/rotate'):
                //     signals.transformModeChanged.dispatch('rotate');

                //     break;

                // case config.getKey('settings/shortcuts/scale'):
                //     signals.transformModeChanged.dispatch('scale');

                // break;

                case config.getKey('settings/shortcuts/undo'):
                    if (IS_MAC ? event.metaKey : event.ctrlKey) {
                        event.preventDefault(); // Prevent browser specific hotkeys

                        if (event.shiftKey) {
                            editor.redo();
                        } else {
                            editor.undo();
                        }
                    }

                    break;

                case config.getKey('settings/shortcuts/focus'):
                    if (editor.selected !== null) {
                        editor.focus(editor.selected);
                    }

                    break;

                default:
                    break;
            }
        }

        container.addEventListener("keydown", onKeyDown);
        return () => {
            container.removeEventListener("keydown", onKeyDown);
        };
    }, [containerRef, editor]);

}