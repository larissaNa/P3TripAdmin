import { supabase, BUCKET_NAME } from "@/infra/supabase";
import { Viagem, ViagemInput } from "@/model/entities/Viagem";

export const ViagemRepository = {

  // -------------------------------------------------------
  // LISTAGEM
  // -------------------------------------------------------
  async getAll(): Promise<Viagem[]> {
    const { data, error } = await supabase
      .from("viagem")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  // -------------------------------------------------------
  // BUSCAR POR ID
  // -------------------------------------------------------
  async getById(id: string): Promise<Viagem | null> {
    const { data, error } = await supabase
      .from("viagem")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // -------------------------------------------------------
  // CRIAR
  // -------------------------------------------------------
  async create(viagem: ViagemInput): Promise<Viagem> {
    const { data, error } = await supabase
      .from("viagem")
      .insert(viagem)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // -------------------------------------------------------
  // ATUALIZAR
  // -------------------------------------------------------
  async update(id: string, viagem: Partial<ViagemInput>): Promise<Viagem> {
    const { data, error } = await supabase
      .from("viagem")
      .update(viagem)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // -------------------------------------------------------
  // DELETAR
  // -------------------------------------------------------
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("viagem")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  // =======================================================
  // STORAGE
  // =======================================================

  /**
   * Upload de múltiplas imagens.
   * Retorna URLs públicas das imagens enviadas.
   */
  async uploadImages(files: File[], viagemId: string): Promise<string[]> {
    const urls: string[] = [];

    for (const file of files) {
      const fileName = `${viagemId}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase
        .storage
        .from(BUCKET_NAME)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const publicUrl = supabase
        .storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName)
        .data.publicUrl;

      urls.push(publicUrl);
    }

    return urls;
  },

  // -------------------------------------------------------
  // DELETAR IMAGENS
  // -------------------------------------------------------
  async deleteImages(imageUrls: string[]) {
    if (!imageUrls || imageUrls.length === 0) return;

    const paths = imageUrls.map((url) => {
      // Extrai correto: bucket/viagemId/file.jpg → viagemId/file.jpg
      const path = url.split(`${BUCKET_NAME}/`)[1];
      return path;
    });

    const { error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .remove(paths);

    if (error) throw error;
  }
};
