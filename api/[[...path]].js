/**
 * Vercel Serverless：將 /api/* 請求轉給 Express app。
 * 部署時請在 Vercel 設定 SUPABASE_URL、SUPABASE_SERVICE_ROLE_KEY、JWT_SECRET。
 */
import app from '../server/app.js'

export default function handler(req, res) {
  return app(req, res)
}
