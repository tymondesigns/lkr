# Lkr (Locker)
A fluent storage API

[![Travis](https://img.shields.io/travis/tymondesigns/lkr.svg?style=flat-square)](https://travis-ci.org/tymondesigns/lkr)
[![Codecov](https://img.shields.io/codecov/c/github/tymondesigns/lkr.svg?style=flat-square)](https://codecov.io/gh/tymondesigns/lkr)

## Installation

```bash
$ yarn add lkr
```
## Usage

```js
import Lkr from 'lkr';

const locker = new Lkr({
  drivers: {
    local: window.localStorage,
    session: window.sessionStorage,
  },
  driver: 'local',
  namespace: 'lkr',
  separator: '.'
});

locker.put('foo', { bar: 'baz' });
// etc
```
