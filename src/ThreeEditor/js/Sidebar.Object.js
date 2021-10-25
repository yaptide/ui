import * as THREE from 'three';
import { SetColorCommand, SetPositionCommand, SetRotationCommand, SetScaleCommand, SetValueCommand } from './commands/Commands';
import { UICheckbox, UIColor, UIInput, UIInteger, UINumber, UIPanel, UIRow, UIText, UITextArea } from './libs/ui.js';
import { UIBoolean } from './libs/ui.three.js';

function SidebarObject(editor) {

	const { signals, strings } = editor;

	let container = new UIPanel();
	container.setBorderTop('0');
	container.setPaddingTop('20px');
	container.setDisplay('none');

	// type

	let objectTypeRow = new UIRow();
	let objectType = new UIText();

	objectTypeRow.add(new UIText(strings.getKey('sidebar/object/type')).setWidth('90px'));
	objectTypeRow.add(objectType);

	container.add(objectTypeRow);

	// id 

	let objectIdRow = new UIRow();
	let objectId = new UIText();

	objectIdRow.add(new UIText('Id').setWidth('90px'));
	objectIdRow.add(objectId);

	container.add(objectIdRow);

	// uuid 

	let objectUuidRow = new UIRow();
	let objectUuid = new UIText().setWidth('150px');

	objectUuidRow.add(new UIText('Uuid').setWidth('90px'));
	objectUuidRow.add(objectUuid);

	container.add(objectUuidRow);

	// name

	let objectNameRow = new UIRow();
	
	let objectName = new UIInput().setWidth('150px').setFontSize('12px').onChange(() => {

		editor.execute(new SetValueCommand(editor, editor.selected, 'name', objectName.getValue()));

	});

	objectNameRow.add(new UIText(strings.getKey('sidebar/object/name')).setWidth('90px'));
	objectNameRow.add(objectName);

	container.add(objectNameRow);

	// position

	let objectPositionRow = new UIRow();
	let objectPositionX = new UINumber().setPrecision(3).setWidth('50px').onChange(update);
	let objectPositionY = new UINumber().setPrecision(3).setWidth('50px').onChange(update);
	let objectPositionZ = new UINumber().setPrecision(3).setWidth('50px').onChange(update);

	objectPositionRow.add(new UIText(strings.getKey('sidebar/object/position') + ' ' + editor.unit.name).setWidth('90px'));
	objectPositionRow.add(objectPositionX, objectPositionY, objectPositionZ);

	container.add(objectPositionRow);

	// rotation

	let objectRotationRow = new UIRow();
	let objectRotationX = new UINumber().setStep(10).setNudge(0.1).setUnit('°').setWidth('50px').onChange(update);
	let objectRotationY = new UINumber().setStep(10).setNudge(0.1).setUnit('°').setWidth('50px').onChange(update);
	let objectRotationZ = new UINumber().setStep(10).setNudge(0.1).setUnit('°').setWidth('50px').onChange(update);

	objectRotationRow.add(new UIText(strings.getKey('sidebar/object/rotation')).setWidth('90px'));
	objectRotationRow.add(objectRotationX, objectRotationY, objectRotationZ);

	container.add(objectRotationRow);

	// scale

	let objectScaleRow = new UIRow();
	let objectScaleX = new UINumber(1).setPrecision(3).setWidth('50px').onChange(update);
	let objectScaleY = new UINumber(1).setPrecision(3).setWidth('50px').onChange(update);
	let objectScaleZ = new UINumber(1).setPrecision(3).setWidth('50px').onChange(update);

	objectScaleRow.add(new UIText(strings.getKey('sidebar/object/scale')).setWidth('90px'));
	objectScaleRow.add(objectScaleX, objectScaleY, objectScaleZ);

	container.add(objectScaleRow);

	// fov

	let objectFovRow = new UIRow();
	let objectFov = new UINumber().onChange(update);

	objectFovRow.add(new UIText(strings.getKey('sidebar/object/fov')).setWidth('90px'));
	objectFovRow.add(objectFov);

	container.add(objectFovRow);

	// left

	let objectLeftRow = new UIRow();
	let objectLeft = new UINumber().onChange(update);

	objectLeftRow.add(new UIText(strings.getKey('sidebar/object/left')).setWidth('90px'));
	objectLeftRow.add(objectLeft);

	container.add(objectLeftRow);

	// right

	let objectRightRow = new UIRow();
	let objectRight = new UINumber().onChange(update);

	objectRightRow.add(new UIText(strings.getKey('sidebar/object/right')).setWidth('90px'));
	objectRightRow.add(objectRight);

	container.add(objectRightRow);

	// top

	let objectTopRow = new UIRow();
	let objectTop = new UINumber().onChange(update);

	objectTopRow.add(new UIText(strings.getKey('sidebar/object/top')).setWidth('90px'));
	objectTopRow.add(objectTop);

	container.add(objectTopRow);

	// bottom

	let objectBottomRow = new UIRow();
	let objectBottom = new UINumber().onChange(update);

	objectBottomRow.add(new UIText(strings.getKey('sidebar/object/bottom')).setWidth('90px'));
	objectBottomRow.add(objectBottom);

	container.add(objectBottomRow);

	// near

	let objectNearRow = new UIRow();
	let objectNear = new UINumber().onChange(update);

	objectNearRow.add(new UIText(strings.getKey('sidebar/object/near')).setWidth('90px'));
	objectNearRow.add(objectNear);

	container.add(objectNearRow);

	// far

	let objectFarRow = new UIRow();
	let objectFar = new UINumber().onChange(update);

	objectFarRow.add(new UIText(strings.getKey('sidebar/object/far')).setWidth('90px'));
	objectFarRow.add(objectFar);

	container.add(objectFarRow);

	// intensity

	let objectIntensityRow = new UIRow();
	let objectIntensity = new UINumber().onChange(update);

	objectIntensityRow.add(new UIText(strings.getKey('sidebar/object/intensity')).setWidth('90px'));
	objectIntensityRow.add(objectIntensity);

	container.add(objectIntensityRow);

	// color

	let objectColorRow = new UIRow();
	let objectColor = new UIColor().onInput(update);

	objectColorRow.add(new UIText(strings.getKey('sidebar/object/color')).setWidth('90px'));
	objectColorRow.add(objectColor);

	container.add(objectColorRow);

	// ground color

	let objectGroundColorRow = new UIRow();
	let objectGroundColor = new UIColor().onInput(update);

	objectGroundColorRow.add(new UIText(strings.getKey('sidebar/object/groundcolor')).setWidth('90px'));
	objectGroundColorRow.add(objectGroundColor);

	container.add(objectGroundColorRow);

	// distance

	let objectDistanceRow = new UIRow();
	let objectDistance = new UINumber().setRange(0, Infinity).onChange(update);

	objectDistanceRow.add(new UIText(strings.getKey('sidebar/object/distance')).setWidth('90px'));
	objectDistanceRow.add(objectDistance);

	container.add(objectDistanceRow);

	// angle

	let objectAngleRow = new UIRow();
	let objectAngle = new UINumber().setPrecision(3).setRange(0, Math.PI / 2).onChange(update);

	objectAngleRow.add(new UIText(strings.getKey('sidebar/object/angle')).setWidth('90px'));
	objectAngleRow.add(objectAngle);

	container.add(objectAngleRow);

	// penumbra

	let objectPenumbraRow = new UIRow();
	let objectPenumbra = new UINumber().setRange(0, 1).onChange(update);

	objectPenumbraRow.add(new UIText(strings.getKey('sidebar/object/penumbra')).setWidth('90px'));
	objectPenumbraRow.add(objectPenumbra);

	container.add(objectPenumbraRow);

	// decay

	let objectDecayRow = new UIRow();
	let objectDecay = new UINumber().setRange(0, Infinity).onChange(update);

	objectDecayRow.add(new UIText(strings.getKey('sidebar/object/decay')).setWidth('90px'));
	objectDecayRow.add(objectDecay);

	container.add(objectDecayRow);

	// shadow

	let objectShadowRow = new UIRow();

	objectShadowRow.add(new UIText(strings.getKey('sidebar/object/shadow')).setWidth('90px'));

	let objectCastShadow = new UIBoolean(false, strings.getKey('sidebar/object/cast')).onChange(update);
	objectShadowRow.add(objectCastShadow);

	let objectReceiveShadow = new UIBoolean(false, strings.getKey('sidebar/object/receive')).onChange(update);
	objectShadowRow.add(objectReceiveShadow);

	container.add(objectShadowRow);

	// shadow bias

	let objectShadowBiasRow = new UIRow();

	objectShadowBiasRow.add(new UIText(strings.getKey('sidebar/object/shadowBias')).setWidth('90px'));

	let objectShadowBias = new UINumber(0).setPrecision(5).setStep(0.0001).setNudge(0.00001).onChange(update);
	objectShadowBiasRow.add(objectShadowBias);

	container.add(objectShadowBiasRow);

	// shadow normal offset

	let objectShadowNormalBiasRow = new UIRow();

	objectShadowNormalBiasRow.add(new UIText(strings.getKey('sidebar/object/shadowNormalBias')).setWidth('90px'));

	let objectShadowNormalBias = new UINumber(0).onChange(update);
	objectShadowNormalBiasRow.add(objectShadowNormalBias);

	container.add(objectShadowNormalBiasRow);

	// shadow radius

	let objectShadowRadiusRow = new UIRow();

	objectShadowRadiusRow.add(new UIText(strings.getKey('sidebar/object/shadowRadius')).setWidth('90px'));

	let objectShadowRadius = new UINumber(1).onChange(update);
	objectShadowRadiusRow.add(objectShadowRadius);

	container.add(objectShadowRadiusRow);

	// visible

	let objectVisibleRow = new UIRow();
	let objectVisible = new UICheckbox().onChange(update);

	objectVisibleRow.add(new UIText(strings.getKey('sidebar/object/visible')).setWidth('90px'));
	objectVisibleRow.add(objectVisible);

	container.add(objectVisibleRow);

	// frustumCulled

	let objectFrustumCulledRow = new UIRow();
	let objectFrustumCulled = new UICheckbox().onChange(update);

	objectFrustumCulledRow.add(new UIText(strings.getKey('sidebar/object/frustumcull')).setWidth('90px'));
	objectFrustumCulledRow.add(objectFrustumCulled);

	container.add(objectFrustumCulledRow);

	// renderOrder

	let objectRenderOrderRow = new UIRow();
	let objectRenderOrder = new UIInteger().setWidth('50px').onChange(update);

	objectRenderOrderRow.add(new UIText(strings.getKey('sidebar/object/renderorder')).setWidth('90px'));
	objectRenderOrderRow.add(objectRenderOrder);

	container.add(objectRenderOrderRow);

	// user data

	let objectUserDataRow = new UIRow();
	let objectUserData = new UITextArea().setWidth('150px').setHeight('40px').setFontSize('12px').onChange(update);

	objectUserData.onKeyUp(() => {

		try {

			JSON.parse(objectUserData.getValue());

			objectUserData.dom.classList.add('success');
			objectUserData.dom.classList.remove('fail');

		} catch (error) {

			objectUserData.dom.classList.remove('success');
			objectUserData.dom.classList.add('fail');

		}

	});

	objectUserDataRow.add(new UIText(strings.getKey('sidebar/object/userdata')).setWidth('90px'));
	objectUserDataRow.add(objectUserData);

	container.add(objectUserDataRow);


	//

	function update() {

		let object = editor.selected;

		if (object !== null) {

			let newPosition = new THREE.Vector3(objectPositionX.getValue(), objectPositionY.getValue(), objectPositionZ.getValue());
			if (object.position.distanceTo(newPosition) >= 0.01) {

				editor.execute(new SetPositionCommand(editor, object, newPosition));

			}

			let newRotation = new THREE.Euler(objectRotationX.getValue() * THREE.MathUtils.DEG2RAD, objectRotationY.getValue() * THREE.MathUtils.DEG2RAD, objectRotationZ.getValue() * THREE.MathUtils.DEG2RAD);
			if (object.rotation.toVector3().distanceTo(newRotation.toVector3()) >= 0.01) {

				editor.execute(new SetRotationCommand(editor, object, newRotation));

			}

			let newScale = new THREE.Vector3(objectScaleX.getValue(), objectScaleY.getValue(), objectScaleZ.getValue());
			if (object.scale.distanceTo(newScale) >= 0.01) {

				editor.execute(new SetScaleCommand(editor, object, newScale));

			}

			if (object.fov !== undefined && Math.abs(object.fov - objectFov.getValue()) >= 0.01) {

				editor.execute(new SetValueCommand(editor, object, 'fov', objectFov.getValue()));
				object.updateProjectionMatrix();

			}

			if (object.left !== undefined && Math.abs(object.left - objectLeft.getValue()) >= 0.01) {

				editor.execute(new SetValueCommand(editor, object, 'left', objectLeft.getValue()));
				object.updateProjectionMatrix();

			}

			if (object.right !== undefined && Math.abs(object.right - objectRight.getValue()) >= 0.01) {

				editor.execute(new SetValueCommand(editor, object, 'right', objectRight.getValue()));
				object.updateProjectionMatrix();

			}

			if (object.top !== undefined && Math.abs(object.top - objectTop.getValue()) >= 0.01) {

				editor.execute(new SetValueCommand(editor, object, 'top', objectTop.getValue()));
				object.updateProjectionMatrix();

			}

			if (object.bottom !== undefined && Math.abs(object.bottom - objectBottom.getValue()) >= 0.01) {

				editor.execute(new SetValueCommand(editor, object, 'bottom', objectBottom.getValue()));
				object.updateProjectionMatrix();

			}

			if (object.near !== undefined && Math.abs(object.near - objectNear.getValue()) >= 0.01) {

				editor.execute(new SetValueCommand(editor, object, 'near', objectNear.getValue()));
				if (object.isOrthographicCamera) {

					object.updateProjectionMatrix();

				}

			}

			if (object.far !== undefined && Math.abs(object.far - objectFar.getValue()) >= 0.01) {

				editor.execute(new SetValueCommand(editor, object, 'far', objectFar.getValue()));
				if (object.isOrthographicCamera) {

					object.updateProjectionMatrix();

				}

			}

			if (object.intensity !== undefined && Math.abs(object.intensity - objectIntensity.getValue()) >= 0.01) {

				editor.execute(new SetValueCommand(editor, object, 'intensity', objectIntensity.getValue()));

			}

			if (object.color !== undefined && object.color.getHex() !== objectColor.getHexValue()) {

				editor.execute(new SetColorCommand(editor, object, 'color', objectColor.getHexValue()));

			}

			if (object.groundColor !== undefined && object.groundColor.getHex() !== objectGroundColor.getHexValue()) {

				editor.execute(new SetColorCommand(editor, object, 'groundColor', objectGroundColor.getHexValue()));

			}

			if (object.distance !== undefined && Math.abs(object.distance - objectDistance.getValue()) >= 0.01) {

				editor.execute(new SetValueCommand(editor, object, 'distance', objectDistance.getValue()));

			}

			if (object.angle !== undefined && Math.abs(object.angle - objectAngle.getValue()) >= 0.01) {

				editor.execute(new SetValueCommand(editor, object, 'angle', objectAngle.getValue()));

			}

			if (object.penumbra !== undefined && Math.abs(object.penumbra - objectPenumbra.getValue()) >= 0.01) {

				editor.execute(new SetValueCommand(editor, object, 'penumbra', objectPenumbra.getValue()));

			}

			if (object.decay !== undefined && Math.abs(object.decay - objectDecay.getValue()) >= 0.01) {

				editor.execute(new SetValueCommand(editor, object, 'decay', objectDecay.getValue()));

			}

			if (object.visible !== objectVisible.getValue()) {

				editor.execute(new SetValueCommand(editor, object, 'visible', objectVisible.getValue()));

			}

			if (object.frustumCulled !== objectFrustumCulled.getValue()) {

				editor.execute(new SetValueCommand(editor, object, 'frustumCulled', objectFrustumCulled.getValue()));

			}

			if (object.renderOrder !== objectRenderOrder.getValue()) {

				editor.execute(new SetValueCommand(editor, object, 'renderOrder', objectRenderOrder.getValue()));

			}

			if (object.castShadow !== undefined && object.castShadow !== objectCastShadow.getValue()) {

				editor.execute(new SetValueCommand(editor, object, 'castShadow', objectCastShadow.getValue()));

			}

			if (object.receiveShadow !== objectReceiveShadow.getValue()) {

				if (object.material !== undefined) object.material.needsUpdate = true;
				editor.execute(new SetValueCommand(editor, object, 'receiveShadow', objectReceiveShadow.getValue()));

			}

			if (object.shadow !== undefined) {

				if (object.shadow.bias !== objectShadowBias.getValue()) {

					editor.execute(new SetValueCommand(editor, object.shadow, 'bias', objectShadowBias.getValue()));

				}

				if (object.shadow.normalBias !== objectShadowNormalBias.getValue()) {

					editor.execute(new SetValueCommand(editor, object.shadow, 'normalBias', objectShadowNormalBias.getValue()));

				}

				if (object.shadow.radius !== objectShadowRadius.getValue()) {

					editor.execute(new SetValueCommand(editor, object.shadow, 'radius', objectShadowRadius.getValue()));

				}

			}

			try {

				let userData = JSON.parse(objectUserData.getValue());
				if (JSON.stringify(object.userData) !== JSON.stringify(userData)) {

					editor.execute(new SetValueCommand(editor, object, 'userData', userData));

				}

			} catch (exception) {

				console.warn(exception);

			}

		}

	}

	function updateRows(object) {

		let properties = {
			'fov': objectFovRow,
			'left': objectLeftRow,
			'right': objectRightRow,
			'top': objectTopRow,
			'bottom': objectBottomRow,
			'near': objectNearRow,
			'far': objectFarRow,
			'intensity': objectIntensityRow,
			'color': objectColorRow,
			'groundColor': objectGroundColorRow,
			'distance': objectDistanceRow,
			'angle': objectAngleRow,
			'penumbra': objectPenumbraRow,
			'decay': objectDecayRow,
			'castShadow': objectShadowRow,
			'receiveShadow': objectReceiveShadow,
			'shadow': [objectShadowBiasRow, objectShadowNormalBiasRow, objectShadowRadiusRow]
		};


		for (let property in properties) {

			let uiElement = properties[property];

			if (Array.isArray(uiElement) === true) {

				for (let i = 0; i < uiElement.length; i++) {

					uiElement[i].setDisplay(object[property] !== undefined ? '' : 'none');

				}

			} else {

				uiElement.setDisplay(object[property] !== undefined ? '' : 'none');

			}

		}

		//

		if (object.isLight) {

			objectReceiveShadow.setDisplay('none');

		}

		if (object.isAmbientLight || object.isHemisphereLight) {

			objectShadowRow.setDisplay('none');

		}

	}

	function updateTransformRows(object) {

		if (object.isLight ||
			(object.isObject3D && object.userData.targetInverse)) {

			objectRotationRow.setDisplay('none');
			objectScaleRow.setDisplay('none');

		} else {

			objectRotationRow.setDisplay('');
			objectScaleRow.setDisplay('');

		}

	}

	function updateRowsForTypeOfObject(object) {


		let invisible = [objectTypeRow, objectFrustumCulledRow, objectScaleRow, objectShadowRow];

		invisible.forEach((e) => e.setDisplay('none'));

	}

	function updateUI(object) {
		if (object !== editor.selected) return;

		objectType.setValue(object.type);

		objectId.setValue(object.id);
		objectUuid.setValue(object.uuid);
		objectName.setValue(object.name);

		objectPositionX.setValue(object.position.x);
		objectPositionY.setValue(object.position.y);
		objectPositionZ.setValue(object.position.z);

		objectRotationX.setValue(object.rotation.x * THREE.MathUtils.RAD2DEG);
		objectRotationY.setValue(object.rotation.y * THREE.MathUtils.RAD2DEG);
		objectRotationZ.setValue(object.rotation.z * THREE.MathUtils.RAD2DEG);

		objectScaleX.setValue(object.scale.x);
		objectScaleY.setValue(object.scale.y);
		objectScaleZ.setValue(object.scale.z);

		if (object.fov !== undefined) {

			objectFov.setValue(object.fov);

		}

		if (object.left !== undefined) {

			objectLeft.setValue(object.left);

		}

		if (object.right !== undefined) {

			objectRight.setValue(object.right);

		}

		if (object.top !== undefined) {

			objectTop.setValue(object.top);

		}

		if (object.bottom !== undefined) {

			objectBottom.setValue(object.bottom);

		}

		if (object.near !== undefined) {

			objectNear.setValue(object.near);

		}

		if (object.far !== undefined) {

			objectFar.setValue(object.far);

		}

		if (object.intensity !== undefined) {

			objectIntensity.setValue(object.intensity);

		}

		if (object.color !== undefined) {

			objectColor.setHexValue(object.color.getHexString());

		}

		if (object.groundColor !== undefined) {

			objectGroundColor.setHexValue(object.groundColor.getHexString());

		}

		if (object.distance !== undefined) {

			objectDistance.setValue(object.distance);

		}

		if (object.angle !== undefined) {

			objectAngle.setValue(object.angle);

		}

		if (object.penumbra !== undefined) {

			objectPenumbra.setValue(object.penumbra);

		}

		if (object.decay !== undefined) {

			objectDecay.setValue(object.decay);

		}

		if (object.castShadow !== undefined) {

			objectCastShadow.setValue(object.castShadow);

		}

		if (object.receiveShadow !== undefined) {

			objectReceiveShadow.setValue(object.receiveShadow);

		}

		if (object.shadow !== undefined) {

			objectShadowBias.setValue(object.shadow.bias);
			objectShadowNormalBias.setValue(object.shadow.normalBias);
			objectShadowRadius.setValue(object.shadow.radius);

		}

		objectVisible.setValue(object.visible);
		objectFrustumCulled.setValue(object.frustumCulled);
		objectRenderOrder.setValue(object.renderOrder);

		try {

			objectUserData.setValue(JSON.stringify(object.userData, null, '  '));

		} catch (error) {

			console.log(error);

		}

		objectUserData.setBorderColor('transparent');
		objectUserData.setBackgroundColor('');

		updateTransformRows(object);

		updateRowsForTypeOfObject(object);

	}

	// events

	signals.objectSelected.add((object) => {
		const showObjectInfo = () => {
			container.setDisplay('block');

			updateRows(object);
			updateUI(object);
		}
		const hideObjectInfo = () => container.setDisplay('none');

		(object && !object.isCSGZonesContainer && !object.isScene
			? showObjectInfo
			: hideObjectInfo)();
	});

	signals.objectChanged.add(updateUI);

	signals.refreshSidebarObject3D.add(updateUI);

	return container;

}

export { SidebarObject };

