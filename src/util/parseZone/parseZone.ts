import { AlgebraRow } from "../../components/ZoneManagerPanel/BooleanAlgebraRow";

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
    let result:number[][] = [];
    if(zoneOperationRow.geometries?.[0]){
        result.push([zoneOperationRow.geometries[0]])
        zoneOperationRow.operations.every((op,id)=>{
            let nextGeo: number;
            if(!zoneOperationRow.geometries?.[id+1])
                return false;
            else
                nextGeo = zoneOperationRow.geometries?.[id+1] as number;
            switch(op){
                case "intersection":
                    result = result.map(el => [...el,nextGeo]);
                    break;
                case "left-subtraction":
                    result = result.map(el => [...el,-nextGeo]);
                    break;
                case "right-subtraction":
                    result = parseRightSubtraction(result, nextGeo);
                    break;
                default:
                    break;

            }
            return true;
        })
    }
    return result;
}
function parseZone(zoneOperationRows:AlgebraRow[]){
    console.log(zoneOperationRows);
    let result: number[][] = [];
    zoneOperationRows.forEach(el=>{result = result.concat(parseRow(el))});
    consoleLogZone(result);
}
function consoleLogZone(result:number[][]){
    let zone:string = result.reduce( (prev, el1) => {
        return prev + el1.reduce((prev, el2) => {
            return prev + (el2>0 ? "+"+el2 : el2) + " "
        }," ") + "OR"
    },"")
    zone = zone.slice(0,zone.length-3);
    console.log(zone);
}

export { parseZone };
