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
import { Lkr, Locker } from 'lkr';

// this will use include browser localStorage / sessionStorage by default
Locker.put('foo', { bar: 'baz' });

// Or define your own instance for use anywhere
const customLocker = new Lkr({
  drivers: {
    local: window.localStorage,
    session: window.sessionStorage,
  },
  driver: 'local',
  namespace: 'lkr',
  separator: '.'
});

customLocker.put('foo', { bar: 'baz' });
// etc
```
