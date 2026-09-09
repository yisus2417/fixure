import { NextRequest, NextResponse } from 'next/server';
import { obtenerTorneoKV, eliminarTorneoKV } from '@/lib/kv';

export async function GET(
  request: NextRequest,
  { params }: { params: { hash: string } }
) {
  const hash = params.hash;

  if (!hash) {
    return NextResponse.json({ error: 'Hash requerido' }, { status: 400 });
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

  const storage = await obtenerTorneoKV(hash);

  if (!storage) {
    return NextResponse.json({ error: 'Torneo no encontrado' }, { status: 404 });
  }

  return NextResponse.json(storage);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { hash: string } }
) {
  const hash = params.hash;

  if (!hash) {
    return NextResponse.json({ error: 'Hash requerido' }, { status: 400 });
  }

  const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
  const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return NextResponse.json(
      { error: 'Upstash no configurado en el servidor' },
      { status: 503 }
    );
  }

  const success = await eliminarTorneoKV(hash);

  if (success) {
    return NextResponse.json({ success: true, message: 'Torneo eliminado de KV' });
  } else {
    return NextResponse.json({ success: false, message: 'No se pudo eliminar de KV' }, { status: 500 });
  }
}
