import { Torneo } from './types';

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!UPSTASH_URL || !UPSTASH_TOKEN) {
  // In development, we might want to warn but not crash if we are not using KV.
  // However, for production sharing, KV is required.
  console.warn('Upstash Redis no configurado. Las funciones de compartir requerirán Upstash.');
  // We'll still allow the functions to be called; they will return false/null as before.
}

// Exporta las funciones tal como estaban, pero ahora lanzarán error si se intenta usar sin config?
// Mantengamos el comportamiento anterior para no romper cosas, pero podemos mejorar el mensaje.
export async function guardarTorneoKV(torneo: Torneo): Promise<boolean> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    console.warn('Upstash no configurado, guardando solo en localStorage');
    return false;
  }

  try {
    const response = await fetch(UPSTASH_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${UPSTASH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        command: 'SET',
        args: [`fixture_${torneo.comparteHash}`, JSON.stringify(torneo)]
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error guardando en Upstash:', error);
    return false;
  }
}

export async function obtenerTorneoKV(hash: string): Promise<Torneo | null> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    console.warn('Upstash no configurado, obteniendo solo de localStorage (devolverá null)');
    return null;
  }

  try {
    const response = await fetch(UPSTASH_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${UPSTASH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        command: 'GET',
        args: [`fixture_${hash}`]
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.result && data.result !== 'null') {
        return JSON.parse(data.result);
      }
      return null;
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo de Upstash:', error);
    return null;
  }
}

export async function eliminarTorneoKV(hash: string): Promise<boolean> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return false;
  }

  try {
    const response = await fetch(UPSTASH_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${UPSTASH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        command: 'DEL',
        args: [`fixture_${hash}`]
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error eliminando de Upstash:', error);
    return false;
  }
}
