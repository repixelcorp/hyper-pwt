# hyper-pwt

<img src="https://raw.githubusercontent.com/repixelcorp/hyper-pwt/main/static/header.png" alt="hyper-pwt" width="100%" height="auto">

A faster, more modern, superior alternative for [Mendix PWT](https://github.com/mendix/widgets-tools).

## How to migration to hyper-pwt?

Bascially, hyper-pwt is a drop-in replacement for Mendix PWT.

First, install hyper-pwt from npm.

```bash
npm install --dev @repixelcorp/hyper-pwt
```

Second, replace pluggable-widgets-tools to hyper-pwt in widget's package.json.

```json
{
  "scripts": {
    "dev": "hyper-pwt start:web",
    "build": "hyper-pwt build:web",
    "lint": "hyper-pwt lint",
    "lint:fix": "hyper-pwt lint:fix",
    "prerelease": "npm run lint",
    "release": "hyper-pwt release:web"
  }
}
```

Third, open tsconfig.json and change extends to hyper-pwt like below.

```json
{
  "extends": "@repixelcorp/hyper-pwt/src/configurations/typescript/tsconfig.base",
  "include": ["./src", "./typings"]
}
```

### I use custom rollup configuration.

First, proceed with the basic replacement process.

If the widget does not function properly after installing hyper-pwt, you can customize your Vite configuration by referring to the [“Custom build configurations”](#custom-build-configurations) section.

## Custom build configurations

### Web

Create vite.config.mjs on your pwt root directory.

```javascript
import { definePWTConfig } from '@repixelcorp/hyper-pwt';

export default definePWTConfig(() => {
    return {
      // Your custom configuration in here.
    };
});
```

hyper-pwt uses the [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react-swc) plugin. The settings for this plugin can be changed as follows.

```javascript
import { definePWTConfig } from '@repixelcorp/hyper-pwt';

export default definePWTConfig(() => {
    return {
        reactPluginOptions: {
          tsDecorators: true,
        }
    };
});
```

definePWTConfig also supports asynchronous mode. It can be used as follows.

```javascript
import { definePWTConfig } from '@repixelcorp/hyper-pwt';

export default definePWTConfig(async () => {
    const promise = await somethingPromise();

    return {
    };
});
```

### Native

TODO

## Performance compare with Mendix PWT

TODO

## Support pwt tasks

- [x] start:web
- [ ] start:native
- [x] build:web
- [ ] build:native
- [x] release:web
- [ ] release:native
- [ ] lint
- [ ] lint:fix
- [ ] format
- [ ] test:unit:web
- [ ] test:unit:native
- [ ] Widget Generator

## Support platforms

- [x] Web
  - [x] Basic Functions
  - [ ] Linter and Formatting
  - [ ] TDD Functions
- [ ] Native
  - [ ] Basic Functions
  - [ ] Linter and Formatting
  - [ ] TDD Functions

## License

@repixelcorp/hyper-pwt is distributed under the MIT License.

Please refer to the [LICENSE](./LICENSE).

## Disclaimers

Neither Repixel Co., Ltd., nor the project maintainers or contributors, are responsible for any problems arising from the use of this software. The user is entirely responsible.


