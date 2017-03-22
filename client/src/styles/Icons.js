/* @flow */
import React from 'react';
import SvgIcon from 'material-ui/SvgIcon';

const intersect = (
  <SvgIcon viewBox="0 0 300 300" style={{ width: '30px', height: '30px' }}>
    <defs>
      <mask id="hole">
        <rect width="100%" height="100%" fill="black" />
        <circle r="100" cx="110" cy="150" fill="white" />
      </mask>
    </defs>

    <circle r="100" cx="190" cy="150" mask="url(#hole)" />
  </SvgIcon>
);

const subtract = (
  <SvgIcon viewBox="0 0 300 300" style={{ width: '30px', height: '30px' }}>
    <defs>
      <mask id="cut">
        <rect width="100%" height="100%" fill="white" />
        <circle r="100" cx="260" cy="150" fill="black" />
      </mask>
    </defs>

    <circle id="donut" r="100" cx="150" cy="150" mask="url(#cut)" />
  </SvgIcon>
);

const union = (
  <SvgIcon viewBox="0 0 300 300" style={{ width: '30px', height: '30px' }}>
    <circle r="100" cx="100" cy="150" />
    <circle r="100" cx="200" cy="150" />
  </SvgIcon>
);


export default {
  subtract,
  intersect,
  union,
};
