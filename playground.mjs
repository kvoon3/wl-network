/* eslint-disable antfu/no-import-dist */
/* eslint-disable no-console */
// @ts-check

import http from 'node:http'
import { createFetch } from './dist/index.js'

const HOST = '127.0.0.1'
const PORT = 3000

const server = http.createServer((req, res) => {
  // Simple routing
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('Hello, world!\n')
  }
  else if (req.url === '/time') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ now: new Date() }))
  }
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('Not Found\n')
  }
})

server.listen(PORT, HOST, async () => {
  const url = `http://${HOST}:${PORT}/`
  console.log(`Server running at ${url}`)

  const $fetch = createFetch()
  $fetch.hook('request:prepare', (ctx) => {
    console.log('ctx', ctx)
  })

  const res = await $fetch(
    url,
    {
      baseURL: '',
      method: 'get',
      headers: {
        'Content-Type': 'text/plain',
      },
    },
  )
  console.log('res', res)
})
