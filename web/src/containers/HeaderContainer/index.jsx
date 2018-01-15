import React from 'react';
import Header from '../../components/Header';
import { testUser } from '../../utils/mocks';

export default () => <Header onUserClick={user => console.log(user)} user={testUser} />;
