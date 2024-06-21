import React from 'react';
import ReactDOM from 'react-dom';
import axe from 'react-axe';
window.onload = () => {
  axe(React, ReactDOM, 1000);
};
