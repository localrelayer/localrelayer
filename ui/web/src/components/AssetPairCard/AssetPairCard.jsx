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
import * as colors from 'web-styles/colors';
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
              <div>
                {assetDataA?.assetData?.symbol}
                {assetDataA?.assetData?.symbol ? '/' : ''}
                {assetDataB?.assetData?.symbol}
              </div>
              <S.BaseAssetAddress
                target="_blank"
                rel="noopener"
                href={`https://etherscan.io/token/${assetDataA?.assetData?.address}`}
              >
                {assetDataA?.assetData?.address}
              </S.BaseAssetAddress>
            </S.AssetPairInfo>
            <S.LastPrice>
              <div>{tradingInfo?.lastPrice || 'No trades in 24hr'}</div>
              <S.Description>Last Price</S.Description>
            </S.LastPrice>
            <S.PriceChange>
              {isPositive
                ? (
                  <ColoredSpan color={colors.green}>
                    {`+${tradingInfo.change24 || '0.00'}%`}
                  </ColoredSpan>
                )
                : (
                  <ColoredSpan color={colors.red}>
                    {`${tradingInfo.change24 || '0.00'}%`}
                  </ColoredSpan>
                )}
              <S.Description>24H Price</S.Description>
            </S.PriceChange>
            <S.Volume>
              <div>
                {tradingInfo.assetAVolume ? tradingInfo.assetAVolume.slice(0, 16) : 0}
              </div>
              <S.Description>{`Volume (${assetDataA?.assetData?.symbol})`}</S.Description>
            </S.Volume>
            <S.Volume>
              <div>
                {tradingInfo.assetAVolume ? tradingInfo.assetAVolume.slice(0, 16) : 0}
              </div>
              <S.Description>{`Volume (${assetDataB?.assetData?.symbol})`}</S.Description>
            </S.Volume>
          </S.CardTitle>
        )}
      />
    </S.AssetPairCard>
  );
};

export default AssetPairCard;
