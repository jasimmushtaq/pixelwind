// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { folder, public_id } = await req.json()
    const timestamp = Math.round(new Date().getTime() / 1000)
    const apiSecret = Deno.env.get('CLOUDINARY_API_SECRET')

    if (!apiSecret) {
      throw new Error('CLOUDINARY_API_SECRET is not set')
    }

    // Cloudinary signature generation logic: 
    // string to sign: folder=<folder>&public_id=<public_id>&timestamp=<timestamp><api_secret>
    const params: string[] = []
    if (folder) params.push(`folder=${folder}`)
    if (public_id) params.push(`public_id=${public_id}`)
    params.push(`timestamp=${timestamp}`)
    
    const stringToSign = params.sort().join('&') + apiSecret
    
    // Hash using SHA-1
    const encoder = new TextEncoder()
    const data = encoder.encode(stringToSign)
    const hashBuffer = await crypto.subtle.digest("SHA-1", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    return new Response(
      JSON.stringify({ signature, timestamp }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
