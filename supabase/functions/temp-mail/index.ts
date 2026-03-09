const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const API = 'https://api.mail.tm';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, token, address, password, messageId } = await req.json();
    const json = (r: Response) => r.json();

    // Get available domains
    if (action === 'domains') {
      const res = await fetch(`${API}/domains`);
      const data = await json(res);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create account
    if (action === 'create') {
      const res = await fetch(`${API}/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, password }),
      });
      const data = await json(res);
      if (!res.ok) {
        return new Response(JSON.stringify({ error: data }), {
          status: res.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get token
      const tokenRes = await fetch(`${API}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, password }),
      });
      const tokenData = await json(tokenRes);

      return new Response(JSON.stringify({ account: data, token: tokenData.token }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // List messages
    if (action === 'messages') {
      const res = await fetch(`${API}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await json(res);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Read single message
    if (action === 'read') {
      const res = await fetch(`${API}/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await json(res);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Delete account
    if (action === 'delete') {
      const meRes = await fetch(`${API}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const me = await json(meRes);
      await fetch(`${API}/accounts/${me.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
