import { AlgebraRow } from "../../components/ZoneManagerPanel/BooleanAlgebraRow";
import ZoneConstructorController from "./ZoneConstructorController";

function parseRow(zoneOperationRow:AlgebraRow){
    let controller:ZoneConstructorController;
    if(zoneOperationRow.geometries?.[0]){
        controller = new ZoneConstructorController([zoneOperationRow.geometries[0]],[])
        zoneOperationRow.operations.every((op,id)=>{
            let nextGeo: number;
            if(!zoneOperationRow.geometries?.[id+1] || !op)
                return false;
            else{
                nextGeo = zoneOperationRow.geometries?.[id+1] as number;
                controller.parseOperation(op,nextGeo);
                // console.log(controller.toString().slice(0,-3));
            }
            return true;
        });
        return controller.toString();
    }
    return "";
}
function parseZone(zoneOperationRows:AlgebraRow[]){
    console.log(zoneOperationRows);
    let result: string = "";
    zoneOperationRows.forEach(el=>{result = result.concat(parseRow(el)+" OR")});
    console.log(result.slice(0,-3));
}

export { parseZone };

