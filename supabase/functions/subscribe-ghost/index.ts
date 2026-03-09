const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, siteUrl } = await req.json();

    if (!email || !siteUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing email or siteUrl' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Ghost's public magic link endpoint for member signup
    const endpoint = `${siteUrl.replace(/\/$/, '')}/members/api/send-magic-link/`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        emailType: 'subscribe',
        autoRedirect: true,
      }),
    });

    const text = await res.text();

    if (res.ok || res.status === 201) {
      return new Response(
        JSON.stringify({ success: true, message: 'Magic link sent — check your email to confirm' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: `Ghost returned HTTP ${res.status}`, detail: text }),
      { status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
