import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 開發時用 /，部署到 GitHub Pages 時用 repo 路徑
  base: process.env.NODE_ENV === 'production' ? '/Attendance-sheet/' : '/',
})
