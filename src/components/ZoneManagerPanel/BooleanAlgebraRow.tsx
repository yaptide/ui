import { Button } from "@material-ui/core";
import React from "react";
import { useCallback, useEffect, useState } from "react";
import GeometryInput from "./GeometryInput";
import OperationInput from "./OperationInput";

type BooleanAlgebraRowProps = {
    id: number,
    del: () => void,
    change: (row: AlgebraRow) => void,
    value?: AlgebraRow,
    possibleObjects: THREE.Object3D[]
}

export type Operation = "intersection" | "left-subtraction" | "right-subtraction";

export type AlgebraRow = {
    geometries: (number | null)[],
    operations: (Operation | null)[]
}


function BooleanAlgebraRow(props: BooleanAlgebraRowProps) {
    const [algebraRow, setAlgebraRow] = useState<AlgebraRow>(props.value ?? { geometries: [], operations: [] });

    const pushGeometry = (index: number) => (id: number) => {
        if (index === algebraRow.geometries.length)
            setAlgebraRow((prev) => {
                return {
                    geometries: [
                        ...prev.geometries,
                        props.possibleObjects.find(el => el.id === id)?.id ?? null
                    ],
                    operations: prev.operations
                }
            })
        else
            setAlgebraRow((prev) => {
                return {
                    geometries: [
                        ...prev.geometries.map((el, elIndex) => {
                            return index === elIndex ? id : el
                        }),
                    ],
                    operations: prev.operations
                }
            })
    }
    const removeOperation = (id: number) => () => {
        setAlgebraRow((prev) => {
            return {
                geometries: [
                    ...prev.geometries.slice(0, id + 1)
                ],
                operations: [
                    ...prev.operations.slice(0, id)
                ]
            }
        })
    }

    useEffect(() => {
        props.change(algebraRow);
    }, [algebraRow]);

    useEffect(() => {
        setAlgebraRow(props.value ?? { geometries: [], operations: [] });
    }, [props]);
    
    const pushOperation = (id: number) => (op: Operation) => {
        if (id === algebraRow.operations.length)
            setAlgebraRow((prev) => {
                return {
                    geometries: prev.geometries,
                    operations: [
                        ...prev.operations,
                        op
                    ]
                }
            })
        else
            setAlgebraRow((prev) => {
                return {
                    geometries: prev.geometries,
                    operations: [
                        ...prev.operations.map((el, index) => {
                            return index === id ? op : el
                        }),
                    ]
                }
            })
    }
    return (<div className="zoneManagerRow">{algebraRow.geometries.map((geo, id) => {

        return (<React.Fragment key={id} >
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
                last={algebraRow.operations.length <= id + 1}
            />
        </React.Fragment>)
    })}
        {algebraRow.operations.length === algebraRow.geometries.length &&
            (<GeometryInput
                id={algebraRow.geometries.length}
                geometries={props.possibleObjects}
                push={pushGeometry(algebraRow.geometries.length)}
            />)
        }
        <Button className="deleteButton" onClick={props.del}>X</Button>
    </div>)
}

export default BooleanAlgebraRow;
