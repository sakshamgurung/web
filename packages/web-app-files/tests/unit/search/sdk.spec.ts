import { createLocalVue } from '@vue/test-utils'
import { SDKSearch } from '../../../src/search'
import { clientService } from '../../../src/services'
import Vuex from 'vuex'

const searchMock = jest.fn()
jest.spyOn(clientService, 'owncloudSdk', 'get').mockImplementation(() => ({
  files: {
    search: searchMock
  }
}))

jest.mock('../../../src/helpers/resources', () => ({
  buildResource: v => v
}))

const localVue = createLocalVue()
localVue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    Search: {
      state: {
        options: {
          hideSearchBar: false
        }
      },
      getters: {
        options: state => {
          return state.options
        }
      },
      mutations: {
        updateOptions(state, v) {
          state.options = { ...state.options, hideSearchBar: v }
        }
      },
      namespaced: true
    }
  }
})

describe('SDKProvider', () => {
  it('push route on activate', async () => {
    const push = jest.fn()
    push.mockReturnValueOnce(Promise.resolve())

    const search = new SDKSearch(store, { push })
    const expected = {
      name: 'search-provider-list',
      query: { term: 'foo', provider: 'files.sdk' }
    }

    search.activate('foo')
    expect(push.mock.calls[0][0]).toMatchObject(expected)

    push.mockImplementationOnce(() => Promise.reject(new Error()))
    search.activate('foo')
    expect(push.mock.calls[1][0]).toMatchObject(expected)
  })

  it('can reset', () => {
    const search = new SDKSearch(store, jest.fn())
    search.reset()
  })

  it('can updateTerm', () => {
    const search = new SDKSearch(store, jest.fn())
    search.updateTerm()
  })

  it('is only available if enabled in options', () => {
    const search = new SDKSearch(store, {})
    ;[false, true, false].forEach(v => {
      store.commit('Search/updateOptions', v)
      expect(search.available).toBe(!v)
    })
  })

  describe('SDKProvider previewSearch', () => {
    it('covers activate', () => {
      const search = new SDKSearch(store, jest.fn())
      search.previewSearch.activate({ id: 'id', data: 'data' })
    })

    it('is not available on certain routes', () => {
      ;[
        { route: 'foo', available: true },
        { route: 'search-provider-list' },
        { route: 'bar', available: true }
      ].forEach(v => {
        const search = new SDKSearch(store, {
          currentRoute: { name: v.route }
        })

        expect(!!search.previewSearch.available).toBe(!!v.available)
      })
    })

    it('can search', async () => {
      const search = new SDKSearch(store, jest.fn())
      const files = [
        { id: 'foo', name: 'foo' },
        { id: 'bar', name: 'bar' },
        { id: 'baz', name: 'baz' }
      ]

      const noTerm = await search.previewSearch.search('')
      expect(noTerm).toBeFalsy()

      searchMock.mockReturnValueOnce(files)
      const withTerm = await search.previewSearch.search('foo')
      expect(withTerm.map(r => r.data)).toMatchObject(files)

      const withTermCached = await search.previewSearch.search('foo')
      expect(withTermCached.map(r => r.data)).toMatchObject(files)
    })
  })
  describe('SDKProvider listSearch', () => {
    it('can search', async () => {
      const search = new SDKSearch(store, jest.fn())
      const files = [
        { id: 'foo', name: 'foo' },
        { id: 'bar', name: 'bar' },
        { id: 'baz', name: 'baz' }
      ]

      searchMock.mockReturnValueOnce(files)
      const withTerm = await search.listSearch.search('foo')
      expect(withTerm.map(r => r.data)).toMatchObject(files)
    })
  })
})
