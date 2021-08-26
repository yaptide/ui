import { Button } from "@material-ui/core";
import { useCallback, useState } from "react";
import BooleanAlgebraRow from "./BooleanAlgebraRow";
type Operation = "intersection" | "left-subtraction" | "right-subtraction" 
type AlgebraRow = {
    geometries: number[],
    operations: Operation[]
}

function ZoneManagerPanel() {
    let [rows, setRows] = useState<AlgebraRow[]>([]);
    let addAlgebraRow = () => {
        setRows((prev) => [...prev,{geometries:[],operations:[]}]);
    };

    return (<div style={{position: "absolute", width: 760, height: 480, top: 0, left: 480, background: "white", border: "2px solid black"}}>
        {rows.map((row ,id) => {
            return (<BooleanAlgebraRow id={id} ></BooleanAlgebraRow>)
        })}
        <Button onClick={() => addAlgebraRow()}>+</Button>
    </div>);
}

export default ZoneManagerPanel;