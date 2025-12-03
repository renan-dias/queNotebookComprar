import { GoogleGenAI, Type } from "@google/genai";
import { Message, RecommendationMetadata } from '../types';

// We must create a new instance each time we need a fresh config, or reuse if static.
// For browser usage with potentially changing API keys, dynamic instantiation is safer,
// but here we assume env var is stable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
Você é um especialista em tecnologia e assistente de compras de notebooks chamado "TechAdvisor".
Sua missão é ajudar o usuário a encontrar o notebook perfeito.

REGRAS RÍGIDAS:
1. Sempre use as ferramentas 'googleSearch' para obter preços e modelos atualizados.
2. Se o usuário perguntar sobre "onde comprar perto" ou lojas físicas, use 'googleMaps'.
3. Responda em Português do Brasil.
4. Tente formatar a resposta para que ela possa ser visualizada.
5. Seja objetivo, moderno e use termos técnicos de forma acessível.
6. Ao comparar preços, liste lojas reais encontradas na busca.

ESTRUTURA DE RESPOSTA (JSON Opcional):
Se você encontrou modelos específicos de notebooks, tente incluir um bloco JSON no final da sua resposta (após o texto explicativo) com a seguinte estrutura para que eu possa gerar gráficos:
\`\`\`json
{
  "notebooks": [
    {
      "name": "Nome do Modelo",
      "price": 0.00,
      "specs": { "cpu": "...", "ram": "...", "gpu": "...", "storage": "...", "screen": "..." },
      "pros": ["..."],
      "cons": ["..."],
      "estimatedShipping": "..."
    }
  ],
  "chartData": [
    { "name": "Modelo A", "price": 1000, "store": "Amazon" },
    { "name": "Modelo B", "price": 1200, "store": "Kabum" }
  ]
}
\`\`\`
Não invente dados. Use apenas dados da pesquisa. Se não achar, não mande o JSON.
`;

export const sendMessage = async (
  history: Message[], 
  currentMessage: string,
  userLocation?: { lat: number; lng: number }
): Promise<{ text: string, metadata?: RecommendationMetadata }> => {
  
  // Prepare contents from history
  // Note: Gemini 2.5 API might differ slightly in chat history format, 
  // but generateContent accepts a simple string or parts. 
  // For simplicity in this demo, we'll concatenate the last few messages or just send the prompt with context.
  // A proper ChatSession is better.
  
  try {
    const model = 'gemini-2.5-flash';
    
    // Tools configuration
    const tools: any[] = [{ googleSearch: {} }];
    if (userLocation) {
        // Add maps if we have location, useful for "lojas perto"
        tools.push({ googleMaps: {} });
    }

    const toolConfig = userLocation ? {
      retrievalConfig: {
        latLng: {
          latitude: userLocation.lat,
          longitude: userLocation.lng
        }
      }
    } : undefined;

    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools,
        toolConfig,
      }
    });

    // Provide some context from previous messages if needed, 
    // but strict history management can be complex with tools. 
    // We will just send the user message for this stateless-ish implementation or manage history manually.
    // For this implementation, we will treat it as a fresh query with context appended if needed.
    
    const response = await chat.sendMessage({
      message: currentMessage
    });

    const text = response.text || "Desculpe, não consegui encontrar informações no momento.";
    
    // Extract Grounding Metadata (Search URLs)
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingLinks = groundingChunks
      .filter((c: any) => c.web?.uri)
      .map((c: any) => ({ title: c.web.title, url: c.web.uri }));
    
    // Extract Maps Metadata
    const mapLocations = groundingChunks
        .filter((c: any) => c.maps?.title) // Basic check, real structure might vary
        .map((c: any) => ({
             name: c.maps.title,
             address: "Ver no Google Maps", // API might not return full address in chunk directly without deeper parsing
             latitude: 0, // Maps grounding usually gives snippet, not raw coords always. Keeping simple.
        }));


    // Extract JSON block if present
    let metadata: RecommendationMetadata = {
        groundingLinks
    };

    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        metadata = { ...metadata, ...parsed };
      } catch (e) {
        console.warn("Failed to parse JSON from model response", e);
      }
    }

    // Clean text (remove JSON block)
    const cleanText = text.replace(/```json\n[\s\S]*?\n```/, '').trim();

    return { text: cleanText, metadata };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "Ocorreu um erro ao processar sua solicitação. Tente novamente." };
  }
};
