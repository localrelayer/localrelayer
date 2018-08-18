import * as types from '../actions/types';
import type {
  Action,
  UIState,
} from '../types';

const initialState: UiState = {
  currentPairId: null,
  currentTokenId: null,
  searchQuery: '',
  isBalanceLoading: false,
  activeTab: 'buy',
  bannerMessage: null,
  activeLink: '',
  shouldRunTutorial: false,
  txHash: '',
  activeModal: '',
  isPageLoading: false,
};

export default function ui(
  state: UIState = initialState,
  action: Action,
) {
  switch (action.type) {
    case types.SET_UI_STATE:
      return {
        ...state,
        [action.payload.key]: action.payload.value,
      };
    case types.CLEAR_ALL_REDUCERS:
      return initialState;
    default:
      return state;
  }
}
