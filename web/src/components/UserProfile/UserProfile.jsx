// @flow
import React from 'react';
import type { Node, StatelessFunctionalComponent } from 'react';
import { Card, Tabs, Popover, Badge, Icon } from 'antd';
import { connectionStatuses } from 'instex-core/src/utils/web3';
import ledger from '../../assets/ledger';
import metamask from '../../assets/metamask_logo.png';
import { AvatarContainer, TabName } from './styled';
import { UserButton } from '../Header/styled';
import { Truncate } from '../SharedStyles';
import UserProfileContent from './UserProfileContent';

const { TabPane } = Tabs;
const { Meta } = Card;

type Props = {
  balance: string,
  address: string,
  network: string,
  connectionStatus: string,
  addresses: Array<*>,
  provider: string,
  onAddressSelect: Function,
  onProviderSelect: Function,
};

/**
 * User profile with address and balance
 * @version 1.0.0
 * @author [Tim Reznich](https://github.com/imbaniac)
 */

const UserProfile: StatelessFunctionalComponent<Props> = ({
  address,
  balance,
  network,
  connectionStatus,
  addresses,
  provider,
  onAddressSelect,
  onProviderSelect,
}: Props): Node => (
  <Popover
    placement="bottom"
    trigger={['click']}
    content={
      <Card id="userCard" style={{ maxWidth: 400 }}>
        <Meta
          description={
            <div>
              <Tabs
                onChange={onProviderSelect}
                activeKey={provider}
                animated={false}
                size="small"
              >
                <TabPane
                  tab={
                    <TabName>
                      <AvatarContainer src={metamask} /> Metamask
                    </TabName>
                  }
                  key="metamask"
                >
                  <UserProfileContent
                    balance={balance}
                    network={network}
                    address={address}
                    addresses={addresses}
                    onAddressSelect={onAddressSelect}
                  />
                </TabPane>
                <TabPane
                  tab={
                    <TabName>
                      <AvatarContainer src={ledger} /> Ledger
                    </TabName>
                  }
                  key="ledger"
                >
                  <UserProfileContent
                    balance={balance}
                    network={network}
                    address={address}
                    addresses={addresses}
                    onAddressSelect={onAddressSelect}
                  />
                </TabPane>
              </Tabs>
            </div>
          }
        />
      </Card>
    }
  >
    <Badge>
      <UserButton id="account" type="primary">
        <AvatarContainer shape="square" src={provider === 'ledger' ? ledger : metamask} />
        {connectionStatus === connectionStatuses.CONNECTED ? (
          <Truncate>{address}</Truncate>
        ) : (
          connectionStatus
        )}
        <Icon type="down" />
      </UserButton>
    </Badge>
  </Popover>
);

export default UserProfile;
