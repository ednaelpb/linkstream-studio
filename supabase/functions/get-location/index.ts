import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP from headers
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

    // Use free IP geolocation API
    const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city`);
    const geo = await geoRes.json();

    const result = {
      country: geo.status === "success" ? geo.country : null,
      city: geo.status === "success" ? geo.city : null,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Geolocation error:", error);
    return new Response(JSON.stringify({ country: null, city: null }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
