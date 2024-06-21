import React from 'react';
import Export from '../Export/Export';
import Reset from './Reset';

function Footer() {
  return (
    <section className={'h5p-category-task-footer'}>
      <Reset/>
      <Export/>
    </section>
  );
}

export default Footer;