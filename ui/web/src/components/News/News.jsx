import React, { Component } from 'react';
import script from 'scriptjs';

script('https://platform.twitter.com/widgets.js', 'twitter-embed');

type Props = {};

/**
 * Twitter news
 * @version 1.0.0
 * @author [Tim Reznich](https://github.com/imbaniac)
 */

export default class extends Component<Props> {
  componentDidMount() {
    script.ready('twitter-embed', () => {
      if (!window.twttr) {
        console.error('Failure to load window.twttr, aborting load.');
        return;
      }

      const options = Object.assign({}, this.props.options);

      // if (this.props.autoHeight) {
      options.height = this.embedContainer.parentNode.offsetHeight;
      // }

      window.twttr.widgets
        .createTimeline(
          {
            sourceType: 'profile',
            screenName: 'Instex',
            url: 'https://twitter.com/Instex_0x',
          },
          this.embedContainer,
          {
            theme: 'dark',
          },
        )
        .then(() => {
          const style = document.createElement('style');
          const css = `
          .timeline-Widget {
            background-color: #06192a !important;
          }
          .timeline-Footer {
            display: none !important;
          }
      `;
          style.textContent = css;
          const iframe = Array.from(document.querySelectorAll('iframe')).find(fr =>
            fr.id.includes('twitter'));
          if (iframe) {
            iframe.contentDocument.head.appendChild(style);
          }
        });
    });
  }

  render() {
    return (
      <div
        style={{ height: '100%', overflow: 'auto' }}
        ref={(embedContainer) => {
          this.embedContainer = embedContainer;
        }}
      />
    );
  }
}
