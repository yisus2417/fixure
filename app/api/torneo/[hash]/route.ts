import { NextRequest, NextResponse } from 'next/server';
import { obtenerTorneoKV } from '@/lib/kv';

export async function GET(
  request: NextRequest,
  { params }: { params: { hash: string } }
) {
  const hash = params.hash;

  if (!hash) {
    return NextResponse.json({ error: 'Hash requerido' }, { status: 400 });
  }

  const storage = await obtenerTorneoKV(hash);

  if (!storage) {
    return NextResponse.json({ error: 'Torneo no encontrado' }, { status: 404 });
  }

  return NextResponse.json(storage);
}
