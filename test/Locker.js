import test from 'ava';
import Locker from '../src/Locker';
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
        namespace: 'locker',
        separator: '.'
    };

    t.context.locker = new Locker(options);
});

test('it should instantiate the class', t => {
    t.true(t.context.locker instanceof Locker);
    t.is(t.context.locker.options.namespace, 'locker');
    t.is(t.context.locker.options.separator, '.');
});

test('it should put an item into storage', t => {
    t.context.locker.put('foo', 'bar');

    t.is(t.context.locker.store.getItem('locker.foo'), 'bar');
    t.is(t.context.locker.store.length, 1);
});

test('it should put multiple items into storage when passing an object', t => {
    t.context.locker.put({ foo: 'bar', baz: 'bob' });

    t.is(t.context.locker.store.getItem('locker.foo'), 'bar');
    t.is(t.context.locker.store.getItem('locker.baz'), 'bob');
    t.is(t.context.locker.store.length, 2);
});

test('it should put an item into storage when passing a function as key', t => {
    t.context.locker.put(() => {
        return 'foo';
    }, 'bar');

    t.is(t.context.locker.store.getItem('locker.foo'), 'bar');
    t.is(t.context.locker.store.length, 1);
});

test('it should put an item into storage when passing a function as value', t => {
    t.context.locker.put('foo', () => 'bar');
    t.context.locker.put('bar', () => {
        return { baz: 'bob' };
    });

    t.is(t.context.locker.store.getItem('locker.foo'), 'bar');
    t.deepEqual(t.context.locker.store.getItem('locker.bar'), { baz: 'bob' });
    t.is(t.context.locker.store.length, 2);
});

test('it should add an item to storage if it does not already exist', t => {
    t.context.locker.put('foo', 'bar');
    let added1 = t.context.locker.add('foo', 'baz');
    let added2 = t.context.locker.add('baz', 'bob');

    t.false(added1);
    t.true(added2);
    t.is(t.context.locker.store.getItem('locker.foo'), 'bar');
    t.is(t.context.locker.store.getItem('locker.baz'), 'bob');
    t.is(t.context.locker.store.length, 2);
});

test('it should get an item', t => {
    t.context.locker.put('foo', 'bar');

    t.is('bar', t.context.locker.get('foo'));
});

test('it should return the specified default value when requesting an item that does not exist', t => {
    t.context.locker.put('somethingThatDoesExist', 'exists');

    let result1 = t.context.locker.get('somethingThatDoesExist', 'defaultValue');
    let result2 = t.context.locker.get('somethingElseThatDoesntExist', { foo: 'bar', bar: 123, baz: true });
    let result3 = t.context.locker.get('somethingElseThatDoesntExist', false);
    let result4 = t.context.locker.get('somethingElseThatDoesntExist', '');
    let result5 = t.context.locker.get('somethingElseThatDoesntExist', 'NaN');
    let result6 = t.context.locker.get('somethingElseThatDoesntExist', null);
    let result7 = t.context.locker.get('somethingElseThatDoesntExist', 0);

    t.not(result1, 'defaultValue');
    t.deepEqual(result2, { foo: 'bar', bar: 123, baz: true });
    t.is(result3, false);
    t.is(result4, '');
    t.is(result5, 'NaN');
    t.is(result6, null);
    t.is(result7, 0);
});

test('it should get multiple items', t => {
    t.context.locker.put('foo', 'bar');
    t.context.locker.put('baz', 'bob');
    t.context.locker.put('fred', 'jim');

    t.deepEqual({ foo: 'bar', fred: 'jim' }, t.context.locker.get(['foo', 'fred']));
});

test('it should forget an item', t => {
    t.context.locker.put('foo', 'bar');
    t.context.locker.put('baz', 'bob');
    t.context.locker.put('fred', 'jim');

    t.context.locker.forget('baz');
    t.is(t.context.locker.store.length, 2);
});

test('it should forget multiple items', t => {
    t.context.locker.put('foo', 'bar');
    t.context.locker.put('baz', 'bob');
    t.context.locker.put('fred', 'jim');

    t.context.locker.forget(['foo', 'baz']);
    t.is(t.context.locker.store.length, 1);
});

test('it should set the driver', t => {
    t.is(t.context.locker.options.driver, 'local');

    let locker = t.context.locker.driver('session');
    t.is(locker.options.driver, 'session');
});
