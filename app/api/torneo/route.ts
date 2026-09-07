import { NextRequest, NextResponse } from 'next/server';
import { Torneo } from '@/lib/types';
import { guardarTorneoKV } from '@/lib/kv';

export async function POST(request: NextRequest) {
  try {
    const torneo: Torneo = await request.json();

    if (!torneo || !torneo.comparteHash) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const success = await guardarTorneoKV(torneo);

    if (success) {
      return NextResponse.json({ success: true, message: 'Torneo guardado en KV' });
    } else {
      return NextResponse.json({ success: false, message: 'KV no configurado, usando localStorage' });
    }
  } catch (error) {
    console.error('Error en API guardar torneo:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
