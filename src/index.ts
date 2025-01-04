// src/index.ts
import { Env } from './types'
import { handleCallsRequest } from './handlers/calls'

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      })
    }

    // Route requests
    const url = new URL(request.url)
    
    if (request.method === 'GET' || request.method === 'POST') {
      return handleCallsRequest(request, env)
    }

    return new Response('Method not allowed', { status: 405 })
  }
}