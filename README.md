# Hello world docker action

This action prints "Hello World" to the log or "Hello" + the name of a person to greet. To learn how this action was built, see "[Creating a Docker container action](https://help.github.com/en/articles/creating-a-docker-container-action)" in the GitHub Help documentation.

## Inputs

### `who-to-greet`

**Required** The name of the person to greet. Default `"World"`.

## Outputs

### `time`

The time we greeted you.

## Example usage

```yaml
name: Run Betterer using docker github action
on:
  push:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Test that should fail
        uses: Evilweed/betterer-github-action@main
        with:
          args: --config /github/workspace/test/.betterer --results /github/workspace/test/.betterer.results --reporter /build/custom-simple-reporter.js
```
