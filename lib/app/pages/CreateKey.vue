<template>
  <div>
    <h1>Create your key</h1>
    <el-form ref="form" :model="form" label-width="150px">
      <el-form-item label="Passphrase" prop="passphrase1">
        <el-input type="password" v-model="form.passphrase1" auto-complete="off"></el-input>
      </el-form-item>

      <el-form-item label="Second passphrase" prop="passphrase2">
        <el-input type="password" v-model="form.passphrase2" auto-complete="off"></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="onSubmit">Create</el-button>
        <el-button>Cancel</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import VueQrcode from '@xkeshi/vue-qrcode'
import Service from '../service'

const service = new Service('http://localhost:4090/api')

export default {
  name: 'create',
  components: {
    'qrcode': VueQrcode
  },
  data() {
    return {
      form: {
        passphrase1: '',
        passphrase2: ''
      }
    }
  },
  methods: {
    async onSubmit () {
      let isValid
      let title
      let message
      let data

      const postData = {
        seed: this.form.passphrase1,
        secondSecret: this.form.passphrase2
      }
      try {
        const result = await service.post('add/', postData)
        isValid = result.data.authentic
        data = {
          tx: result.data.transactionId,
          signature: result.data.signature
        }
      } catch (e) {
        console.error(e)
        isValid = false
      }

      const h = this.$createElement
      if (isValid) {
        title = '✅ Key created!'
        const props = {
          value: JSON.stringify(data),
          options: { foreground: '#f1373a', backgroundAlpha: 0, size: 300 }
        }
        const style = { margin: 'auto', display: 'block' }
        message = h(VueQrcode, { props, style })
      } else {
        title = '⚠️ Something went wrong'
        message = `Unfortunately we weren't able to create a key.`
      }

      this.$alert(message, title, {
        confirmButtonText: 'OK',
        dangerouslyUseHTMLString: true
      })
    }
  }
}
</script>


<style scoped>
h1 {
  text-align: center;
}
</style>
