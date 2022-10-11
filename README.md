# openapi

> Andook's official OpenAPI spec with Andookit extensions

[![@latest](https://img.shields.io/npm/v/@andookit/openapi.svg)](https://www.npmjs.com/package/@andookit/openapi)

Amends operations from [Andook's official OpenAPI specification](https://github.com/andook/rest-api-description/) with an `x-andook` extension that includes the following keys

- `changes`: see change files in [changes/](changes/)

## Download

Download from https://unpkg.com/browse/@andook/openapi/generated/

## Node Usage

```js
const { schemas } = require("@andookit/openapi");
const version = schemas["api.andook.com"].info.version;
const paths = Object.keys(schemas["api.andook.com"].paths).sort();
```

## GitHub Actions usage

1. Install [Andookit Release Notifier app](https://github.com/apps/andookit-release-notifier/)
2. Create a new workflow file:

```yml
name: Update OpenAPI
on:
  repository_dispatch:
    types: [andookit/openapi release]

jobs:
  published:
    runs-on: ubuntu-latest
    steps:
      - run: "echo: 'new release: ${{ github.event.release.tag_name }}'"
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

[MIT](LICENSE)

## Attribution

This project was heavily inspired by the [Octokit](https://github.com/octokit/openapi) 💖. Take a look at the real magic they are creating.
