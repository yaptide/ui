import { MenuItem, Select } from "@material-ui/core";
import { useState } from "react";
type GeometryInputProps = {
    id: number,
    geometries: THREE.Object3D[],
    push: (uuid: string) => void
    value?: string | null;
}


function GeometryInput(props: GeometryInputProps) {
    let [selected, setSelected] = useState(props?.value ?? 0);

    let handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setSelected(event.target.value as string);
        props.push(event.target.value as string)
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
                return (<MenuItem value={geo.uuid}>{geo.name}</MenuItem>)
            })}
        </Select>
    )
}
export default GeometryInput;