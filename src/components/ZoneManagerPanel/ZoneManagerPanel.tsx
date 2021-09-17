import { Button } from "@material-ui/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { Editor } from "../../ThreeEditor/js/Editor";
import { CSGZone } from "../../ThreeEditor/util/CSG/CSGZone";
import { CSGOperation } from "../../ThreeEditor/util/CSG/CSGOperation";
import { parseZone } from "../../util/parseZone/parseZone";
import BooleanAlgebraRow, { AlgebraRow } from "./BooleanAlgebraRow";
import "./zoneManagerPanel.css";

type ZoneManagerPanelProps = {
    editor: Editor,
    zone?: CSGZone,
}

function ZoneManagerPanel(props: ZoneManagerPanelProps) {
    const [rows, setRows] = useState<AlgebraRow[]>([]);

    const [allObjects, setAllObjects] = useState<THREE.Object3D[]>([]);

    const zoneRef = useRef<CSGZone>();


    const parseAlgebraRow = (row: AlgebraRow) => {
        let operations: CSGOperation[] = [];

        if (row.geometriesId[0]) {
            const object = props.editor.scene.getObjectById(row.geometriesId[0]);

            if (!object) throw new Error("object is undefined form props.editor.scene.getObjectById(row.geometries[0])");

            operations.push(new CSGOperation(object, 'union'));
        }

        for (let i = 0; i < row.operations.length; i++) {
            const operation = row.operations[i];
            const geometryID = row.geometriesId[i + 1];
            if (row.geometriesId.length > i + 1 && geometryID != null && operation != null) {
                const object = props.editor.scene.getObjectById(geometryID);

                if (!object) throw new Error("object is undefined form props.editor.scene.getObjectById(geometryID)");

                operations.push(new CSGOperation(object, operation));
            }
        }

        return operations;
    };

    const changeRowValues = (rowId: number) => (row: AlgebraRow) => {
        setRows((prev) => {
            let newRows = [...prev.map((el, id) => { return rowId === id ? row : el })];

            if (rowId < (zoneRef.current?.unionOperations.length ?? 0))
                zoneRef.current?.updateUnion(rowId, parseAlgebraRow(row));

            return newRows;
        }
        );

    };

    const addAlgebraRow = () => {
        setRows((prev) => [...prev, { geometriesId: [], operations: [] }]);
        zoneRef.current?.addUnion();
    };

    const removeRow = (removeId: number) => () => {
        setRows((prev) => {
            let newRows = [...prev.filter((el, id) => id !== removeId)];
            return newRows;
        });
        zoneRef.current?.removeUnion(removeId);
    }

    const refreshObjectsList = useCallback(
        () => {
            setAllObjects([...props.editor.scene.children]);
        },
        [props.editor]);

    const initZone = useCallback(() => {

        let manager = props.editor.CSGManager;
        props.zone || manager.zones.size > 0
            ? (() => {
                zoneRef.current = props.zone || manager.zones.values().next().value;

                let rows: AlgebraRow[] = [];
                zoneRef.current?.unionOperations.forEach((union) => {

                    let row: AlgebraRow = { geometriesId: [], operations: [] };

                    union.forEach((operation) => {
                        row.geometriesId.push(operation.object.id);
                        if (operation.mode !== 'union')
                            row.operations.push(operation.mode);
                    });

                    rows.push(row);
                });

                setRows([...rows]);

            })()
            : zoneRef.current = manager.createZone();

    }, [props.editor,props.zone]);

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
        initZone();
    },[initZone])

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
