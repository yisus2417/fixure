'use client';

import { useState, useEffect, useCallback } from 'react';
import { Usuario, Torneo } from './types';
import { generarShareHash } from './fixture';

const USUARIOS_KEY = 'futsal_usuarios';
const TORNEOS_KEY = 'futsal_torneos';
const CURRENT_USER_KEY = 'futsal_current_user';

function generarId(): string {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Hook para gestionar usuarios (auth simple)
 */
export function useAuth() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    if (stored) {
      setUsuario(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const registrar = useCallback((email: string, nombre: string) => {
    const usuarios: Usuario[] = JSON.parse(localStorage.getItem(USUARIOS_KEY) || '[]');
    
    if (usuarios.find(u => u.email === email)) {
      throw new Error('Este email ya está registrado');
    }

    const nuevoUsuario: Usuario = {
      id: generarId(),
      email,
      nombre,
      createdAt: Date.now()
    };

    usuarios.push(nuevoUsuario);
    localStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(nuevoUsuario));
    setUsuario(nuevoUsuario);
    return nuevoUsuario;
  }, []);

  const login = useCallback((email: string) => {
    const usuarios: Usuario[] = JSON.parse(localStorage.getItem(USUARIOS_KEY) || '[]');
    const user = usuarios.find(u => u.email === email);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    setUsuario(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setUsuario(null);
  }, []);

  return { usuario, loading, registrar, login, logout };
}

/**
 * Hook para gestionar torneos
 */
export function useTorneos() {
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const { usuario } = useAuth();

  useEffect(() => {
    if (usuario) {
      const stored = localStorage.getItem(`${TORNEOS_KEY}_${usuario.id}`);
      setTorneos(stored ? JSON.parse(stored) : []);
    } else {
      setTorneos([]);
    }
  }, [usuario]);

  const guardarTorneos = useCallback((nuevos: Torneo[]) => {
    if (!usuario) return;
    localStorage.setItem(`${TORNEOS_KEY}_${usuario.id}`, JSON.stringify(nuevos));
    setTorneos(nuevos);
  }, [usuario]);

  const crearTorneo = useCallback((nombre: string, formato: 'liga' | 'eliminacion' | 'grupos', modalidad: string, numGrupos: number = 2) => {
    if (!usuario) throw new Error('No hay usuario');

    const nuevoTorneo: Torneo = {
      id: generarId(),
      nombre,
      formato,
      modalidad,
      numGrupos,
      creadorId: usuario.id,
      creadorNombre: usuario.nombre,
      equipos: [],
      partidos: [],
      estado: 'proximo',
      creadoEn: Date.now(),
      comparteHash: generarShareHash()
    };

    const actual = [...torneos, nuevoTorneo];
    guardarTorneos(actual);
    return nuevoTorneo;
  }, [torneos, usuario, guardarTorneos]);

  const actualizarTorneo = useCallback((id: string, data: Partial<Torneo>) => {
    const actual = torneos.map(t => t.id === id ? { ...t, ...data } : t);
    guardarTorneos(actual);
  }, [torneos, guardarTorneos]);

  const eliminarTorneo = useCallback((id: string) => {
    const actual = torneos.filter(t => t.id !== id);
    guardarTorneos(actual);
  }, [torneos, guardarTorneos]);

  const obtenerTorneoPorHash = useCallback((hash: string): Torneo | null => {
    // Buscar en todos los torneos de todos los usuarios
    const usuarios: Usuario[] = JSON.parse(localStorage.getItem(USUARIOS_KEY) || '[]');
    
    for (const user of usuarios) {
      const stored = localStorage.getItem(`${TORNEOS_KEY}_${user.id}`);
      if (stored) {
        const torneos: Torneo[] = JSON.parse(stored);
        const torneo = torneos.find(t => t.comparteHash === hash);
        if (torneo) return torneo;
      }
    }
    return null;
  }, []);

  return {
    torneos,
    crearTorneo,
    actualizarTorneo,
    eliminarTorneo,
    obtenerTorneoPorHash
  };
}
