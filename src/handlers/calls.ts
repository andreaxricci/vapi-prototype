import { createClient } from '@supabase/supabase-js'
import { Env } from '../types'

interface ErrorResponse {
  error: string
}

interface VapiToolCallFunction {
  name: string
  arguments: {
    customerName?: string
  }
}

interface VapiToolCall {
  id: string
  type: string
  function: VapiToolCallFunction
}

interface VapiRequestPayload {
  message: {
    timestamp: number
    type: string
    toolCalls: VapiToolCall[]
    toolCallList: VapiToolCall[]
    toolWithToolCallList: any[] 
  }
}

export async function handleCallsRequest(request: Request, env: Env): Promise<Response> {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY)
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 
    'Access-Control-Allow-Headers': 'Content-Type',
  }  

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    })
  }

  try {
    if (request.method === 'POST') {
      const payload: VapiRequestPayload = await request.json()
      console.log('payload:', payload)

      // Extract the first tool call from the payload
      const toolCall = payload.message.toolCalls[0]
      const toolCallId = toolCall.id
      const customerName = toolCall.function.arguments.customerName

      let query = supabase
        .from('calls_history')
        .select('*', { count: 'exact' })

      if (customerName) {
        query = query.ilike('customer_name', `%${customerName}%`)
      }

      const { data, error, count } = await query
        .range(0, 9)
        .order('created_at', { ascending: false })

      if (error) throw error

      return new Response(
        JSON.stringify({
          results: [
            {
              toolCallId,
              result: { data, count, limit: 10, offset: 0 },
            },
          ],
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }

    if (request.method === 'GET') {
      const url = new URL(request.url)
      const customerName = url.searchParams.get('customerName')
      const limit = parseInt(url.searchParams.get('limit') || '10')
      const offset = parseInt(url.searchParams.get('offset') || '0')

      let query = supabase
        .from('calls_history')
        .select('*', { count: 'exact' })

      if (customerName) {
        query = query.ilike('customer_name', `%${customerName}%`)
      }

      const { data, error, count } = await query
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })

      if (error) throw error

      return new Response(
        JSON.stringify({ data, count, limit, offset }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  } catch (error: unknown) {
    console.error('Error processing request:', error)
    
    const errorResponse: ErrorResponse = {
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    }

    return new Response(
      JSON.stringify({
        results: [
          {
            toolCallId: 'unknown',
            result: errorResponse,
          },
        ],
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )
  }
}