import { Button } from '@mui/material';
import {
	Keyword,
	RULE_DEFAULTS
} from '../../../../../types/SimulationTypes/DetectTypes/DetectRuleTypes';
import { MathUtils, Object3D } from 'three';
import { PropertiesCategory } from './PropertiesCategory';
import { PropertyField, RulesConfiguration, RulesOutliner } from '../fields/PropertyField';
import { ScoringFilter, isDetectFilter } from '../../../../Simulation/Scoring/ScoringFilter';
import { SetFilterRuleCommand } from '../../../../js/commands/SetFilterRuleCommand';
import { SetValueCommand } from '../../../../js/commands/SetValueCommand';
import { YaptideEditor } from '../../../../js/YaptideEditor';
import { useSmartWatchEditorState } from '../../../../../util/hooks/signals';

export function FilterConfiguration(props: { editor: YaptideEditor; object: Object3D }) {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object as ScoringFilter);

	const visibleFlag = isDetectFilter(watchedObject);

	return (
		<PropertiesCategory
			category='Filter Rules'
			visible={visibleFlag}>
			{visibleFlag && (
				<>
					<PropertyField>
						<Button
							sx={{ width: '100%' }}
							variant='contained'
							onClick={() => {
								const ruleJson = {
									uuid: MathUtils.generateUUID(),
									keyword: 'Z',
									operator: RULE_DEFAULTS.Z[0],
									value: RULE_DEFAULTS.Z[1]
								};
								editor.execute(
									new SetFilterRuleCommand(editor, watchedObject.object, ruleJson)
								);
							}}>
							Add rule
						</Button>
					</PropertyField>
					<PropertyField>
						<RulesOutliner
							editor={editor}
							value={watchedObject.selectedRule?.uuid ?? null}
							options={watchedObject.rules}
							onChange={uuid => {
								const rule = watchedObject.getRuleByUuid(uuid);
								editor.execute(
									new SetValueCommand(
										editor,
										watchedObject.object,
										'selectedRule',
										rule
									)
								);
							}}
						/>
					</PropertyField>
					{watchedObject.selectedRule && (
						<PropertyField>
							<RulesConfiguration
								rule={watchedObject.selectedRule}
								onChange={(newValue: {
									keywordSelect: string;
									operatorSelect: string;
									idSelect: string;
									valueInput: number;
								}) => {
									if (!watchedObject.selectedRule) return;
									const uuid = watchedObject.selectedRule.uuid;
									const keyword = newValue.keywordSelect as Keyword;
									const operator =
										keyword !== watchedObject.selectedRule.keyword
											? RULE_DEFAULTS[keyword][0]
											: newValue.operatorSelect;
									const value =
										keyword !== watchedObject.selectedRule.keyword
											? RULE_DEFAULTS[keyword][1]
											: newValue.valueInput;
									editor.execute(
										new SetFilterRuleCommand(editor, watchedObject.object, {
											uuid,
											keyword,
											operator,
											value
										})
									);
								}}
								onDelete={() =>
									editor.execute(
										new SetFilterRuleCommand(editor, watchedObject.object)
									)
								}
							/>
						</PropertyField>
					)}
				</>
			)}
		</PropertiesCategory>
	);
}
