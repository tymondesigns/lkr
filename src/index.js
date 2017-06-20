import { Lkr } from './Lkr';

export * from './Lkr';
export const Locker = new Lkr({
  drivers: {
    local: window.localStorage,
    session: window.sessionStorage
  },
  driver: 'local',
  namespace: 'lkr',
  separator: '.'
});
