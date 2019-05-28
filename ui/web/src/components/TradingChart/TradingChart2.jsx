import React, {
  useEffect,
  useState,
} from 'react';
import {
  format,
} from 'd3-format';
import {
  timeFormat,
} from 'd3-time-format';
import {
  utcMinute,
} from 'd3-time';
import {
  scaleTime,
} from 'd3-scale';
import {
  ChartCanvas,
  Chart,
  ZoomButtons,
} from 'react-stockcharts';
import {
  CandlestickSeries,
  LineSeries,
} from 'react-stockcharts/lib/series';
import {
  XAxis, YAxis,
} from 'react-stockcharts/lib/axes';
import {
  CrossHairCursor,
  EdgeIndicator,
  CurrentCoordinate,
  MouseCoordinateX,
  MouseCoordinateY,
} from 'react-stockcharts/lib/coordinates';

import {
  LabelAnnotation, Label, Annotate,
} from 'react-stockcharts/lib/annotation';
import {
  discontinuousTimeScaleProvider,
} from 'react-stockcharts/lib/scale';
import {
  OHLCTooltip, MovingAverageTooltip,
} from 'react-stockcharts/lib/tooltip';
import {
  ema,
} from 'react-stockcharts/lib/indicator';
import {
  last, yes,
} from 'react-stockcharts/lib/utils';
import {
  assetDataUtils,
} from '0x.js';
import {
  utils,
} from 'instex-core';
import {
  plotDataLengthBarWidth,
} from 'react-stockcharts/lib/utils/barWidth';
import fitWidth from './fitWidth';
import {
  getDatafeed,
} from './Datafeed';

const today = new Date();
const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);

const mockData = [{
  date: yesterday,
  open: 25.59411494568944,
  high: 25.702108656795026,
  low: 25.17876090842236,
  close: 25.41136,
  volume: 54849500,
},
{
  date: today,
  // open: 25.59411494568944,
  // high: 25.702108656795026,
  // low: 25.17876090842236,
  // close: 25.41136,
  // volume: 54849500,
}];

const CandleStickChartWithAnnotation = React.forwardRef(({
  width,
  height,
  ratio = 1,
  assetPair,
  networkId,
  getBars,
  onSubscribeBars,
}, ref) => {
  const [bars, setBars] = useState([
    {
      date: yesterday,
    }, {
      date: today,
    }]);
  const loadBars = async () => {
    const yearAgo = new Date();
    yearAgo.setDate(today.getDate() - 365);
    const baseAssetData = assetDataUtils
      .encodeERC20AssetData(assetPair.assetDataA.assetData.address);
    const quoteAssetData = assetDataUtils
      .encodeERC20AssetData(assetPair.assetDataB.assetData.address);
    const data = await getBars({
      networkId,
      baseAssetData,
      quoteAssetData,
      from: yearAgo.getTime() / 1000,
      to: today.getTime() / 1000,
      resolution: '60',
      // firstDataRequest,
    });

    // const meta = {
    //   noData: false,
    // };

    console.log(data);

    const decimalsGap = Math.abs(assetPair.assetDataA.assetData.decimals
        - assetPair.assetDataB.assetData.decimals);
    const barsData = Object.values(Object.values(data)[0]).map(bar => ({
      time: bar.time,
      close: +utils.toUnitAmount(bar.close.toString(), decimalsGap),
      volume: +utils.toUnitAmount(bar.volume.toString(), assetPair.assetDataB.assetData.decimals),
      low: +utils.toUnitAmount(bar.low.toString(), decimalsGap),
      open: +utils.toUnitAmount(bar.open.toString(), decimalsGap),
      high: +utils.toUnitAmount(bar.high.toString(), decimalsGap),
    }));
    const result = Object.keys(barsData).map(a => ({
      ...barsData[a],
    })) || [];

    const formatted = result.map(bar => ({
      ...bar,
      date: new Date(bar.time),
    }));
    setBars([
      // ...bars,
      ...formatted,
    ]);
  };

  useEffect(() => {
    loadBars();
  }, [assetPair]);

  const annotationProps = {
    fontFamily: 'Glyphicons Halflings',
    fontSize: 20,
    fill: '#060F8F',
    opacity: 0.8,
    text: '\ue182',
    y: ({ yScale }) => yScale.range()[0],
    onClick: console.log.bind(console),
    tooltip: d => timeFormat('%B')(d.date),
    // onMouseOver: console.log.bind(console),
  };

  const margin = { left: 80, right: 80, top: 30, bottom: 50 };

  const xScaleProvider = discontinuousTimeScaleProvider
    .inputDateAccessor(d => d.date);
  const {
    data,
    xScale,
    xAccessor,
    displayXAccessor,
  } = xScaleProvider(bars);

  const start = xAccessor(last(data));
  const end = xAccessor(data[Math.max(0, data.length - 150)]);

  console.log(end);

  const xExtents = [start, end];


  return (
    <div style={{
      background: 'white',
    }}
    >
      <ChartCanvas
        ref={ref}
        height={height}
        ratio={ratio}
        width={width}
        margin={margin}
        type="hybrid"
        seriesName="MSFT"
        data={data}
        xScale={xScale}
        xAccessor={xAccessor}
        displayXAccessor={displayXAccessor}
        xExtents={xExtents}
        mouseMoveEvent
        panEvent
        zoomEvent
        clamp={false}
      >
        <Chart
          id={1}
          yExtents={[d => [d.high, d.low]]}
          padding={{ top: 10, bottom: 20 }}
        >
          <XAxis axisAt="bottom" orient="bottom" ticks={1} />
          <MouseCoordinateX
            at="bottom"
            orient="bottom"
            displayFormat={timeFormat('%Y-%m-%d')}
          />
          <MouseCoordinateY
            at="right"
            orient="right"
            displayFormat={format('.10f')}
          />

          <YAxis axisAt="right" orient="right" ticks={5} />

          <CandlestickSeries />
          <EdgeIndicator
            displayFormat={format('.8f')}
            itemType="last"
            orient="right"
            edgeAt="right"
            yAccessor={d => d.close}
            fill={d => (d.close > d.open ? '#6BA583' : '#FF0000')}
          />

          <OHLCTooltip origin={[-40, 0]} />

          <Annotate
            with={LabelAnnotation}
            when={d => d.date.getDate() === 1 /* some condition */}
            usingProps={annotationProps}
          />
          <ZoomButtons />
        </Chart>
        <CrossHairCursor strokeDasharray="LongDashDot" />

      </ChartCanvas>
    </div>
  );
});

// CandleStickChartWithAnnotation.propTypes = {
//   data: PropTypes.array.isRequired,
//   width: PropTypes.number.isRequired,
//   ratio: PropTypes.number.isRequired,
//   type: PropTypes.oneOf(['svg', 'hybrid']).isRequired,
// };


export default fitWidth(CandleStickChartWithAnnotation);
