import Locker from './Locker';

const locker = new Locker({
    drivers: {
        local: window.localStorage,
        session: window.sessionStorage
    },
    driver: 'local',
    namespace: 'locker',
    separator: '.'
});

export default locker;
