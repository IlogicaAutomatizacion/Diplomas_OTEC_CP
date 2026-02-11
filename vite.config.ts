import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default ({ mode }: { mode: string }) => {

  return defineConfig({

    plugins: [react(), tailwindcss()],
    base: '/Diplomas_OTEC_CP/',
    server: {
      host: "0.0.0.0",
      port: 5173,
      allowedHosts: true
    },
    
    build: {
      sourcemap: false,
      manifest: true
    }
  })

}
