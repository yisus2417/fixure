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

  const success = await eliminarTorneoKV(hash);

  if (success) {
    return NextResponse.json({ success: true, message: 'Torneo eliminado de KV' });
  } else {
    return NextResponse.json({ success: false, message: 'No se pudo eliminar de KV' }, { status: 500 });
  }
}
