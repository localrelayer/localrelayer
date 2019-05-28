import React, {
  useState,
  useEffect,
  useRef,
} from 'react';

function getDisplayName(Series) {
  const name = Series.displayName || Series.name || 'Series';
  return name;
}

export default (WrappedComponent, minWidth = 100, minHeight = 100) => {
  const ResponsiveComponent = (props) => {
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [ratio, setRatio] = useState(1);
    const node = useRef(null);
    const testCanvas = useRef(node);

    const getRatio = () => {
      if (testCanvas) {
        const context = testCanvas.current.getContext('2d');

        const devicePixelRatio = window.devicePixelRatio || 1;
        const backingStoreRatio = context.webkitBackingStorePixelRatio
          || context.mozBackingStorePixelRatio
          || context.msBackingStorePixelRatio
          || context.oBackingStorePixelRatio
          || context.backingStorePixelRatio || 1;

        return devicePixelRatio / backingStoreRatio;
      }
      return 1;
    };

    const handleWindowResize = () => {
      const el = node.current;
      console.log(el);
      const {
        width: calculatedWidth,
        height: calculatedHeight,
        paddingLeft,
        paddingRight,
        paddingBottom,
        paddingTop,
      } = window.getComputedStyle(el.parentNode);

      const w = parseFloat(calculatedWidth) - (parseFloat(paddingLeft) + parseFloat(paddingRight));
      const h = parseFloat(calculatedHeight) - (parseFloat(paddingBottom) + parseFloat(paddingTop));

      setWidth(Math.round(Math.max(w, minWidth)));
      setHeight(Math.round(Math.max(h, minHeight)));
    };

    useEffect(() => {
      window.addEventListener('resize', handleWindowResize);
      handleWindowResize();
      setRatio(getRatio());
      return () => window.removeEventListener('resize', handleWindowResize);
    }, []);

    if (width) {
      return (
        <WrappedComponent
          width={width}
          height={height}
          ratio={ratio}
          {...props}
          ref={node}
        />
      );
    }
    return (
      <div ref={node}>
        <canvas ref={testCanvas} />
      </div>
    );
  };

  ResponsiveComponent.displayName = `fitWidth(${getDisplayName(WrappedComponent)})`;

  return ResponsiveComponent;
};
