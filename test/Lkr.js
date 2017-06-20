import test from 'ava';
import { Lkr } from '../src/Lkr';
import storageMock from './mocks/storageMock';

test.beforeEach(t => {
  t.context.localStore = storageMock();
  t.context.sessionStore = storageMock();

  const options = {
    drivers: {
      local: t.context.localStore,
      session: t.context.sessionStore
    },
    driver: 'local',
    namespace: 'lkr',
    separator: '.'
  };

  t.context.lkr = new Lkr(options);
});

test('it should instantiate the class', t => {
  t.true(t.context.lkr instanceof Lkr);
  t.is(t.context.lkr.options.namespace, 'lkr');
  t.is(t.context.lkr.options.separator, '.');
});

test('it should throw an error if driver is not available', t => {
  const options = {
    drivers: {
      local: t.context.localStore,
      session: t.context.sessionStore
    },
    driver: 'foo',
    namespace: 'lkr',
    separator: '.'
  };

  t.throws(() => {
    new Lkr(options);
  }, '[lkr] Driver "foo" not available.');
});

test('it should throw an error if driver is not supported', t => {
  const options = {
    drivers: {
      local: void 0
    },
    driver: 'local',
    namespace: 'lkr',
    separator: '.'
  };

  t.throws(() => {
    new Lkr(options);
  }, '[lkr] Driver "local" not supported.');
});

test('it should put an item into storage', t => {
  t.context.lkr.put('foo', 'bar');

  t.is(t.context.lkr.store.getItem('lkr.foo'), 'bar');
  t.is(t.context.lkr.store.length, 1);
});

test('it should throw an error when attempting to put an undefined key', t => {
  t.throws(() => {
      t.context.lkr.put();
  }, '[lkr] You must specify a key.');
});

test('it should throw an error when attempting to put an undefined value', t => {
  t.throws(() => {
      t.context.lkr.put('foo');
  }, '[lkr] You must specify a value.');
});

test('it should put multiple items into storage when passing an object', t => {
  t.context.lkr.put({ foo: 'bar', baz: 'bob' });

  t.is(t.context.lkr.store.getItem('lkr.foo'), 'bar');
  t.is(t.context.lkr.store.getItem('lkr.baz'), 'bob');
  t.is(t.context.lkr.store.length, 2);
});

test('it should put an item into storage when passing a function as key', t => {
  t.context.lkr.put(() => {
      return 'foo';
  }, 'bar');

  t.is(t.context.lkr.store.getItem('lkr.foo'), 'bar');
  t.is(t.context.lkr.store.length, 1);
});

test('it should put an item into storage when passing a function as value', t => {
  t.context.lkr.put('foo', () => 'bar');
  t.context.lkr.put('bar', () => {
      return { baz: 'bob' };
  });

  t.is(t.context.lkr.store.getItem('lkr.foo'), 'bar');
  t.deepEqual(t.context.lkr.store.getItem('lkr.bar'), { baz: 'bob' });
  t.is(t.context.lkr.store.length, 2);
});

test('it should add an item to storage if it does not already exist', t => {
  t.context.lkr.put('foo', 'bar');
  let added1 = t.context.lkr.add('foo', 'baz');
  let added2 = t.context.lkr.add('baz', 'bob');

  t.false(added1);
  t.true(added2);
  t.is(t.context.lkr.store.getItem('lkr.foo'), 'bar');
  t.is(t.context.lkr.store.getItem('lkr.baz'), 'bob');
  t.is(t.context.lkr.store.length, 2);
});

test('it should get an item', t => {
  t.context.lkr.put('foo', 'bar');

  t.is('bar', t.context.lkr.get('foo'));
});

test('it should return the specified default value when requesting an item that does not exist', t => {
  t.context.lkr.put('somethingThatDoesExist', 'exists');

  let result1 = t.context.lkr.get('somethingThatDoesExist', 'defaultValue');
  let result2 = t.context.lkr.get('somethingElseThatDoesntExist', { foo: 'bar', bar: 123, baz: true });
  let result3 = t.context.lkr.get('somethingElseThatDoesntExist', false);
  let result4 = t.context.lkr.get('somethingElseThatDoesntExist', '');
  let result5 = t.context.lkr.get('somethingElseThatDoesntExist', 'NaN');
  let result6 = t.context.lkr.get('somethingElseThatDoesntExist', null);
  let result7 = t.context.lkr.get('somethingElseThatDoesntExist', 0);

  t.not(result1, 'defaultValue');
  t.deepEqual(result2, { foo: 'bar', bar: 123, baz: true });
  t.is(result3, false);
  t.is(result4, '');
  t.is(result5, 'NaN');
  t.is(result6, null);
  t.is(result7, 0);
});

test('it should get multiple items', t => {
  t.context.lkr.put('foo', 'bar');
  t.context.lkr.put('baz', 'bob');
  t.context.lkr.put('fred', 'jim');

  t.deepEqual({ foo: 'bar', fred: 'jim' }, t.context.lkr.get(['foo', 'fred']));
});

test('it should forget an item', t => {
  t.context.lkr.put('foo', 'bar');
  t.context.lkr.put('baz', 'bob');
  t.context.lkr.put('fred', 'jim');

  t.context.lkr.forget('baz');
  t.is(t.context.lkr.store.length, 2);
});

test('it should forget multiple items', t => {
  t.context.lkr.put('foo', 'bar');
  t.context.lkr.put('baz', 'bob');
  t.context.lkr.put('fred', 'jim');

  t.context.lkr.forget(['foo', 'baz']);
  t.is(t.context.lkr.store.length, 1);
});

test('it should get all the items', t => {
  t.context.lkr.driver('session').namespace('test.namespace').put('test', 'testvalue');

  // t.context.lkr.driver('session').namespace('test.namespace').clean();

  t.is(t.context.lkr.keys().length, 0);
});

test('it should set the driver', t => {
  t.is(t.context.lkr.options.driver, 'local');

  let lkr = t.context.lkr.driver('session');
  t.is(lkr.options.driver, 'session');
});
