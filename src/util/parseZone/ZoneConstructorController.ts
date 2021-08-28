import { Operation } from "../../components/ZoneManagerPanel/BooleanAlgebraRow";

export default class ZoneConstructorController {
    commonPrefix:number[];
    tails:number[][];
    parseOperation(op: Operation, geometry: number){
        switch(op){
            case "intersection":
                this.extendPrefix(geometry);
                break;
            case "left-subtraction":
                this.extendPrefix(-geometry);
                break;
            case "right-subtraction":
                this.shiftTails(geometry);
                console.log(this.commonPrefix, this.tails);
                break;
        }
    }
    extendPrefix(geometry: number){
        this.commonPrefix = [geometry,...this.commonPrefix];
    }
    shiftTails(geometry: number){
        this.tails = [
            ... this.commonPrefix.map(el=>[-el]),
            ... this.tails.reduce((prev, el) => {
                    console.log(
                        "prev array",
                        prev
                    );
                    if(prev.length === 0)
                        return el.map(el2=>[-el2]);
                    return el.reduceRight((prev2, el2) => {
                        return [
                            ...prev2,
                            ...prev.reduceRight(
                                (prev3,el3)=>{
                                    if(el3.indexOf(-el2) !== -1)
                                        return prev3;
                                    return [...prev3,[-el2,...el3]];
                                },[] as number[][]
                            )
                        ];
                    },[] as number[][]);
                },[] as number[][])
        ]
        this.commonPrefix = [geometry];
    }
    toString(){
        let prefix = (this.commonPrefix.reduceRight(
            (prev, el) => {
                return prev + (el > 0 ? "+"+el : el) + " "
            },""
        ) as string);
        return this.tails.reduceRight(
            (prev, el) => {
                return prev + el.reduceRight(
                    (prev1, el1) => {
                        return (el1 > 0 ? "+"+el1 : el1) + " " + prev1;
                    },"" as string
                ) + prefix + "OR "
            },
            ""
        ) + (this.tails.length === 0 ? prefix + " OR" : "");
    }
    constructor(prefix: number[], tails: number[][]) {
        this.commonPrefix = prefix;
        this.tails = tails;
    }
}