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
    t.is(t.context.locker.getNamespace(), 'locker');
    t.is(t.context.locker.getSeparator(), '.');
});

test('it should put an item into storage', t => {
    t.context.locker.put('foo', 'bar');

    t.is(t.context.locker.getDriver().getItem('locker.foo'), 'bar');
    t.is(t.context.locker.getDriver().length, 1);
});

test('it should put multiple items into storage when passing an object', t => {
    t.context.locker.put({ foo: 'bar', baz: 'bob' });

    t.is(t.context.locker.getDriver().getItem('locker.foo'), 'bar');
    t.is(t.context.locker.getDriver().getItem('locker.baz'), 'bob');
    t.is(t.context.locker.getDriver().length, 2);
});

test('it should add an item to storage when passing a function as key', t => {
    t.context.locker.put(() => {
        return 'foo';
    }, 'bar');

    t.is(t.context.locker.getDriver().getItem('locker.foo'), 'bar');
    t.is(t.context.locker.getDriver().length, 1);
});

test('it should add an item to storage when passing a function as value', t => {
    t.context.locker.put('foo', () => 'bar');
    t.context.locker.put('bar', () => {
        return { baz: 'bob' };
    });

    t.is(t.context.locker.getDriver().getItem('locker.foo'), 'bar');
    t.deepEqual(t.context.locker.getDriver().getItem('locker.bar'), { baz: 'bob' });
    t.is(t.context.locker.getDriver().length, 2);
});

test('it should forget an item', t => {
    t.context.locker.put('foo', 'bar');
    t.context.locker.put('baz', 'bob');
    t.context.locker.put('fred', 'jim');

    t.context.locker.forget('baz');
    t.is(t.context.locker.getDriver().length, 2);
});

test('it should forget multiple items', t => {
    t.context.locker.put('foo', 'bar');
    t.context.locker.put('baz', 'bob');
    t.context.locker.put('fred', 'jim');

    t.context.locker.forget(['foo', 'baz']);
    t.is(t.context.locker.getDriver().length, 1);
});

test('it should set the driver', t => {
    t.is(t.context.locker.options.driver, 'local');

    let locker = t.context.locker.driver('session');
    t.is(locker.options.driver, 'session');
});
