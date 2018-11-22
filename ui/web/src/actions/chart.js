// @flow
import {
  actionTypes,
} from '.';

export const subscribeOnChangeChartBar = (
  chartBarCallback: any,
  assetPair: any,
): UiAction => ({
  type: actionTypes.SUBSCRIBE_ON_CHANGE_CHART_BAR,
  chartBarCallback,
  assetPair,
});
