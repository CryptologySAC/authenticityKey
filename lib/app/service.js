import axios from 'axios'

export default class Service {
  constructor (server) {
    this.server = server
  }

  async get (path, params) {
    const response = await axios.get(`${this.server}/${path}`, {params})
    return response.data
  }

  async post (path, data) {
    const response = await axios.post(`${this.server}/${path}`, data)
    return response.data
  }
}
