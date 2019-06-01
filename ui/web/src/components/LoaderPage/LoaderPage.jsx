import React, {
  useEffect,
} from 'react';
import * as S from './styled';

const messages = [
  'Summoning hackers',
  'HODLing',
  'Considering alternatives',
  'Shuffling shitcoins',
  'Bogdanov, he is buying',
  'Continuing the dump',
  'Panic selling',
  'Pumping ZRX',
  'Painting a bull flags',
  'FOMO',
  'Loading the Korea FUD',
  'Dumping it again',
  'Hiding all best orders',
  'Loading China FUD',
  'Printing tethers',
  'Loading the deep',
  'Getting Vitalik on the line',
  'Crashing it',
  'REKT',
];

const LoaderPage = () => {
  const checkMarkIdPrefix = 'loadingCheckSVG-';
  const checkMarkCircleIdPrefix = 'loadingCheckCircleSVG-';
  const verticalSpacing = 50;

  function shuffleArray(array) {
    return array.sort(() => 0.5 - Math.random());
  }

  function createSVG(tag, properties, optChildren) {
    const newElement = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(properties).forEach((prop) => {
      newElement.setAttribute(prop, properties[prop]);
    });
    if (optChildren) {
      optChildren.forEach((child) => {
        newElement.appendChild(child);
      });
    }
    return newElement;
  }

  function createPhraseSvg(phrase, yOffset) {
    const text = createSVG('text', {
      fill: 'white',
      x: 50,
      y: yOffset,
      'font-size': 18,
      'font-family': 'Arial',
    });
    text.appendChild(document.createTextNode(`${phrase}...`));
    return text;
  }
  function createCheckSvg(yOffset, index) {
    const check = createSVG('polygon', {
      points: '21.661,7.643 13.396,19.328 9.429,15.361 7.075,17.714 13.745,24.384 24.345,9.708 ',
      fill: 'rgba(255,255,255,1)',
      id: checkMarkIdPrefix + index,
    });
    const circleOutline = createSVG('path', {
      d: 'M16,0C7.163,0,0,7.163,0,16s7.163,16,16,16s16-7.163,16-16S24.837,0,16,0z M16,30C8.28,30,2,23.72,2,16C2,8.28,8.28,2,16,2 c7.72,0,14,6.28,14,14C30,23.72,23.72,30,16,30z',
      fill: 'white',
    });
    const circle = createSVG('circle', {
      id: checkMarkCircleIdPrefix + index,
      fill: 'rgba(255,255,255,0)',
      cx: 16,
      cy: 16,
      r: 15,
    });
    return createSVG('g', {
      transform: `translate(10 ${yOffset - 20}) scale(.9)`,
    }, [circle, check, circleOutline]);
  }

  function addPhrasesToDocument(phrases) {
    phrases.forEach((phrase, index) => {
      const yOffset = 30 + (verticalSpacing * index);
      document.getElementById('phrases').appendChild(createPhraseSvg(phrase, yOffset));
      document.getElementById('phrases').appendChild(createCheckSvg(yOffset, index));
    });
  }

  function easeInOut(t) {
    const period = 200;
    return (Math.sin(t / period + 100) + 1) / 2;
  }

  useEffect(() => {
    const phrases = shuffleArray(messages);
    addPhrasesToDocument(phrases);
    const startTime = new Date().getTime();
    const upwardMovingGroup = document.getElementById('phrases');
    upwardMovingGroup.currentY = 0;
    const checks = phrases.map(
      (_, i) => (
        { check: document.getElementById(checkMarkIdPrefix + i),
          circle: document.getElementById(checkMarkCircleIdPrefix + i) }
      ),
    );
    function animateLoading() {
      const now = new Date().getTime();
      upwardMovingGroup.setAttribute('transform', `translate(0 ${upwardMovingGroup.currentY})`);
      upwardMovingGroup.currentY -= 1.35 * easeInOut(now);
      checks.forEach((check, i) => {
        const colorChangeBoundary = -i * verticalSpacing + verticalSpacing + 15;
        if (upwardMovingGroup.currentY < colorChangeBoundary) {
          const alpha = Math.max(Math.min(
            1 - (upwardMovingGroup.currentY - colorChangeBoundary + 15) / 30, 1,
          ),
          0);
          check.circle.setAttribute('fill', `rgba(255, 255, 255, ${alpha})`);
          const checkColor = [
            Math.round(255 * (1 - alpha) + 120 * alpha),
            Math.round(255 * (1 - alpha) + 154 * alpha),
          ];
          check.check.setAttribute('fill', `rgba(255, ${checkColor[0]},${checkColor[1]}, 1)`);
        }
      });
      if (now - startTime < 30000 && upwardMovingGroup.currentY > -710) {
        requestAnimationFrame(animateLoading);
      }
    }
    animateLoading();
  }, []);

  return (
    <S.PageWrapper>
      <div id="page">
        <div id="phrase_box">
          <svg width="100%" height="100%">
            <defs>
              <mask id="mask" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse">
                <linearGradient id="linearGradient" gradientUnits="objectBoundingBox" x2="0" y2="1">
                  <stop stopColor="white" stopOpacity="0" offset="0%" />
                  <stop stopColor="white" stopOpacity="1" offset="30%" />
                  <stop stopColor="white" stopOpacity="1" offset="70%" />
                  <stop stopColor="white" stopOpacity="0" offset="100%" />
                </linearGradient>
                <rect width="100%" height="100%" fill="url(#linearGradient)" />
              </mask>
            </defs>
            <g width="100%" height="100%" style={{ mask: 'url(#mask)' }}>
              <g id="phrases" />
            </g>
          </svg>
        </div>
      </div>
    </S.PageWrapper>
  );
};
export default LoaderPage;
