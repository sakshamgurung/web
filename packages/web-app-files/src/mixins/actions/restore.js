import { mapActions } from 'vuex'
import { isTrashbinRoute } from '../../helpers/route'

export default {
  computed: {
    $_restore_items() {
      return [
        {
          icon: 'restore',
          label: () => this.$gettext('Restore'),
          handler: this.$_restore_trigger,
          isEnabled: () => isTrashbinRoute(this.$route),
          componentType: 'oc-button',
          class: 'oc-files-actions-restore-trigger'
        }
      ]
    }
  },
  methods: {
    ...mapActions('Files', ['resetFileSelection', 'addFileSelection', 'removeFilesFromTrashbin']),

    $_restore_trigger(resource) {
      this.resetFileSelection()
      this.addFileSelection(resource)
      this.$client.fileTrash
        .restore(resource.id, resource.path)
        .then(() => {
          this.removeFilesFromTrashbin([resource])
          const translated = this.$gettext('%{file} was restored successfully')
          this.showMessage({
            title: this.$gettextInterpolate(translated, { file: resource.name }, true),
            autoClose: {
              enabled: true
            }
          })
        })
        .catch(error => {
          const translated = this.$gettext('Restoration of %{file} failed')
          this.showMessage({
            title: this.$gettextInterpolate(translated, { file: resource.name }, true),
            desc: error.message,
            status: 'danger',
            autoClose: {
              enabled: true
            }
          })
        })

      this.resetFileSelection()
    }
  }
}
