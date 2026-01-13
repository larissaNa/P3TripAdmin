import { supabase } from "@/infra/supabase";

async function enviarParaExpo(messages: any[]) {
  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    const data = await response.json();
    console.log("✅ Resposta da Expo Push API:", data);
    
  } catch (error) {
    console.error("❌ Erro ao contatar Expo Push API:", error);
  }
}

export const NotificationService = {
  /**
   * Registra o token do dispositivo no Supabase (Upsert)
   */
  async registrarToken(token: string) {
    try {
      const { error } = await supabase
        .from("push_tokens")
        .upsert(
          { 
            token, 
            updated_at: new Date().toISOString() 
          },
          { onConflict: "token" }
        );

      if (error) {
        console.error("❌ Erro ao salvar token push:", error);
      } else {
        console.log("✅ Token push salvo/atualizado com sucesso:", token);
      }
    } catch (err) {
      console.error("❌ Erro inesperado ao salvar token:", err);
    }
  },

  /**
   * Envia notificação push para todos os dispositivos registrados
   */
  async notificarNovaViagem(titulo: string, destino: string) {
    try {
      console.log("🔔 Iniciando envio de notificações...");

      // 1. Buscar todos os tokens registrados
      const { data: tokens, error } = await supabase
        .from("push_tokens")
        .select("token");

      if (error) {
        console.error("❌ Erro ao buscar tokens:", error);
        return;
      }

      if (!tokens || tokens.length === 0) {
        console.log("📭 Nenhum dispositivo registrado para receber notificação.");
        return;
      }

      console.log(`📱 Encontrados ${tokens.length} dispositivos.`);

      // 2. Preparar as mensagens para o formato do Expo
      const messages = tokens.map((t: any) => ({
        to: t.token,
        sound: "default",
        title: "Nova Viagem Disponível! ✈️",
        body: `${titulo} para ${destino} acaba de ser cadastrada. Confira!`,
        data: { url: "/viagens" }, // Dado extra opcional
      }));

      // 3. Enviar para a API da Expo em lotes (chunks)
      // A API da Expo aceita arrays de mensagens
      await enviarParaExpo(messages);
      
    } catch (err) {
      console.error("❌ Erro inesperado ao enviar notificações:", err);
    }
  },

  enviarParaExpo
};
