# economize

Welcome to the economize plugin!

## Setup and Integration

1. In the [packages/app](https://github.com/backstage/backstage/blob/master/packages/app/) directory of your backstage
   instance, add the plugin as a package.json dependency:

```shell
$ yarn add @economize/backstage-plugin
```

2. Import page to [App.tsx](https://github.com/backstage/backstage/blob/master/packages/app/src/App.tsx):

```tsx
import { EconomizePage } from '@economize/backstage-plugin';
```

3. And add a new route to [App.tsx](https://github.com/backstage/backstage/blob/master/packages/app/src/App.tsx):

```tsx
<Route path="/economize" element={<EconomizePage />} />
```

4. Update [app-config.yaml](https://github.com/backstage/backstage/blob/master/app-config.yaml) to add a new proxy
   config:

```yaml
economize:
  table: ''
  accessKeyId: ''
  secretAccessKey: ''
  region: ''
  Database: ''
  OutputLocation: ''
  WorkGroup: ''
```
