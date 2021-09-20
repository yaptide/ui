import { MenuItem, Select } from "@material-ui/core";
import { useState,useEffect } from "react";

type GeometryInputProps = {
    id: number,
    geometries: THREE.Object3D[],
    push: (uuid: number) => void
    value?: number | null;
}


function GeometryInput(props: GeometryInputProps) {
    const [selected, setSelected] = useState(props?.value ?? 0);

    const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setSelected(event.target.value as number);
        props.push(event.target.value as number);
    };
    useEffect(() => {
        setSelected(props.value ?? 0);
    }, [props, props.value]);

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
            {props.geometries.map((geo, index) => {
                return (<MenuItem key={geo.id} value={geo.id}>{geo.name}:{geo.id}</MenuItem>)
            })}
        </Select>
    )
}
export default GeometryInput;
