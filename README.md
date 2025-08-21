# hyper-pwt

A faster, more modern, superior alternative for [Mendix PWT](https://github.com/mendix/widgets-tools).

## How to use?

It's simple.

First, install hyper-pwt from npm.

```bash
npm install --dev @repixelcorp/hyper-pwt
```

Second, replace pluggable-widget-tools to hyper-pwt in widget's package.json.

```json
{
  "scripts": {
    "start": "hyper-pwt start:server",
    "dev": "hyper-pwt start:web",
    "build": "hyper-pwt build:web",
    "lint": "hyper-pwt lint",
    "lint:fix": "hyper-pwt lint:fix",
    "prerelease": "npm run lint",
    "release": "hyper-pwt release:web"
  }
}
```

## Custom build configurations

TODO

## Performance compare with Mendix PWT

TODO

## Support pwt tasks

- [ ] start:web
- [ ] start:native
- [x] build:web
- [ ] build:native
- [ ] release:web
- [ ] release:native
- [ ] lint
- [ ] lint:fix
- [ ] format
- [ ] test:unit:web
- [ ] test:unit:native
- [ ] Widget Generator

## Support platforms

- [ ] Web
- [ ] Native
