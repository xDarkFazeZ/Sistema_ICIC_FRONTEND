/**
 * useCamposCurso.ts
 *
 * Hook que centraliza la lógica de campos según el tipo de curso:
 *  - ABIERTO  → 3 precios (afiliado, público, estudiante) independientes
 *  - CERRADO  → precio por participante + número de participantes = total
 *
 * También expone helpers de validación y construcción del payload de precios.
 */

import { useState, useMemo } from "react";

export type TipoCurso = "ABIERTO" | "CERRADO";

// ── Estado de precios para curso abierto ──────────────────────────────────────
export interface PreciosAbierto {
  precioAfiliado:   string;
  precioPublico:    string;
  precioEstudiante: string;
}

// ── Estado de precios para curso cerrado ──────────────────────────────────────
export interface PreciosCerrado {
  precioPorParticipante: string;
  numParticipantes:      string;
}

// ── Retorno del hook ──────────────────────────────────────────────────────────
export interface UseCamposCursoReturn {
  tipoCurso: TipoCurso;

  // Abierto
  preciosAbierto: PreciosAbierto;
  setPreciosAbierto: React.Dispatch<React.SetStateAction<PreciosAbierto>>;

  // Cerrado
  preciosCerrado: PreciosCerrado;
  setPreciosCerrado: React.Dispatch<React.SetStateAction<PreciosCerrado>>;

  // Calculados (solo cerrado)
  costoTotal:    number;
  numP:          number;
  precioPorP:    number;

  // Helpers
  resetPrecios:  () => void;
  buildPreciosPayload: () => {
    precioAfiliado:   number;
    precioPublico:    number;
    precioEstudiante: number;
  };
  validatePrecios: () => Record<string, string>;
}

const ABIERTO_INITIAL: PreciosAbierto = {
  precioAfiliado:   "",
  precioPublico:    "",
  precioEstudiante: "",
};

const CERRADO_INITIAL: PreciosCerrado = {
  precioPorParticipante: "",
  numParticipantes:      "1",
};

export function useCamposCurso(tipoCurso: TipoCurso): UseCamposCursoReturn {
  const [preciosAbierto, setPreciosAbierto] = useState<PreciosAbierto>({ ...ABIERTO_INITIAL });
  const [preciosCerrado, setPreciosCerrado] = useState<PreciosCerrado>({ ...CERRADO_INITIAL });

  // ── Valores calculados para cerrado ────────────────────────────────────────
  const precioPorP = useMemo(
    () => Math.max(0, Number(preciosCerrado.precioPorParticipante) || 0),
    [preciosCerrado.precioPorParticipante]
  );

  const numP = useMemo(
    () => Math.max(1, parseInt(preciosCerrado.numParticipantes) || 1),
    [preciosCerrado.numParticipantes]
  );

  const costoTotal = useMemo(() => precioPorP * numP, [precioPorP, numP]);

  // ── Reset ──────────────────────────────────────────────────────────────────
  const resetPrecios = () => {
    setPreciosAbierto({ ...ABIERTO_INITIAL });
    setPreciosCerrado({ ...CERRADO_INITIAL });
  };

  // ── Payload que va al backend ──────────────────────────────────────────────
  // Para curso cerrado los tres precios son iguales al precio por participante
  // (no al total — el total es informativo). Esto mantiene el schema sin cambios.
  const buildPreciosPayload = () => {
    if (tipoCurso === "CERRADO") {
      const precio = precioPorP;
      return {
        precioAfiliado:   precio,
        precioPublico:    precio,
        precioEstudiante: precio,
      };
    }
    return {
      precioAfiliado:   Number(preciosAbierto.precioAfiliado)   || 0,
      precioPublico:    Number(preciosAbierto.precioPublico)     || 0,
      precioEstudiante: Number(preciosAbierto.precioEstudiante) || 0,
    };
  };

  // ── Validación ─────────────────────────────────────────────────────────────
  const validatePrecios = (): Record<string, string> => {
    const e: Record<string, string> = {};

    if (tipoCurso === "CERRADO") {
      const p = Number(preciosCerrado.precioPorParticipante);
      if (preciosCerrado.precioPorParticipante === "" || isNaN(p) || p < 0)
        e.precioPorParticipante = "Ingresa un precio válido";
      const n = parseInt(preciosCerrado.numParticipantes);
      if (isNaN(n) || n < 1)
        e.numParticipantes = "Mínimo 1 participante";
    } else {
      const pA = Number(preciosAbierto.precioAfiliado);
      const pP = Number(preciosAbierto.precioPublico);
      const pE = Number(preciosAbierto.precioEstudiante);
      if (preciosAbierto.precioAfiliado   === "" || isNaN(pA)) e.precioAfiliado   = "Precio inválido";
      if (preciosAbierto.precioPublico    === "" || isNaN(pP)) e.precioPublico    = "Precio inválido";
      if (preciosAbierto.precioEstudiante === "" || isNaN(pE)) e.precioEstudiante = "Precio inválido";
      if (!e.precioAfiliado && !e.precioPublico && pA > pP)
        e.precioAfiliado = "Precio afiliado ≤ precio público";
    }

    return e;
  };

  return {
    tipoCurso,
    preciosAbierto,
    setPreciosAbierto,
    preciosCerrado,
    setPreciosCerrado,
    costoTotal,
    numP,
    precioPorP,
    resetPrecios,
    buildPreciosPayload,
    validatePrecios,
  };
}