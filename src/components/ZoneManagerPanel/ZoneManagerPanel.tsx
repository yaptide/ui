import { Button } from "@material-ui/core";
import { useCallback, useEffect, useState } from "react";
import { Editor } from "../../ThreeEditor/js/Editor";
import { parseZone } from "../../util/parseZone/parseZone";
import BooleanAlgebraRow, { AlgebraRow } from "./BooleanAlgebraRow";
import "./zoneManagerPanel.css";



function ZoneManagerPanel(props: { editor: Editor }) {
    const [rows, setRows] = useState<AlgebraRow[]>([{ geometries: [], operations: [] }]);
    const [allObjects, setAllObjects] = useState<THREE.Object3D[]>([]);


    const changeRowValues = (rowId: number) => (row: AlgebraRow) => {
        setRows((prev) => [...prev.map((el, id) => { return rowId === id ? row : el })]);
    }
    const addAlgebraRow = () => {
        setRows((prev) => [...prev, { geometries: [], operations: [] }]);
    };
    const removeRow = (removeId: number) => () => {
        setRows((prev) => [...prev.filter((el, id) => id !== removeId)]);
    }

    const refreshObjectsList = useCallback(
        () => {
            setAllObjects([...props.editor.scene.children]);
        },
        [props]);

    useEffect(() => {
        refreshObjectsList();
        props.editor.signals.objectAdded.add(refreshObjectsList);
        props.editor.signals.objectRemoved.add(refreshObjectsList);
        return () => {
            props.editor.signals.objectAdded.remove(refreshObjectsList);
            props.editor.signals.objectRemoved.remove(refreshObjectsList);
        }
    }, [props, refreshObjectsList]);

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
        <Button className="parseZoneButton" onClick={()=>parseZone(rows)}>Parse Zone</Button>
    </div>);
}

export default ZoneManagerPanel;
