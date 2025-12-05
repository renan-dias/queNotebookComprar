import { GoogleGenAI } from "@google/genai";
import type { Tool } from "@google/genai";
import { Message, RecommendationMetadata } from '../types';

const SYSTEM_INSTRUCTION = `
Você é o "TechAdvisor", um consultor especialista em notebooks que age como um ser humano empático e investigativo.

PERFIL DE ATENDIMENTO:
1. **INVESTIGAÇÃO INTELIGENTE**: Não jogue especificações na cara do usuário. A maioria não sabe o que é "RAM" ou "SSD".
   - Em vez de perguntar "Quanto de RAM você quer?", pergunte: "Você costuma deixar muitas abas do navegador e programas abertos ao mesmo tempo?"
   - Em vez de perguntar "Quer placa de vídeo?", pergunte: "Você pretende jogar ou editar vídeos pesados?"
   - Se o usuário for vago (ex: "Quero um note bom"), FAÇA PERGUNTAS DE USO antes de recomendar.

2. **PRECISÃO CIRÚRGICA**: Quando recomendar, seja específico sobre o modelo (Ex: "Dell Inspiron 15 i1100" e não apenas "Um Dell i5").

3. **CONCISÃO**: Seus textos devem ser curtos e diretos. Deixe os detalhes técnicos para os CARDs visuais (JSON).

4. **LINKS E DADOS REAIS**: Use a ferramenta 'googleSearch' para encontrar links de compra ('url'), preços atuais e lojas ('store').
5. **DADOS LOCAIS**: Se o usuário perguntar onde comprar perto, use 'googleMaps' para indicar lojas reais.

ESTRUTURA DE RESPOSTA (JSON Opcional):
Se você já tiver informações suficientes para recomendar, gere o JSON abaixo. Se ainda estiver investigando o perfil, NÃO gere o JSON, apenas faça as perguntas no texto.

\`\`\`json
{
  "notebooks": [
    {
      "name": "Nome do Modelo Completo e Exato",
      "price": 1234.56,
      "specs": { "cpu": "i5-12450H", "ram": "8GB", "gpu": "RTX 3050", "storage": "512GB SSD", "screen": "15.6 FHD" },
      "pros": ["Ótimo para multitarefa (muitas abas)", "Roda jogos leves"],
      "cons": ["Bateria dura pouco"],
      "estimatedShipping": "Entrega Rápida",
      "url": "https://...",
      "store": "Nome da Loja"
    }
  ],
  "chartData": [
    { "name": "Modelo A", "price": 3500, "store": "Amazon" },
    { "name": "Modelo B", "price": 3200, "store": "Kabum" }
  ]
}
\`\`\`
Responda SEMPRE em Português do Brasil.
`;

export const sendMessage = async (
  history: Message[], 
  currentMessage: string,
  userLocation?: { lat: number; lng: number }
): Promise<{ text: string, metadata?: RecommendationMetadata }> => {
  
  try {
    // Check if key is available
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY not found in process.env");
      return { text: "Erro de configuração: Chave de API não encontrada. Por favor, configure a chave API_KEY." };
    }

    // Initialize inside the function to avoid load-time crashes if environment is not ready
    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-2.5-flash';
    
    // Tools configuration
    const tools: Tool[] = [{ googleSearch: {} }];
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
      },
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }))
    });

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
        .filter((c: any) => c.maps?.title || c.groundingChunk?.maps?.title) 
        .map((c: any) => {
             const place = c.maps || c.groundingChunk?.maps;
             return {
                name: place.title,
                address: place.address || "Ver no mapa",
                // Construct a search URL if specific URI is missing
                url: place.uri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.title)}`,
                latitude: 0, 
             };
        });


    // Extract JSON block if present
    let metadata: RecommendationMetadata = {
        groundingLinks,
        mapLocations
    };

    // Robust JSON extraction matching ```json ... ``` with DOTALL
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        
        // Sanitize Data
        if (parsed.notebooks) {
            parsed.notebooks = parsed.notebooks.map((nb: any) => ({
                ...nb,
                price: typeof nb.price === 'string' ? parseFloat(nb.price.replace(/[^\d.]/g, '')) : nb.price,
            }));
        }
        if (parsed.chartData) {
            parsed.chartData = parsed.chartData.map((d: any) => ({
                ...d,
                price: typeof d.price === 'string' ? parseFloat(d.price.replace(/[^\d.]/g, '')) : d.price,
            }));
        }

        metadata = { ...metadata, ...parsed };
      } catch (e) {
        console.warn("Failed to parse JSON from model response", e);
      }
    }

    // Clean text (remove JSON block)
    const cleanText = text.replace(/```json\s*[\s\S]*?\s*```/, '').trim();

    return { text: cleanText, metadata };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "Ocorreu um erro ao processar sua solicitação. Tente novamente." };
  }
};