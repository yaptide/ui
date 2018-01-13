/* @flow */

import React from 'react';
import { SketchPicker } from 'react-color';
import type { Color } from 'model/utils';
import { withStyles } from 'material-ui/styles';

type Props ={
  color: Color,
  updateColor: (color: Color) => void,
  classes: Object,
};

type State = {
  displayColorPicker: bool,
  color: Color,
};

class ColorPicker extends React.Component<Props, State> {
  props: Props
  state: State = {
    displayColorPicker: false,
    color: this.props.color || { r: 128, g: 128, b: 128, a: 255 },
  }

  handleClick = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker });
  }

  handleClose = () => {
    this.setState({ displayColorPicker: false });
    this.props.updateColor(this.state.color);
  }

  handleChange = (color: {rgb: Color}) => {
    this.props.updateColor(this.state.color);
    this.setState({ color: color.rgb });
  }

  render() {
    const classes = this.props.classes;
    const color = this.state.color;
    const colorStyle = {
      background: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
    };
    return (
      <div className={classes.root} >
        <div className={classes.swatch} onClick={this.handleClick} >
          <div style={colorStyle} className={classes.color} />
        </div>
        {
          this.state.displayColorPicker
            ? (
              <div style={styles.popover}>
                <div style={styles.cover} onClick={this.handleClose} />
                <SketchPicker color={this.state.color} onChange={this.handleChange} />
              </div>
            )
            : null
        }
      </div>
    );
  }
}
const styles = {
  root: {
    position: 'relative',
  },
  color: {
    width: '48px',
    height: '24px',
    borderRadius: '2px',
  },
  swatch: {
    padding: '5px',
    background: '#fff',
    borderRadius: '1px',
    boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
    display: 'inline-block',
    cursor: 'pointer',
  },
  popover: {
    position: 'absolute',
    zIndex: '2',
    right: 0,
    top: 48,
  },
  cover: {
    position: 'fixed',
    top: '0px',
    right: '0px',
    bottom: '0px',
    left: '0px',
  },
};

export default withStyles(styles)(ColorPicker);
