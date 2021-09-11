import { AlgebraRow } from "../../components/ZoneManagerPanel/BooleanAlgebraRow";
import ZoneConstructorController from "./ZoneConstructorController";

function parseRightSubtraction(result:number[][], nextGeo:number){
    let groupSections: Record<string,number[]> = {};
    let keys: string[] = [];
    let newResult = result.reduce((prev:number[][], el)=>{
        let next = prev;
        let elResult:number[][] = [];
        let key = el.filter(el => el > 0).sort( (a,b) => a - b);
        keys.push(JSON.stringify(key))
        let value = el.filter(el => el < 0).sort( (a,b) => a - b);
        let oldValue = groupSections[JSON.stringify(key)]??[];
        groupSections[JSON.stringify(key)] = [...value,...oldValue].filter((el, index, array) => {
            return array.indexOf(el) === index;
        });
        key.forEach(el=>{
            elResult.push([nextGeo, -el]);
        })
        elResult.forEach(res => {
            if(next.every(el=>!el.every((e,i)=>e===res[i])))
                next.push(res);
        })
        return next;
    },[])
    keys.forEach(key => {
        let keyResult = [nextGeo, ...groupSections[key].map(e => -e)];
        if(newResult.every(el=>!el.every((e,i)=>e===keyResult[i])))
            newResult.push(keyResult);
    })
    return newResult;
}

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

