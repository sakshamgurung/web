import { SearchProvider, SearchList, SearchPreview } from 'search/src/types'
import Preview from './preview'
import List from './list'
import { EventBus } from 'web-pkg/src/event'
import { Store } from 'vuex'
import VueRouter from 'vue-router'

export default class Provider extends EventBus implements SearchProvider {
  public readonly id: string
  public readonly label: string
  public readonly previewSearch: SearchPreview
  public readonly listSearch: SearchList
  private readonly store: Store<any>
  private readonly router: VueRouter

  constructor(store: Store<any>, router: VueRouter) {
    super()

    this.id = 'files.sdk'
    this.label = 'Search all files ↵'
    this.previewSearch = new Preview(store, router)
    this.listSearch = new List(store)
    this.store = store
    this.router = router
  }

  public activate(term: string): void {
    this.router
      .push({
        name: 'search-provider-list',
        query: { term, provider: this.id }
      })
      .catch(() => {
        // Uncaught (in promise) NavigationDuplicated: Avoided redundant navigation to current location: "/search/list/files.global?term=a"
      })
  }

  public reset(): void {
    /* not needed */
  }

  public updateTerm(): void {
    /* not needed */
  }

  public get available(): boolean {
    const { hideSearchBar } = this.store.getters['Search/options']

    return !hideSearchBar
  }
}
