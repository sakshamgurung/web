import ListInfo from '../../../../src/components/FilesList/ListInfo.vue'
import GetTextPlugin from 'vue-gettext'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})
describe('ListInfo', () => {
  function getWrapper(props = {}) {
    return shallowMount(ListInfo, {
      localVue,
      propsData: {
        files: 2,
        folders: 3,
        ...props
      }
    })
  }
  describe('files and folders prop', () => {
    const wrapper = getWrapper()
    const itemElement = wrapper.find('p')

    it('should set data test attributes', () => {
      expect(itemElement.attributes('data-test-items')).toBe('5')
      expect(itemElement.attributes('data-test-files')).toBe('2')
      expect(itemElement.attributes('data-test-folders')).toBe('3')
    })

    it('should show text with files and folders total and individual count', () => {
      expect(itemElement.text()).toBe('5 items in total (2 files, 3 folders)')
    })
  })
  describe('size prop', () => {
    it('should not set the size attribute if not provided', () => {
      const wrapper = getWrapper()
      const itemElement = wrapper.find('p')

      expect(itemElement.attributes('data-test-size')).toBe(undefined)
    })
    it.each([-1, 0, 1, 0.1, 100000.01])('should set data test size property if provided', size => {
      const wrapper = getWrapper({ size: size })

      expect(wrapper.find('p').attributes('data-test-size')).toBe(size.toString())
    })

    describe('when size prop is less than zero', () => {
      const wrapper = getWrapper({ size: -1 })
      const itemElement = wrapper.find('p')

      it('should not contain size information inside text', () => {
        expect(itemElement.text()).toBe('5 items in total (2 files, 3 folders)')
      })
    })
    describe('when size prop is greater than zero', () => {
      it('should contain size information inside text', () => {
        const wrapper = getWrapper({ size: 10 })

        expect(wrapper.find('p').text()).toBe(`5 items with 10 B in total (2 files, 3 folders)`)
      })

      it.each`
        size              | expectedSize
        ${0.1}            | ${'0 B'}
        ${1}              | ${'1 B'}
        ${100}            | ${'100 B'}
        ${10000}          | ${'10 KB'}
        ${10000000}       | ${'9.5 MB'}
        ${10000000000}    | ${'9.3 GB'}
        ${10000000000000} | ${'9.1 TB'}
      `('should calculate size units', ({ size, expectedSize }) => {
        const wrapper = getWrapper({ size: size })

        expect(wrapper.find('p').text()).toBe(
          `5 items with ${expectedSize} in total (2 files, 3 folders)`
        )
      })
    })
  })
})
