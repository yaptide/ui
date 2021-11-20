import { Operation } from '../../ThreeEditor/util/Operation';

export default class ZoneConstructorController {
	commonPrefix: number[];
	tails: number[][];

	parseOperation(op: Operation, geometry: number): void {
		switch (op) {
			case 'intersection':
				this.extendPrefix(geometry);
				break;
			case 'left-subtraction':
				this.extendPrefix(-geometry);
				break;
			case 'right-subtraction':
				this.shiftTails(geometry);
				break;
		}
	}

	extendPrefix(geometry: number): void {
		this.commonPrefix = [geometry, ...this.commonPrefix];
	}

	shiftTails(geometry: number): void {
		this.tails = [
			...this.commonPrefix.map(el => [-el]),
			...this.tails.reduce((prev, el) => {
				if (prev.length === 0) return el.map(el2 => [-el2]);
				return el.reduceRight((prev2, el2) => {
					return [
						...prev2,
						...prev.reduceRight((prev3, el3) => {
							if (el3.indexOf(-el2) !== -1) return prev3;
							return [...prev3, [...el3, -el2]];
						}, [] as number[][])
					];
				}, [] as number[][]);
			}, [] as number[][])
		];
		this.commonPrefix = [geometry];
	}

	toString(): string {
		const prefix = this.commonPrefix.reduceRight((prev, el) => {
			return prev + (el > 0 ? '+' + el : el) + ' ';
		}, '') as string;
		return (
			this.tails.reduceRight((prev, el) => {
				return (
					prev +
					el.reduce((prev1, el1) => {
						return (el1 > 0 ? '+' + el1 : el1) + ' ' + prev1;
					}, '' as string) +
					prefix +
					'OR '
				);
			}, '') + (this.tails.length === 0 ? prefix + ' OR' : '')
		).slice(0, -4);
	}

	getDimension = (target: any): number => {
		if (!Array.isArray(target)) {
			return target === null ? -1 : 0;
		} else {
			let dim = -1;
			target.every(el => {
				dim = this.getDimension(el);
				return dim === -1;
			});
			return dim === -1 ? dim : dim + 1;
		}
	};

	constructor(prefix?: number[] | number, tails?: number[][] | number[] | number) {
		if (Number.isInteger(prefix) || prefix)
			switch (this.getDimension(prefix)) {
				case 0:
					this.commonPrefix = [prefix as number];
					break;
				case 1:
					this.commonPrefix = prefix as number[];
					break;
				default:
					this.commonPrefix = [];
			}
		else this.commonPrefix = [];

		if (Number.isInteger(tails) || tails)
			switch (this.getDimension(tails)) {
				case 0:
					this.tails = [[tails as number]];
					break;
				case 1:
					this.tails = [tails as number[]];
					break;
				case 2:
					this.tails = tails as number[][];
					break;
				default:
					this.tails = [];
			}
		else this.tails = [];
	}
}
