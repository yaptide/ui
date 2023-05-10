import { Operation, OperationDataList } from '../../../../types/Operation';

export class BooleanAlgebraData {
	value: OperationDataList;

	constructor(objectId: number | null = null) {
		this.value = [{ operation: 'union', objectId }];
	}

	changeOperation(index: number, operation: Operation | null) {
		if (index === 0) {
			console.error(
				'Cannot change operation of first element of boolean algebra:',
				`${this.value[index].operation} -> ${operation}}`
			);
			return false;
		}
		if (this.value[index - 1].objectId === null) {
			console.error(
				'Cannot change operation of element of boolean algebra with null objectId:',
				`(${this.value[index - 1].operation}, ${this.value[index - 1].objectId})[${
					index - 1
				}]: ${operation}}`
			);
			return false;
		}

		if (operation === null) this.value.splice(index);
		else {
			const indexValue = this.value[index];

			if (indexValue) indexValue.operation = operation;
			else this.value.push({ operation, objectId: null });
		}

		this.value = [...this.value];
		return true;
	}

	changeObjectId(index: number, objectId: number | null) {
		if (objectId === null) this.value.splice(index + 1);

		const indexValue = this.value[index];

		if (indexValue && indexValue.operation) indexValue.objectId = objectId;
		else {
			console.error(
				'Cannot change objectId of element of boolean algebra with null operation:',
				`(${this.value[index].operation},null -> ${objectId})[${index}]`
			);
			return false;
		}

		this.value = [...this.value];
		return true;
	}

	toString() {
		return JSON.stringify(this.value);
	}

	static fromValue(value: OperationDataList) {
		const data = new BooleanAlgebraData();

		data.value = value;

		if (data.value.length === 0) data.value.push({ operation: 'union', objectId: null });

		return data;
	}
}
