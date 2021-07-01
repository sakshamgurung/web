import { EventBus } from '../event'
import { bus } from './index'

describe('instance', () => {
  test('exports eventBus', () => {
    expect(bus).toBeInstanceOf(EventBus)
  })
})
