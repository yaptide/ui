/* @flow */

import React from 'react';

const ResizeHOC = (WrapedComponent: any) => {
  return class extends React.Component {
    props: {
      style?: Object,
    }
    state: {
      width: number,
      height: number,
    } = {
      width: 300,
      height: 200,
    }
    component: any

    componentWillMount() {
      window.addEventListener('resize', this.resizeComponent);
    }

    componentWillUnmount() {
      window.removeEventListener('resize', this.resizeComponent);
    }

    resizeComponent = () => {
      if (!this.component) {
        return;
      }
      this.setState({
        width: this.component.clientWidth,
        height: this.component.clientHeight,
      });
    }

    setRef = (ref: any) => {
      this.component = ref;
      this.resizeComponent();
    }

    render() {
      const { style, ...props } = this.props;
      return (
        <div style={{ ...style, overflow: 'hidden' }} ref={this.setRef}>
          <WrapedComponent
            {...props}
            width={this.state.width}
            height={this.state.height}
          />
        </div>
      );
    }
  };
};

export default ResizeHOC;
