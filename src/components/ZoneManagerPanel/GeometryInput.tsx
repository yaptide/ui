import { MenuItem, Select } from "@material-ui/core";
import { useState } from "react";
type GeometryInputProps = {
    id: number,
    geometries: Geometry[],
    push: (geoId: number) => void
    value?: number | null;
}
type Geometry = {
    id: number,
    name: string,
}

function GeometryInput(props: GeometryInputProps) {
    let [selected, setSelected] = useState(props?.value ?? 0);
    let handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setSelected(event.target.value as number);
        props.push(event.target.value as number)
    };
    return (
        <Select
            labelId={"GeometryLabel" + props.id}
            id={"GeometryInput" + props.id} label={props.id}
            className="geometrySelect"
            displayEmpty
            value={selected}
            onChange={handleChange}
        >
            <MenuItem disabled value={0}>
                <em>Geometry</em>
            </MenuItem>
            {props.geometries.map((geo, id) => {
                return (<MenuItem key={geo.id} value={geo.id}>{geo.name}</MenuItem>)
            })}
        </Select>
    )
}
export default GeometryInput;