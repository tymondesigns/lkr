import Lkr from './Lkr'

const Locker = new Lkr({
  drivers: {
    local: window.localStorage,
    session: window.sessionStorage
  },
  driver: 'local',
  namespace: 'lkr',
  separator: '.'
})

export { Lkr, Locker }
