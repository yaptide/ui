/* @flow */

import React from 'react';
import type { PrintableMaterial } from 'model/simulation/material';
import { FormSelect } from 'components/Form';
import { t } from 'i18n';
import * as _ from 'lodash';

type Props = {
  materialId: number,
  materials: Array<PrintableMaterial>,
  onMaterialSelected: (materialId: number) => void,
};

class MaterialSelector extends React.Component<Props> {
  props: Props

  mapMaterialOptions = () => {
    return _.map(this.props.materials, item => ({
      field: item.id,
      label: item.label,
    }));
  }

  render() {
    return (
      <FormSelect
        value={this.props.materialId}
        label={t('workspace.editor.material')}
        onChange={this.props.onMaterialSelected}
        options={this.mapMaterialOptions()}
      />
    );
  }
}

export default MaterialSelector;

