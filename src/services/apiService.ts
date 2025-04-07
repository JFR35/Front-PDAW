import axios from 'axios'

const api = axios.create({
  baseURL: 'https://localhost:8085/api', // API base URL
  headers: {
    'Content-Type': 'application/json', // Set the content type to JSON
  },
  timeout: 10000, // Set a timedefault para Request
})

export default api
