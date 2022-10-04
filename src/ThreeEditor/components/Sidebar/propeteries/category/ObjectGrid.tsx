import { Object3D } from 'three';
import { Editor } from '../../../../js/Editor';
import {
	NumberPropertyField} from '../PropertyField';
import { PropertiesCategory } from './PropertiesCategory';

export function ObjectGrid(props: { editor: Editor; object: Object3D }) {
	const { object, editor } = props;

	return (
		<PropertiesCategory category='Grid'>
			<NumberPropertyField
				label='number of bins along X axis'
				value={object.scale.x}
				onChange={function (value: number): void {
					throw new Error('Function not implemented.');
				}}
			/>
			<NumberPropertyField
				label='number of bins along Y axis'
				value={object.scale.x}
				onChange={function (value: number): void {
					throw new Error('Function not implemented.');
				}}
			/>
			<NumberPropertyField
				label='number of bins along Z axis'
				value={object.scale.x}
				onChange={function (value: number): void {
					throw new Error('Function not implemented.');
				}}
			/>
		</PropertiesCategory>
	);
}
