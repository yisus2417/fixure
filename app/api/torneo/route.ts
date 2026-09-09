import { NextRequest, NextResponse } from 'next/server';
import { Torneo } from '@/lib/types';
import { guardarTorneoKV } from '@/lib/kv';

export async function POST(request: NextRequest) {
  try {
    const torneo: Torneo = await request.json();

    if (!torneo || !torneo.comparteHash) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    // Verificar si Upstash está configurado
    const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
    const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!UPSTASH_URL || !UPSTASH_TOKEN) {
      return NextResponse.json(
        { error: 'Upstash no configurado en el servidor' },
        { status: 503 }
      );
    }

    const success = await guardarTorneoKV(torneo);

    if (success) {
      return NextResponse.json({ success: true, message: 'Torneo guardado en KV' });
    } else {
      return NextResponse.json({ success: false, message: 'No se pudo guardar en KV' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error en API guardar torneo:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
