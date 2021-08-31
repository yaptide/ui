import { Button } from "@material-ui/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { Editor } from "../../ThreeEditor/js/Editor";
import { CSGManager, CSGOperation, CSGZone } from "../../ThreeEditor/util/CSGManager";
import { parseZone } from "../../util/parseZone/parseZone";
import BooleanAlgebraRow, { AlgebraRow } from "./BooleanAlgebraRow";
import "./zoneManagerPanel.css";



function ZoneManagerPanel(props: { editor: Editor }) {
    const [rows, setRows] = useState<AlgebraRow[]>([]);

    const [allObjects, setAllObjects] = useState<THREE.Object3D[]>([]);
    const csgManagerRef = useRef(new CSGManager(props.editor));
    const zoneRef = useRef<CSGZone>();


    const parseAlgebraRow = (row: AlgebraRow) => {
        let operations: CSGOperation[] = [];

        if (row.geometries[0]) {
            const object = props.editor.scene.getObjectById(row.geometries[0]);
            if (!object) throw new Error("object is undefined form props.editor.scene.getObjectById(row.geometries[0])");
            operations.push({ object: object, mode: 'union' });
        }

        for (let i = 0; i < row.operations.length; i++) {
            const operation = row.operations[i];
            const geometryID = row.geometries[i + 1];
            if (row.geometries.length > i + 1 && geometryID != null && operation != null) {
                const object = props.editor.scene.getObjectById(geometryID);
                if (!object) throw new Error("object is undefined form  props.editor.scene.getObjectById(geometryID)");
                operations.push({ object: object, mode: operation });
            }
        }
        return operations;
    };

    const changeRowValues = (rowId: number) => (row: AlgebraRow) => {
        setRows((prev) => {
            let newRows = [...prev.map((el, id) => { return rowId === id ? row : el })];

            zoneRef.current?.updateUnion(rowId, parseAlgebraRow(row));

            return newRows;
        }
        );

    };

    const addAlgebraRow = () => {
        setRows((prev) => [...prev, { geometries: [], operations: [] }]);
        zoneRef.current?.addUnion();
    };

    const removeRow = (removeId: number) => () => {
        setRows((prev) => {
            let newRows = [...prev.filter((el, id) => id !== removeId)];
            if(newRows.length === 0) newRows.push({ geometries: [], operations: [] });
            return newRows;
        });
        zoneRef.current?.removeUnion(removeId);
    }

    const refreshObjectsList = useCallback(
        () => {
            setAllObjects([...props.editor.scene.children]);
        },
        [props.editor]);

    useEffect(() => {
        refreshObjectsList();
        props.editor.signals.objectAdded.add(refreshObjectsList);
        props.editor.signals.objectRemoved.add(refreshObjectsList);
        return () => {
            props.editor.signals.objectAdded.remove(refreshObjectsList);
            props.editor.signals.objectRemoved.remove(refreshObjectsList);
        }
    }, [props.editor, refreshObjectsList]);

    useEffect(() => {
        let manager = csgManagerRef.current;
        let zone = manager.createZone();
        zoneRef.current = zone;
        return () => {
            manager.removeZone(zone);
        }
    }, [props.editor]);

    return (<div className="zoneManagerWrapper">
        {rows.map((row, id) => {
            return (<BooleanAlgebraRow
                key={id}
                id={id}
                del={removeRow(id)}
                change={changeRowValues(id)}
                value={row}
                possibleObjects={allObjects}
            ></BooleanAlgebraRow>)
        })}
        <Button className="addRowButton" onClick={addAlgebraRow}>+</Button>
        <Button className="parseZoneButton" onClick={() => parseZone(rows)}>Parse Zone</Button>
    </div>);
}

export default ZoneManagerPanel;
