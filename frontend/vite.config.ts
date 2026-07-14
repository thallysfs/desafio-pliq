import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // A API só libera CORS para http://localhost:5173 (Cors__FrontendOrigin).
    // strictPort faz o dev server falhar em voz alta se a 5173 estiver ocupada,
    // em vez de cair na 5174 silenciosamente — o que quebraria as chamadas por CORS.
    port: 5173,
    strictPort: true,
  },
})
