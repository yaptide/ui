/* @flow */

import React from 'react';
import { withStyles } from 'material-ui/styles';
import Chip from 'material-ui/Chip';
import { FormInput } from 'components/Form';
import fuzzysearch from 'fuzzysearch';

type Props = {
  label: string,
  options: Array<{value: string, name: string }>,
  onItemSelected: (value: string) => void,
  classes: Object,
}

type State = {
  searchPhrase: string,
}

class FuzzyChipSelector extends React.Component<Props, State> {
  props: Props
  state: State = {
    searchPhrase: '',
  }

  selectChip = (event: Object) => {
    this.props.onItemSelected(event.currentTarget.getAttribute('value'));
  }

  onSearchPhraseChange = (value: string) => {
    this.setState({ searchPhrase: value });
  }

  filterMaterials = () => {
    return this.props.options.filter(
      item => fuzzysearch(
        this.state.searchPhrase.toLowerCase(),
        item.name.toLowerCase(),
      ),
    );
  }

  render() {
    const { classes } = this.props;
    const materialOptions = this.filterMaterials().map((item) => {
      return (
        <Chip
          value={item.value}
          key={item.value}
          className={classes.item}
          label={item.name}
          onClick={this.selectChip}
        />
      );
    });
    return (
      <div className={classes.root}>
        <FormInput
          label={this.props.label}
          value={this.state.searchPhrase}
          onChange={this.onSearchPhraseChange}
          className={classes.output}
        />
        <div className={classes.itemsContainer} >
          {materialOptions}
        </div>
      </div>
    );
  }
}

const styles = () => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  itemsContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'auto',
    flex: '1 1 0',
    alignContent: 'flex-start',
    minHeight: '30px',
  },
  item: {
    margin: 4,
  },
  output: {
    overflow: 'hidden',
  },
});

export default withStyles(styles)(FuzzyChipSelector);
