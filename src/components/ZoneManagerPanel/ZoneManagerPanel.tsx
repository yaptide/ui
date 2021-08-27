import { Button } from "@material-ui/core";
import { useState } from "react";
import { parseZone } from "../../util/parseZone/parseZone";
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
    let removeRow = (removeId:number) => () => {
        if(rows.length === 1)
            setRows([{geometries:[],operations:[]}]);
        else
            setRows((prev)=> [...prev.filter((el, id) => id !== removeId)]);
    }
    return (<div className="zoneManagerWrapper">
        {rows.map((row ,id) => {
            return (<BooleanAlgebraRow 
                id={id} 
                key={id}
                del={removeRow(id)} 
                change={changeRowValues(id)}
                value={row}
            ></BooleanAlgebraRow>)
        })}
        <Button className="addRowButton" onClick={addAlgebraRow}>+</Button>
        <Button className="parseZoneButton" onClick={()=>parseZone(rows)}>Parse Zone</Button>
    </div>);
}

export default ZoneManagerPanel;