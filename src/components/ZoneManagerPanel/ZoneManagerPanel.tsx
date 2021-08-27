import { Button } from "@material-ui/core";
import { useState } from "react";
import BooleanAlgebraRow from "./BooleanAlgebraRow";
import "./zoneManagerPanel.css";
type Operation = "intersection" | "left-subtraction" | "right-subtraction" 
type AlgebraRow = {
    geometries: (number|null)[],
    operations: (Operation|null)[]
}

function ZoneManagerPanel() {
    let [rows, setRows] = useState<AlgebraRow[]>([{geometries:[],operations:[]}]);
    let changeRowValues = (rowId:number) => (row:AlgebraRow) => {
        setRows((prev) => [...prev.map((el, id)=> {return rowId === id ? row : el})]);
    } 
    let addAlgebraRow = () => {
        setRows((prev) => [...prev,{geometries:[],operations:[]}]);
    };
    let parseZone = () => {

    }
    let removeRow = (removeId:number) => () => {
        setRows((prev)=> [...prev.filter((el, id) => id != removeId)]);
    }
    console.log(rows);
    return (<div className="zoneManagerWrapper">
        {rows.map((row ,id) => {
            return (<BooleanAlgebraRow 
                id={id} 
                del={removeRow(id)} 
                change={changeRowValues(id)}
                value={row}
            ></BooleanAlgebraRow>)
        })}
        <Button className="addRowButton" onClick={addAlgebraRow}>+</Button>
        <Button className="parseZoneButton" onClick={() => parseZone()}>Parse Zone</Button>
    </div>);
}

export default ZoneManagerPanel;