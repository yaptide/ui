import { useState } from 'react';

// function useDualArray<T, U>(initialValue1: T[] = [], initialValue2: U[] = []) {
// 	const [array1, setArray1] = useState<T[]>(initialValue1);
// 	const [array2, setArray2] = useState<U[]>(initialValue2);

// 	function isValue1(value: T | U): value is T {
// 		return typeof value ===
// 	}

// 	function isValue2(value: T | U): value is U {
// 		return array2.includes(value as U);
// 	}

// 	const push = <W extends T | U>(value: W, index?: number) => {
// 		if (isValue1(value)) {
// 			setArray1(genericPush<T>(value, index));
// 		} else if (isValue2(value)) {
// 			setArray2(genericPush<U>(value, index));
// 		}
// 	};

//     const pop = <W extends T | U>() => {
//         // if W is T, then pop array1 and return it else pop array2 and return it
//         return isValue1((null as unknown) as W) ? setArray1(prev => prev.slice(0, -1)) : setArray2(prev => prev.slice(0, -1));
// }

type DualArrayValue<T, U> = {
	geometryIds: T[];
	operations: U[];
};

type DualArrayPush<T, U> = {
	geometryIds: (value: T, index?: number) => void;
	operations: (value: U, index?: number) => void;
};

type DualArrayPop<T, U> = {
	geometryIds: () => void;
	operations: () => void;
};

class DualArray<T, U> {
	values: DualArrayValue<T, U> = {
		geometryIds: [],
		operations: []
	};
	push: DualArrayPush<T, U>;
	pop: DualArrayPop<T, U>;

	constructor(array1: T[] = [], array2: U[] = []) {
		this.values['geometryIds'] = array1;
		this.values['operations'] = array2;
		this.push = {
			geometryIds: (value: T, index?: number) => {
				const newValues = this.values['geometryIds'].slice();
				if (index !== undefined) {
					newValues.splice(index, 0, value);
				} else {
					newValues.push(value);
				}
				this.values['geometryIds'] = newValues;
			},
			operations: (value: U, index?: number) => {
				const newValues = this.values['operations'].slice();
				if (index !== undefined) {
					newValues.splice(index, 0, value);
				} else {
					newValues.push(value);
				}
				this.values['operations'] = newValues;
			}
		};
		this.pop = {
			geometryIds: () => {
				this.values['geometryIds'].pop();
			},
			operations: () => {
				this.values['operations'].pop();
			}
		};
	}
}
