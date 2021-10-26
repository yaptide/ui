import { Button } from "@mui/material";
import React from "react";
import { Fragment, useEffect, useState } from "react";
import { Operation } from "../../util/Operation";
import GeometryInput from "./GeometryInput";
import OperationInput from "./OperationInput";

type BooleanAlgebraRowProps = {
    id: number,
    del: () => void,
    change: (row: AlgebraRow) => void,
    value?: AlgebraRow,
    possibleObjects: THREE.Object3D[]
}

export type AlgebraRow = {
    geometriesId: (number | null)[],
    operations: (Operation | null)[]
}

export default function BooleanAlgebraRow(props: BooleanAlgebraRowProps) {
    const [algebraRow, setAlgebraRow] = useState<AlgebraRow>(props.value ?? { geometriesId: [], operations: [] });

    const pushGeometry = (index: number) => (id: number) => {
        setAlgebraRow((prev) => {
            let newRow: AlgebraRow = { geometriesId: [...prev.geometriesId], operations: prev.operations };

            newRow.geometriesId.splice(index, 1, id);

            props.change(newRow);

            return newRow;
        })
    }

    const pushOperation = (index: number) => (op: Operation) => {
        setAlgebraRow((prev) => {
            let newRow: AlgebraRow = { geometriesId: prev.geometriesId, operations: [...prev.operations] };

            newRow.operations.splice(index, 1, op);

            if (index < newRow.geometriesId.length - 1)
                props.change(newRow);

            return newRow;
        })
    }

    const removeOperation = (id: number) => () => {
        setAlgebraRow((prev) => {
            let newRow: AlgebraRow = {
                geometriesId: [
                    ...prev.geometriesId.slice(0, id + 1)
                ],
                operations: [
                    ...prev.operations.slice(0, id)
                ]
            };

            props.change(newRow);

            return newRow;
        })
    }


    useEffect(() => {
        setAlgebraRow(props.value ?? { geometriesId: [], operations: [] });
    }, [props.value]);



    return (<div className="zoneManagerRow">{algebraRow.geometriesId.map((geo, id) => {

        return (<Fragment key={id} >
            <GeometryInput
                id={id}
                geometries={props.possibleObjects}
                push={pushGeometry(id)}
                value={geo}
            />
            <OperationInput
                id={id}
                push={pushOperation(id)}
                pop={removeOperation(id)}
                value={algebraRow.operations?.[id]}
                canClear={algebraRow.operations.length <= id + 1}
            />
        </Fragment>)
    })}
        {algebraRow.operations.length === algebraRow.geometriesId.length &&
            (<GeometryInput
                id={algebraRow.geometriesId.length}
                geometries={props.possibleObjects}
                push={pushGeometry(algebraRow.geometriesId.length)}
            />)
        }
        <Button className="deleteButton" onClick={props.del}>X</Button>
    </div>)
}
