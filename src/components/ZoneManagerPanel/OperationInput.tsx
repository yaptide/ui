import { MenuItem, Select } from "@material-ui/core";
import { useState } from "react";

type OperationInputProps = {
    id: number,
    push: (op:Operation) => void,
    pop: () => void,
    value?: Operation|null,
    last?: boolean,
}
type Operation = "intersection" | "left-subtraction" | "right-subtraction" 


function OperationInput(props: OperationInputProps) {
    let [selected, setSelected] = useState<Operation|"">(props?.value??"");
    let handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setSelected(event.target.value as (""|Operation));
        if(event.target.value as string !== "")
            props.push(event.target.value as Operation)
        else
            props.pop();
    };
    return (<Select 
        id={"OperationInput"+props.id} 
        label={props.id} 
        className="operationSelect"
        value={selected}
        onChange={handleChange}
    >
        <MenuItem disabled value={0}>
            <em>Operation</em>
        </MenuItem>
        {props.last && (<MenuItem value={""}>
            X
        </MenuItem>)}
        <MenuItem value={"left-subtraction"}><img src="./images/L.png" alt="left subtraction"/></MenuItem>
        <MenuItem value={"intersection"}><img src="./images/S.png" alt="intersection"/></MenuItem>
        <MenuItem value={"right-subtraction"}><img src="./images/R.png" alt="right subtraction"/></MenuItem>
    </Select>)
}
export default OperationInput;