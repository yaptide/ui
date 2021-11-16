import { Autocomplete, Popper, TextField } from "@mui/material";
import React from "react";

export interface MaterialSelectProps {
    onChange?: (event: any, newValue: string | null) => void,
    options?: any
    value?: string
}

export function MaterialSelect(props: MaterialSelectProps) {
    return (
        <Autocomplete
            fullWidth
            size="small"
            onChange={(event: any, newValue: string | null) => {
                props.onChange?.call(null, event, newValue);
            }}
            disableClearable
            value={props.value}
            options={props.options}
            sx={{ width: '100%' }}
            PopperComponent={(popperProps) => <Popper {...popperProps} style={{ width: 'fit-content' }} placement="bottom-start" />}
            ListboxProps={{ style: { fontSize: '12px', width: 'fit-content' } }}
            renderInput={(params) => <TextField {...params} InputProps={{ ...params?.InputProps, style: { fontSize: '12px' } }} size="small" variant="standard" />}
        />
    );
}