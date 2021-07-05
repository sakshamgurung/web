import { mount, createLocalVue } from '@vue/test-utils'
import DesignSystem from 'owncloud-design-system'
import SearchBar from '../../../src/portals/SearchBar.vue'
import AsyncComputed from 'vue-async-computed'
import merge from 'lodash-es/merge'

const localVue = createLocalVue()
localVue.use(DesignSystem)
localVue.use(AsyncComputed)

const dummyProviderOne = {
  id: 'dummy.one',
  label: 'dummy.one.label',
  available: true,
  reset: jest.fn(),
  updateTerm: jest.fn(),
  activate: jest.fn(),
  previewSearch: {
    available: true,
    search: jest.fn()
  }
}

const dummyProviderTwo = {
  id: 'dummy.two',
  label: 'dummy.two.label',
  available: true,
  reset: jest.fn(),
  updateTerm: jest.fn(),
  activate: jest.fn()
}

beforeEach(() => {
  jest.resetAllMocks()
})

describe('Search Bar portal', () => {
  test('the component is only visible if it has providers available', async () => {
    const wrapper = mount(SearchBar, {
      localVue
    })

    expect(wrapper.element.innerHTML).toBeFalsy()

    wrapper.vm.$data.providerStore = {
      availableProviders: [dummyProviderOne]
    }

    await wrapper.vm.$nextTick()

    expect(wrapper.find('#files-global-search-bar').exists()).toBeTruthy()
    expect(wrapper.find('input').exists()).toBeTruthy()

    wrapper.destroy()
  })

  test('the component initialize the term', async () => {
    const wrapper = mount(SearchBar, {
      localVue,
      data() {
        return {
          optionsVisible: false,
          providerStore: {
            availableProviders: [dummyProviderOne, dummyProviderTwo]
          }
        }
      },
      mocks: {
        $route: {
          query: {
            term: 'anything'
          }
        }
      }
    })

    expect(wrapper.vm.$data.term).toBe('anything')
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('anything')

    wrapper.destroy()
  })

  test('the component resets the activeProvider on route change', async () => {
    const wrapper = mount(SearchBar, {
      localVue,
      data() {
        return {
          optionsVisible: false,
          activeProvider: { available: true }
        }
      },
      mocks: {
        $route: {
          name: 'old'
        }
      }
    })

    expect(wrapper.vm.$data.activeProvider.available).toBe(true)
    ;(wrapper.vm.$options.watch.$route as any).call(wrapper.vm)
    expect(wrapper.vm.$data.activeProvider.available).toBe(true)
    wrapper.vm.$data.activeProvider.available = false
    ;(wrapper.vm.$options.watch.$route as any).call(wrapper.vm)
    expect(wrapper.vm.$data.activeProvider).toBeUndefined()

    wrapper.destroy()
  })

  test('the component list providers only if a term is given and optionsVisible is true', async () => {
    const wrapper = mount(SearchBar, {
      localVue,
      data() {
        return {
          optionsVisible: false,
          term: undefined,
          providerStore: {
            availableProviders: [dummyProviderOne, dummyProviderTwo]
          }
        }
      }
    })

    expect(wrapper.findAll('#files-global-search-options .provider').length).toBe(0)

    wrapper.vm.$data.optionsVisible = true
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('#files-global-search-options .provider').length).toBe(0)

    wrapper.vm.$data.term = 'anything'
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('#files-global-search-options .provider').length).toBe(2)

    wrapper.destroy()
  })

  test('the component highlights the active provider', async () => {
    const wrapper = mount(SearchBar, {
      localVue,
      data() {
        return {
          optionsVisible: true,
          term: 'anything',
          providerStore: {
            availableProviders: [dummyProviderOne, dummyProviderTwo]
          }
        }
      }
    })

    expect(wrapper.findAll('#files-global-search-options .provider.selected').exists()).toBeFalsy()

    wrapper.vm.$data.activeProvider = dummyProviderTwo
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('#files-global-search-options .provider.selected').exists()).toBeTruthy()

    wrapper.destroy()
  })

  test('the component update provider term and component term on input', async () => {
    const wrapper = mount(SearchBar, {
      localVue,
      data() {
        return {
          optionsVisible: true,
          activeProvider: dummyProviderOne,
          providerStore: {
            availableProviders: [dummyProviderOne]
          }
        }
      }
    })
    expect(wrapper.findAll('#files-global-search-options .provider').length).toBe(0)

    await wrapper.find('input').setValue('anything')

    expect(wrapper.findAll('#files-global-search-options .provider').length).toBe(1)
    expect(wrapper.vm.$data.term).toBe('anything')
    expect(dummyProviderOne.updateTerm).toBeCalledTimes(1)
    expect(dummyProviderOne.updateTerm).toBeCalledWith('anything')

    wrapper.destroy()
  })

  test('the component deletes provider term and component term clear', async () => {
    const wrapper = mount(SearchBar, {
      localVue,
      data() {
        return {
          optionsVisible: true,
          activeProvider: dummyProviderOne,
          providerStore: {
            availableProviders: [dummyProviderOne]
          }
        }
      }
    })
    await wrapper.find('input').setValue('anything')
    expect(wrapper.vm.$data.term).toBe('anything')
    await wrapper.find('.oc-search-clear').trigger('click')
    expect(wrapper.vm.$data.term).toBe('')
    expect(wrapper.vm.$data.optionsVisible).toBeFalsy()

    wrapper.destroy()
  })

  test('the component activates a provider when clicking it', async () => {
    const wrapper = mount(SearchBar, {
      localVue,
      data() {
        return {
          optionsVisible: true,
          term: 'anything',
          providerStore: {
            availableProviders: [dummyProviderOne]
          }
        }
      }
    })

    expect(wrapper.vm.$data.activeProvider).toBeFalsy()
    expect(wrapper.find('li.provider').exists()).toBeTruthy()
    await wrapper.find('li.provider').trigger('click')
    expect(wrapper.find('li.provider').exists()).toBeFalsy()
    expect(wrapper.vm.$data.activeProvider).toMatchObject(dummyProviderOne)
    expect(wrapper.vm.$data.optionsVisible).toBeFalsy()
    expect(dummyProviderOne.activate).toBeCalledTimes(1)
    expect(dummyProviderOne.activate).toBeCalledWith('anything')

    wrapper.destroy()
  })

  test('the component show provider previews', async () => {
    const wrapper = mount(SearchBar, {
      localVue,
      data() {
        return {
          optionsVisible: true,
          term: 'anything',
          activeProvider: merge({}, dummyProviderOne, {
            previewSearch: {
              available: false
            }
          }),
          providerStore: {
            availableProviders: [dummyProviderOne]
          }
        }
      }
    })

    expect(dummyProviderOne.previewSearch.search).toBeCalledTimes(0)
    wrapper.vm.$data.activeProvider = dummyProviderOne
    await wrapper.vm.$nextTick()
    expect(dummyProviderOne.previewSearch.search).toBeCalledTimes(1)
    expect(dummyProviderOne.previewSearch.search).toBeCalledWith('anything')
    wrapper.destroy()
  })

  test('the component clears on keyboard esc', async () => {
    const wrapper = mount(SearchBar, {
      localVue,
      attachTo: document.body,
      data() {
        return {
          optionsVisible: true,
          term: 'anything',
          providerStore: {
            availableProviders: [dummyProviderOne]
          }
        }
      }
    })
    await wrapper.trigger('keyup.esc')
    expect(wrapper.vm.$data.optionsVisible).toBe(false)

    wrapper.destroy()
  })

  test('the component activates the provider on enter', async () => {
    const wrapper = mount(SearchBar, {
      localVue,
      attachTo: document.body,
      data() {
        return {
          optionsVisible: true,
          term: 'anything',
          providerStore: {
            availableProviders: [dummyProviderOne]
          }
        }
      }
    })
    await wrapper.trigger('keyup.enter')
    expect(wrapper.vm.$data.optionsVisible).toBe(false)
    expect(wrapper.vm.$data.activeProvider).toMatchObject(dummyProviderOne)
    expect(dummyProviderOne.activate).toBeCalledWith('anything')
    expect(dummyProviderOne.activate).toBeCalledTimes(1)

    wrapper.destroy()
  })

  test('the component switches the provider on key up or down', async () => {
    const wrapper = mount(SearchBar, {
      localVue,
      attachTo: document.body,
      data() {
        return {
          optionsVisible: true,
          term: 'anything',
          providerStore: {
            availableProviders: [dummyProviderOne, dummyProviderTwo]
          }
        }
      }
    })

    const getClasses = (at: number) => wrapper.findAll('.provider').at(at).element.classList
    expect(wrapper.findAll('.provider.selected').length).toBe(0)

    await wrapper.trigger('keyup.up')
    expect(getClasses(1)).toContain('selected')

    await wrapper.trigger('keyup.up')
    expect(getClasses(0)).toContain('selected')

    await wrapper.trigger('keyup.down')
    expect(getClasses(1)).toContain('selected')

    await wrapper.trigger('keyup.down')
    expect(getClasses(0)).toContain('selected')

    wrapper.destroy()
  })
})
