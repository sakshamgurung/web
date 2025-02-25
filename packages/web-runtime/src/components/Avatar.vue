<template>
  <component :is="type" :aria-hidden="true">
    <oc-spinner
      v-if="loading"
      key="avatar-loading"
      :style="`width: ${width}px; height: ${width}px;`"
    />
    <oc-avatar
      v-else
      key="avatar-loaded"
      :width="width"
      :src="avatarSource"
      :user-name="userName"
    />
  </component>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Avatar',
  props: {
    /**
     * The html element used for the avatar container.
     * `div, span`
     */
    type: {
      type: String,
      default: 'div',
      validator: value => {
        return value.match(/(div|span)/)
      }
    },
    userName: {
      type: String,
      default: ''
    },
    userid: {
      /**
       * Allow empty string to show placeholder
       */
      type: String,
      default: ''
    },
    width: {
      type: Number,
      required: false,
      default: 42
    }
  },
  data() {
    return {
      /**
       * Set to object URL when loaded, or on failure, icon placeholder is shown
       */
      avatarSource: '',
      /**
       * Shows spinner in place whilst loading avatar from server
       */
      loading: true
    }
  },
  computed: {
    ...mapGetters(['getToken', 'capabilities', 'configuration'])
  },
  watch: {
    userid: function(userid) {
      this.setUser(userid)
    }
  },
  mounted: function() {
    if (this.userid !== '') {
      this.setUser(this.userid)
    } else {
      this.loading = false
    }
  },
  methods: {
    /**
     * Load a new avatar from this userid
     */
    setUser(userid) {
      this.loading = true
      this.avatarSource = ''
      if (!this.capabilities.files_sharing.user.profile_picture || userid === '') {
        this.loading = false
        return
      }
      const headers = new Headers()
      const instance = this.configuration.server || window.location.origin
      const url = instance + 'remote.php/dav/avatars/' + userid + '/128.png'
      headers.append('Authorization', 'Bearer ' + this.getToken)
      headers.append('X-Requested-With', 'XMLHttpRequest')
      fetch(url, { headers })
        .then(response => {
          if (response.ok) {
            return response.blob()
          }
          if (response.status !== 404) {
            throw new Error(`Unexpected status code ${response.status}`)
          }
        })
        .then(blob => {
          this.loading = false
          if (blob) {
            this.avatarSource = window.URL.createObjectURL(blob)
          } else {
            // 404, none found
            this.avatarSource = ''
          }
        })
        .catch(error => {
          this.avatarSource = ''
          this.loading = false
          console.error(`Error loading avatar image for user "${userid}": `, error.message)
        })
    }
  }
}
</script>
