import { Button } from "@material-ui/core";
import React from "react";
import { Fragment, useEffect, useState } from "react";
import { Operation } from "../../ThreeEditor/util/Operation";
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
            let newRow: AlgebraRow = { geometriesId: [], operations: prev.operations };

            if (index === algebraRow.geometriesId.length) {
                newRow.geometriesId = [
                    ...prev.geometriesId,
                    props.possibleObjects.find(el => el.id === id)?.id ?? null
                ];
            } else {
                newRow.geometriesId = [
                    ...prev.geometriesId.map((el, elIndex) => {
                        return index === elIndex ? id : el
                    }),
                ];
            }

            props.change(newRow);

            return newRow;
        })
    }

    const pushOperation = (id: number) => (op: Operation) => {
        setAlgebraRow((prev) => {
            let newRow: AlgebraRow = { geometriesId: prev.geometriesId, operations: [] };

            if (id === algebraRow.operations.length) {
                newRow.operations = [
                    ...prev.operations,
                    op
                ];
            } else {
                newRow.operations = [
                    ...prev.operations.map((el, index) => {
                        return index === id ? op : el
                    }),
                ];
            }

            // do not inform about change of state 

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
