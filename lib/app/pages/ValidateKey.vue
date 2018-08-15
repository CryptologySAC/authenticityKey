<template>
  <div>
    <h1>Validate Key</h1>
    <qrcode-reader :video-constraints="{ facingMode: 'user' }"
                   @decode="onDecode"
                   :paused="paused"
                   :track="false"
                   class="code-reader"/>
  </div>
</template>


<script>
import { QrcodeReader } from 'vue-qrcode-reader'
import Service from '../service'

const service = new Service('http://localhost:4090/api')

export default {
  name:'validate',
  components: {
    QrcodeReader,
  },
  data () {
    return {
      paused: false
    }
  },
  methods: {
    onDecode (decodedString) {
      this.paused = true
      this.open(decodedString)
    },
    async open (data) {
      let message
      let title
      let isValid

      try {
        const parsedData = JSON.parse(data)
        const result = await service.get('verify/', parsedData)
        isValid = result.data.authentic
      } catch (e) {
        isValid = false
        console.error(e)
      }

      if (isValid) {
        title = '✅ Success!'
        message = `This item was successfuly verified!`
      } else {
        title = '❌ Warning!'
        message = `This item could not be verified!`
        console.error('Item could not be verified:', data)
      }

      this.$alert(message, title, {
        confirmButtonText: 'OK',
        callback: action => {
          this.paused = false
        }
      })
    }
  }
}
</script>


<style scoped>
h1 {
  text-align: center;
}
.code-reader {
  width: 100%;
  max-width: 400px;
  margin: auto;
}
</style>
