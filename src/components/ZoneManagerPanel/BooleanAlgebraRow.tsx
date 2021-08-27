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
}
type Operation = "intersection" | "left-subtraction" | "right-subtraction"
type AlgebraRow = {
    geometries: (number | null)[],
    operations: (Operation | null)[]
}
type Geometry = {
    id: number,
    name: string,
}

function BooleanAlgebraRow(props: BooleanAlgebraRowProps) {
    let [algebraRow, setAlgebraRow] = useState<AlgebraRow>(props.value ?? { geometries: [], operations: [] });
    let possibleGeometries: Geometry[] = [{ id: 1, name: "cube1" }, { id: 2, name: "cube2" }, { id: 3, name: "cube3" }, { id: 4, name: "cube4" }, { id: 5, name: "cube5" }, { id: 6, name: "cube6" }];

    let changeGeometry = useCallback((row: AlgebraRow) => {
        props.change(row);
    }, [props.change])
    useEffect(() => {
        changeGeometry(algebraRow);
    }, [algebraRow])
    useEffect(() => {
        setAlgebraRow(props.value ?? { geometries: [], operations: [] });
    }, [props])

    let pushGeometry = (id: number) => (geoId: number) => {
        if (id === algebraRow.geometries.length)
            setAlgebraRow((prev) => {
                return {
                    geometries: [
                        ...prev.geometries,
                        possibleGeometries.find(el => el.id === geoId)?.id ?? null
                    ],
                    operations: prev.operations
                }
            })
        else
            setAlgebraRow((prev) => {
                return {
                    geometries: [
                        ...prev.geometries.map((el, index) => {
                            return index === id ? geoId : el
                        }),
                    ],
                    operations: prev.operations
                }
            })
    }
    let removeOperation = (id: number) => () => {
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
    let pushOperation = (id: number) => (op: Operation) => {
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
                geometries={possibleGeometries}
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
        {algebraRow.operations.length >= algebraRow.geometries.length &&
            (<GeometryInput
                id={algebraRow.geometries.length}
                geometries={possibleGeometries}
                push={pushGeometry(algebraRow.geometries.length)}
            />)
        }
        <Button className="deleteButton" onClick={props.del}>X</Button>
    </div>)
}

export default BooleanAlgebraRow;