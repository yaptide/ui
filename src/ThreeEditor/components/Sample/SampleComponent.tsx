import React, { useCallback, useEffect, useState } from 'react';
import { Signal } from 'signals';
import './SampleComponent.css';
import * as THREE from 'three';

interface SampleComponentProps {
	signal: Signal;
}

function SampleComponent(props: SampleComponentProps) {
	const [objectName, setObjectName] = useState<string | undefined>();
	const [objectID, setObjectID] = useState<number | undefined>();

	const objectSelected = useCallback((object: THREE.Object3D) => {
		setObjectName(object?.name);
		setObjectID(object?.id);
	}, []);

	useEffect(() => {
		props.signal.add(objectSelected);
		return () => {
			props.signal.remove(objectSelected);
		};
	}, [objectSelected, props.signal]);

	return (
		<div className='SampleComponent'>
			Selected Name:{objectName}
			<br></br>
			Selected ID:{objectID}
		</div>
	);
}

export default SampleComponent;
