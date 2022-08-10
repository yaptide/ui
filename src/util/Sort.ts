import { Common } from "./Types";


export const orderAccordingToList = <A extends C, B extends C, C extends Common<A, B>>(list: A[], orderList: B[], property: keyof C) => {

    const listCopy = [...list];
    const listOrdered = [];

    for (const orderElement of orderList) {
        const index = listCopy.findIndex(
            obj => obj[property] === orderElement[property]
        );

        if (index === -1) {
            console.warn(`OrderElement ${orderElement[property]} not found`);
            continue;
        }

        listOrdered.push(listCopy[index]);
        listCopy.splice(index, 1);
    }

    return listOrdered;

}