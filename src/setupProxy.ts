import { Express } from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'

export default function (app: Express) {
  app.use(
    createProxyMiddleware('/auth/**', {
      target: 'http://localhost:5000',
    })
  )
}
