// @flow
import React from 'react';
import {
  Card,
} from 'antd';

import type {
  Node,
} from 'react';
import type {
  AssetPair,
} from 'instex-core/types';

import {
  ColoredSpan,
} from 'web-components/SharedStyledComponents';
import * as S from './styled';


type Props = {
  loading: boolean,
  assetPair: AssetPair,
};

const AssetPairCard = ({
  assetPair,
  loading = false,
}: Props): Node => {
  const assetDataA = assetPair?.assetDataA;
  const assetDataB = assetPair?.assetDataB;
  const tradingInfo = assetPair?.tradingInfo || {};
  const isPositive = (tradingInfo.change24 || 0) >= 0;
  return (
    <S.AssetPairCard loading={loading}>
      <Card.Meta
        title={(
          <S.CardTitle>
            <S.AssetPairInfo>
              {assetDataA?.assetData?.symbol}
              {assetDataA?.assetData?.symbol ? '/' : ''}
              {assetDataB?.assetData?.symbol}
              <S.BaseAssetAddress
                target="_blank"
                rel="noopener"
                href={`https://etherscan.io/token/${assetDataA?.assetData?.address}`}
              >
                {assetDataA?.assetData?.address}
              </S.BaseAssetAddress>
            </S.AssetPairInfo>
            <S.LastPrice>
              {tradingInfo?.lastPrice || 'No info about trades in 24hr'}
            </S.LastPrice>
          </S.CardTitle>
        )}
        description={(
          <S.AssetPrice>
            <S.HighLowBlock>
              <div>
                High:
                {' '}
                {tradingInfo.maxPrice || '--'}
              </div>
              <div>
                Low:
                {' '}
                {tradingInfo.minPrice || '--'}
              </div>
            </S.HighLowBlock>
            <S.ChangeVolumeBlock>
              <S.PriceChange>
                {isPositive
                  ? (
                    <ColoredSpan color="green">
                      {`+${tradingInfo.change24 || '0.00'}%`}
                    </ColoredSpan>
                  )
                  : (
                    <ColoredSpan color="red">
                      {`${tradingInfo.change24 || '0.00'}%`}
                    </ColoredSpan>
                  )}
              </S.PriceChange>
              <div>
                Volume:
                {' '}
                {tradingInfo.assetAVolume ? tradingInfo.assetAVolume.slice(0, 16) : 0}
              </div>
            </S.ChangeVolumeBlock>
          </S.AssetPrice>
        )}
      />
    </S.AssetPairCard>
  );
};

export default AssetPairCard;
