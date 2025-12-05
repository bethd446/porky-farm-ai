import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FormulationRequest {
  pigCategory: string;
  targetWeight: number;
  budget?: number;
  availableIngredients?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pigCategory, targetWeight, budget, availableIngredients }: FormulationRequest = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build the prompt for feed formulation
    const systemPrompt = "Tu es un expert en nutrition porcine en Afrique de l'Ouest. Tu dois créer des formules alimentaires optimisées pour les porcs en utilisant des ingrédients locaux disponibles.\n\nTu dois répondre UNIQUEMENT avec un objet JSON valide, sans aucun texte avant ou après. Le format exact est:\n{\n  \"ingredients\": [\n    {\"name\": \"string\", \"percentage\": number, \"cost_per_kg\": number}\n  ],\n  \"nutritionalValues\": {\n    \"protein\": number,\n    \"energy\": number,\n    \"fiber\": number,\n    \"calcium\": number,\n    \"phosphorus\": number,\n    \"lysine\": number\n  },\n  \"costPerKg\": number,\n  \"recommendations\": \"string\"\n}";

    const defaultIngredients = "Utilise les ingrédients courants en Afrique de l Ouest: mais, tourteau de soja, son de ble, farine de poisson, manioc, tourteau d arachide";
    
    const userPrompt = "Cree une formule alimentaire optimisee pour:\n" +
      "- Categorie: " + pigCategory + "\n" +
      "- Poids cible: " + targetWeight + " kg\n" +
      (budget ? "- Budget maximum: " + budget + " FCFA/kg\n" : "") +
      (availableIngredients ? "- Ingredients disponibles: " + availableIngredients : "- " + defaultIngredients) +
      "\n\nLes couts doivent etre en FCFA. Assure-toi que les pourcentages totalisent 100%.";

    console.log('Calling Lovable AI for feed formulation...');

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + LOVABLE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requetes atteinte. Veuillez reessayer plus tard." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits insuffisants. Veuillez recharger votre compte." }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error("AI gateway error: " + response.status);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("AI response content:", content);

    // Parse the JSON response
    let formulation;
    try {
      // Try to extract JSON from the response (handle markdown code blocks)
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      formulation = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Return a default formulation if parsing fails
      formulation = {
        ingredients: [
          { name: "Mais", percentage: 55, cost_per_kg: 200 },
          { name: "Tourteau de soja", percentage: 25, cost_per_kg: 450 },
          { name: "Son de ble", percentage: 12, cost_per_kg: 150 },
          { name: "Farine de poisson", percentage: 5, cost_per_kg: 800 },
          { name: "Premix vitamines", percentage: 2, cost_per_kg: 2500 },
          { name: "Sel/Calcaire", percentage: 1, cost_per_kg: 90 }
        ],
        nutritionalValues: {
          protein: 18,
          energy: 3150,
          fiber: 4.5,
          calcium: 0.8,
          phosphorus: 0.6,
          lysine: 0.95
        },
        costPerKg: 285,
        recommendations: "Cette formule est adaptee pour la categorie selectionnee. Assurez-vous de la disponibilite des ingredients localement."
      };
    }

    return new Response(JSON.stringify(formulation), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in generate-feed-formulation:", error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
