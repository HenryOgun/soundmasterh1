import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/soundmasterh1/',
  server: {
    port: 3002,
    open: true,
    host: true,
    allowedHosts: [
      '3e6cc8ffa446.ngrok-free.app',
      '.ngrok-free.app',
      '.ngrok.io'
    ]
  }
})