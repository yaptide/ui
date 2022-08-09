import { castTo, Common } from "./Types";


export const orderAccordingToList = <A, B, C extends Common<A, B>>(list: A[], orderList: B[], property: keyof C) => {

    const listCopy = [...list];
    const listOrdered = [];

    for (const orderElement of orderList) {
        const index = listCopy.findIndex(
            obj => castTo<C>(obj)[property] === castTo<C>(orderElement)[property]
        );

        if (index === -1) {
            console.warn(`OrderElement ${castTo<C>(orderElement)[property]} not found`);
            continue;
        }

        listOrdered.push(listCopy[index]);
        listCopy.splice(index, 1);
    }

    return listOrdered;

}