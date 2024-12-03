import { Common } from './Types';

export const orderAccordingToList = <A extends C, B extends C, C extends Common<A, B>>(
	list: A[],
	orderList: B[],
	property: keyof C,
	foundCallback?: (listElement: A, orderListElement: B) => void
) => {
	const listCopy = [...list];
	const listOrdered = [];
	const orderPredicate = (orderEl: C) => (obj: C) => obj[property] === orderEl[property];

	for (const orderElement of orderList) {
		const index = listCopy.findIndex(orderPredicate(orderElement));

		if (index === -1) {
			continue;
		}

		foundCallback?.call(null, listCopy[index], orderElement);

		listOrdered.push(listCopy[index]);
		listCopy.splice(index, 1);
	}

	if (listCopy.length > 0) {
		console.warn(`${listCopy.length} elements not found in orderList`);
	}

	return [...listOrdered, ...listCopy];
};
