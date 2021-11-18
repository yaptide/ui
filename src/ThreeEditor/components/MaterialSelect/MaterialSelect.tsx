import { Autocomplete, Popper, TextField } from "@mui/material";
import React from "react";
import { COMMON_MATERIALS_ID } from "../../util/Materials/materials";
import SimulationMaterial from "../../util/Materials/SimulationMaterial";

export interface MaterialSelectProps {
    onChange?: (event: React.SyntheticEvent<Element, Event>, newValue: string | null) => void,
    materials: Record<string, SimulationMaterial>
    value?: string
}

const isCommonMaterial = (mat: SimulationMaterial) => COMMON_MATERIALS_ID.includes(mat.simulationData.id);

const commonCompare = (a: SimulationMaterial, b: SimulationMaterial): number => {
    const [aId, bId] = [a.simulationData.id, b.simulationData.id].map(e => parseInt(e));
    if (isCommonMaterial(a) === isCommonMaterial(b)) {
        return aId - bId;
    } else if (isCommonMaterial(b)) 
        return 1;
    return -1;
}

export function MaterialSelect(props: MaterialSelectProps) {

    return (
        <Autocomplete
            fullWidth
            size="small"
            onChange={(event, newValue) => {
                props.onChange?.call(null, event, newValue.simulationData.name);
            }}
            disableClearable
            value={props.materials[props.value ?? '']}
            options={Object.values(props.materials).sort(commonCompare)}
            groupBy={(option) => isCommonMaterial(option) ? 'Common' : 'Other'}
            getOptionLabel={(option) => `[${option.simulationData.id}] ${option.simulationData.name}`}

            sx={{ width: '100%' }}
            PopperComponent={(popperProps) => <Popper {...popperProps} style={{ width: 'fit-content' }} placement="bottom-start" />}
            ListboxProps={{ style: { fontSize: '12px', width: 'fit-content' } }}
            renderInput={(params) => <TextField {...params} InputProps={{ ...params?.InputProps, style: { fontSize: '12px' } }} size="small" variant="standard" />}
        />
    );
}