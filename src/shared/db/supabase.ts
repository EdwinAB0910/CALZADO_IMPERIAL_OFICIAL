import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Crear cliente de Supabase solo si las variables están configuradas
let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.warn('Error al inicializar Supabase:', error);
    supabase = null;
  }
} else {
  console.warn('Variables de entorno de Supabase no configuradas. Se usarán datos estáticos como fallback.');
}

// Exportar función que retorna el cliente o null
export function getSupabaseClient(): SupabaseClient | null {
  return supabase;
}

// Exportar el cliente directamente para compatibilidad
export { supabase };

