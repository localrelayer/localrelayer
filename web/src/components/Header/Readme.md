Examples:

```js { "props": { "className": "example-wrapper" } }
const { testUser } = require('../../utils/mocks');
  <div>
    <Header
      onUserClick={(user) => console.log(user)}
      user={testUser}
    />
  </div>
```
