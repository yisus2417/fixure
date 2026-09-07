import { Torneo } from './types';

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

export async function guardarTorneoKV(torneo: Torneo): Promise<boolean> {
  if (!KV_URL || !KV_TOKEN) {
    console.warn('Vercel KV no configurado, usando localStorage');
    return false;
  }

  try {
    const response = await fetch(`${KV_URL}/set/fixture_${torneo.comparteHash}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KV_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(torneo),
    });
    return response.ok;
  } catch (error) {
    console.error('Error guardando en KV:', error);
    return false;
  }
}

export async function obtenerTorneoKV(hash: string): Promise<Torneo | null> {
  if (!KV_URL || !KV_TOKEN) {
    console.warn('Vercel KV no configurado, usando localStorage');
    return null;
  }

  try {
    const response = await fetch(`${KV_URL}/get/fixture_${hash}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${KV_TOKEN}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.value || null;
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo de KV:', error);
    return null;
  }
}

export async function eliminarTorneoKV(hash: string): Promise<boolean> {
  if (!KV_URL || !KV_TOKEN) {
    return false;
  }

  try {
    const response = await fetch(`${KV_URL}/del/fixture_${hash}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KV_TOKEN}`,
      },
    });
    return response.ok;
  } catch (error) {
    console.error('Error eliminando de KV:', error);
    return false;
  }
}
