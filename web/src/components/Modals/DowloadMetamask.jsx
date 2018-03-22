import React from 'react';
import metamask from '../../assets/metamask.png';

const DownloadMetamask = () => (
  <div>
    <h4>Please <a rel="noopener noreferrer" target="_blank" href="https://metamask.io/">download Metamask</a> to use the exchange</h4>
    <a rel="noopener noreferrer" target="_blank" href="https://metamask.io/">
      <img height="100%" width="100%" src={metamask} alt="metamask" />
    </a>
  </div>
);

export default DownloadMetamask;
