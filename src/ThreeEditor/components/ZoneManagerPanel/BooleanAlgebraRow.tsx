import { Box, Divider } from '@mui/material';
import React, { Fragment, useEffect, useState } from 'react';
import { Operation } from '../../util/Operation';
import GeometryInput from './GeometryInput';
import OperationInput from './OperationInput';

type BooleanAlgebraRowProps = {
	id: number;
	onGeometrySelect: (id: number) => void;
	handleSwitchOperation: (op: Operation | null) => void;
	value: AlgebraRow;
	possibleObjects: THREE.Object3D[];
};

export type AlgebraRow = {
	geometriesId: (number | null)[];
	operations: (Operation | null)[];
};

export default function BooleanAlgebraRow(props: BooleanAlgebraRowProps) {
	const [algebraRow, setAlgebraRow] = useState<AlgebraRow>(props.value);
	const [scroll, setScroll] = useState(false);

	useEffect(() => {
		console.log('props.value', props.value);
		setAlgebraRow(prev => {
			return props.value ?? { geometriesId: [], operations: [] };
		});
		console.log('algebraRow', algebraRow.geometriesId.length, props.value.geometriesId.length);
		if (algebraRow.geometriesId.length < props.value.geometriesId.length) setScroll(true);
	}, [props.value]);

	useEffect(() => {
		if (scroll) {
			setScroll(false);
		} else {
			console.log('scrolling');
			scrollToBottom();
		}
	}, [scroll]);

	const endRef = React.useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		endRef.current?.scrollIntoView();
	};

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				marginTop: '-36px',
				paddingTop: '12px',
				position: 'relative',
				height: '100%'
			}}>
			{algebraRow.geometriesId.map((geo, id) => {
				return (
					<Box
						key={id}
						sx={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'stretch'
						}}>
						{id > 0 && (
							<>
								<Divider
									orientation='vertical'
									sx={{
										width: '1px',
										height: '36px',
										backgroundColor: 'primary.main',
										margin: '0 auto'
									}}
								/>
								<OperationInput
									id={id - 1}
									switchOperation={op => {
										setAlgebraRow(prev => {
											prev.operations[id - 1] = op;
											props.handleSwitchOperation(op);
											return prev;
										});
										if (algebraRow.operations.length >= id - 1) {
											console.log('scrolling');
											setScroll(true);
										}
									}}
									value={algebraRow.operations[id - 1]}
									canClear={algebraRow.operations.length <= id}
								/>
							</>
						)}
						<GeometryInput
							id={id}
							geometries={props.possibleObjects}
							onClick={() => {
								props.onGeometrySelect(id);
							}}
							value={geo}
						/>
					</Box>
				);
			})}
			{
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'stretch'
					}}>
					{algebraRow.geometriesId.length > 0 && (
						<>
							<Divider
								orientation='vertical'
								sx={{
									width: '1px',
									height: '36px',
									backgroundColor: 'primary.main',
									margin: '0 auto'
								}}
							/>
							<OperationInput
								id={algebraRow.geometriesId.length - 1}
								switchOperation={op => {
									setAlgebraRow(prev => {
										prev.operations[algebraRow.geometriesId.length - 1] = op;
										props.handleSwitchOperation(op);
										return prev;
									});
									if (
										algebraRow.operations.length >=
										algebraRow.geometriesId.length - 1
									) {
										console.log('scrolling');
										setScroll(true);
									}
								}}
								value={
									algebraRow.operations[algebraRow.geometriesId.length - 1] ??
									null
								}
								canClear={
									algebraRow.operations.length <= algebraRow.geometriesId.length
								}
							/>
						</>
					)}
					{algebraRow.geometriesId.length === algebraRow.operations.length && (
						<GeometryInput
							id={algebraRow.geometriesId.length}
							geometries={props.possibleObjects}
							onClick={() => {
								props.onGeometrySelect(algebraRow.geometriesId.length);
							}}
							value={null}
						/>
					)}
				</Box>
			}
			<div ref={endRef} />
		</Box>
	);
}
