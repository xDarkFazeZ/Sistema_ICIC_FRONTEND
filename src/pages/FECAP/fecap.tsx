import { useState, useCallback, useEffect } from "react";
import {
  Card,
  Select,
  SelectItem,
  Button,
  Spinner,
  Chip,
  Tabs,
  Tab,
  Progress,
} from "@heroui/react";
import {
  CloudArrowUpIcon,
  DocumentArrowUpIcon,
  CheckCircleIcon,
  BuildingOfficeIcon,
  BanknotesIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/solid";
import * as XLSX from "xlsx";
import { sileo } from "sileo";
import Sidebar from "../../components/common/Sidebar";
import { fecapService } from "../../services/fecapService";

// ─── Tipos ─────────────────────────────────────────────────────────────────────

interface Factura {
  numero: string;
  dependencia: string;
  fecha: string;
  retencion: number;
  descuentos: number;
  uso: number;
  aFavor: number;
}

interface EmpresaSaldo {
  id: number;
  nombre: string;
  rfc: string;
  saldoFecapDisponible: number;
  saldoFecapAplicado: number;
}

interface Movimiento {
  id: number;
  tipoMovimiento: string;
  monto: number;
  concepto: string;
  saldoAnterior: number;
  saldoNuevo: number;
  creadoEn: string;
  inscripcion?: {
    id: number;
    curso?: { id: number; nombre: string };
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const parseMonto = (val: any): number => {
  if (!val) return 0;
  return parseFloat(val.toString().replace(/[$,\s]/g, "").trim()) || 0;
};

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(val);

const formatFecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const tipoColor = (tipo: string): "success" | "danger" | "warning" | "default" => {
  if (tipo === "CARGA_INICIAL") return "success";
  if (tipo === "APLICACION_CURSO") return "danger";
  if (tipo === "REVERSION") return "warning";
  return "default";
};

const tipoLabel: Record<string, string> = {
  CARGA_INICIAL: "Carga FECAP",
  APLICACION_CURSO: "Uso en curso",
  AJUSTE: "Ajuste",
  REVERSION: "Reversión",
};

// ─── Componente principal ──────────────────────────────────────────────────────

export default function Fecap() {
  // ── Compartido ──
  const [empresas, setEmpresas] = useState<EmpresaSaldo[]>([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);

  // ── Tab Carga ──
  const [empresaCarga, setEmpresaCarga] = useState<EmpresaSaldo | null>(null);
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [archivoNombre, setArchivoNombre] = useState("");
  const [dragging, setDragging] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [cargaExitosa, setCargaExitosa] = useState(false);

  // ── Tab Historial ──
  const [empresaHistorial, setEmpresaHistorial] = useState<EmpresaSaldo | null>(null);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [paginaHistorial, setPaginaHistorial] = useState(1);
  const [totalMovimientos, setTotalMovimientos] = useState(0);

  // ── Cargar empresas al montar ──
  useEffect(() => {
    fecapService.getEmpresasConSaldo()
      .then(setEmpresas)
      .catch(() => sileo.error({ title: "Error", description: "No se pudieron cargar las empresas" }))
      .finally(() => setLoadingEmpresas(false));
  }, []);

  // ── Cargar historial cuando cambia empresa o página ──
  useEffect(() => {
    if (!empresaHistorial) return;
    setLoadingHistorial(true);
    fecapService.getHistorial(empresaHistorial.id, paginaHistorial)
      .then((res) => {
        setMovimientos(res.data.movimientos);
        setTotalMovimientos(res.pagination.total);
      })
      .catch(() => sileo.error({ title: "Error", description: "No se pudo cargar el historial" }))
      .finally(() => setLoadingHistorial(false));
  }, [empresaHistorial, paginaHistorial]);

  // ── Seleccionar empresa en tab carga ──
  const handleEmpresaCargaChange = (keys: any) => {
    const id = Number([...keys][0]);
    const emp = empresas.find((e) => e.id === id) || null;
    setEmpresaCarga(emp);
    setFacturas([]);
    setArchivoNombre("");
    setCargaExitosa(false);
    setProgreso(0);
  };

  // ── Seleccionar empresa en tab historial ──
  const handleEmpresaHistorialChange = (keys: any) => {
    const id = Number([...keys][0]);
    const emp = empresas.find((e) => e.id === id) || null;
    setEmpresaHistorial(emp);
    setPaginaHistorial(1);
    setMovimientos([]);
  };

  // ── Leer Excel ──
  const leerExcel = useCallback((file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls"].includes(ext || "")) {
      sileo.error({ title: "Archivo inválido", description: "Solo se aceptan .xlsx o .xls" });
      return;
    }
    setProcesando(true);
    setArchivoNombre(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        let headerIdx = -1;
        for (let i = 0; i < rows.length; i++) {
          if (rows[i]?.[0]?.toString().includes("No. Factura")) { headerIdx = i; break; }
        }
        if (headerIdx === -1) {
          sileo.error({ title: "Formato inválido", description: "No se encontró la fila de encabezados" });
          setProcesando(false);
          return;
        }

        const headers = rows[headerIdx].map((h: any) => h?.toString().trim());
        const resultado: Factura[] = [];

        for (let i = headerIdx + 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || !row[0] || row[0].toString().includes("TOTAL")) continue;

          const get = (col: string) => {
            const idx = headers.indexOf(col);
            return idx >= 0 ? row[idx] : "";
          };

          const dia = parseInt(get("DIA")) || 1;
          const mes = (parseInt(get("MES")) || 1) - 1;
          let año = parseInt(get("AÑO")) || 22;
          if (año < 100) año = 2000 + año;

          let fechaStr = "—";
          try {
            const d = new Date(año, mes, dia);
            if (!isNaN(d.getTime()))
              fechaStr = d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
          } catch {}

          const factura: Factura = {
            numero: get("No. Factura")?.toString().trim() || "—",
            dependencia: get("DEPENDENCIA")?.toString().trim() || "SIN DEPENDENCIA",
            fecha: fechaStr,
            retencion: parseMonto(get("RETENCIÓN")),
            descuentos: parseMonto(get("DESCUENTOS")),
            uso: parseMonto(get("USO")),
            aFavor: parseMonto(get("A FAVOR DE FACTURA")),
          };
          if (factura.numero !== "—") resultado.push(factura);
        }

        setFacturas(resultado);
        sileo.success({ title: "Excel procesado", description: `${resultado.length} facturas encontradas` });
      } catch {
        sileo.error({ title: "Error al leer el archivo", description: "Verifica el formato del Excel" });
      } finally {
        setProcesando(false);
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) leerExcel(file);
  }, [leerExcel]);

  // ── Totales ──
  const totalAFavor    = facturas.reduce((s, f) => s + f.aFavor, 0);
  const totalRetencion = facturas.reduce((s, f) => s + f.retencion, 0);
  const saldoActual    = empresaCarga?.saldoFecapDisponible ?? 0;
  const saldoNuevo     = saldoActual + totalAFavor;

  // ── Confirmar carga con progress animado ──
  const handleConfirmar = async () => {
    if (!empresaCarga || totalAFavor <= 0) return;
    setConfirmando(true);
    setProgreso(0);

    // Simular progreso mientras se guarda
    const intervalo = setInterval(() => {
      setProgreso((prev) => {
        if (prev >= 85) { clearInterval(intervalo); return prev; }
        return prev + 15;
      });
    }, 200);

    try {
      await fecapService.cargarSaldo(empresaCarga.id, totalAFavor);
      clearInterval(intervalo);
      setProgreso(100);

      // Actualizar saldo local en la lista
      setEmpresas((prev) =>
        prev.map((e) =>
          e.id === empresaCarga.id ? { ...e, saldoFecapDisponible: saldoNuevo } : e
        )
      );
      setEmpresaCarga((prev) => prev ? { ...prev, saldoFecapDisponible: saldoNuevo } : prev);

      setTimeout(() => {
        setCargaExitosa(true);
        sileo.success({
          title: "Saldo cargado exitosamente",
          description: `Se agregaron ${formatCurrency(totalAFavor)} a ${empresaCarga.nombre}`,
        });
      }, 400);
    } catch {
      clearInterval(intervalo);
      setProgreso(0);
      sileo.error({ title: "Error", description: "No se pudo cargar el saldo. Intenta de nuevo." });
    } finally {
      setConfirmando(false);
    }
  };

  const handleNuevaCarga = () => {
    setFacturas([]);
    setArchivoNombre("");
    setCargaExitosa(false);
    setProgreso(0);
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black flex">
      <Sidebar />

      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800 dark:from-red-500 dark:to-red-700 mb-2">
              Control de Saldo FECAP
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Carga y consulta el saldo FECAP de cada empresa
            </p>
          </div>

          {/* ── Tabs principales ── */}
          <Tabs
            aria-label="Módulo FECAP"
            color="danger"
            variant="underlined"
            classNames={{
              tabList: "gap-6 border-b border-gray-200 dark:border-gray-800 w-full",
              tab: "max-w-fit px-0 h-12 font-semibold",
              cursor: "bg-red-600",
            }}
          >
            {/* ══════════════════════════════════════════
                TAB 1 — ACTUALIZAR SALDO
            ══════════════════════════════════════════ */}
            <Tab
              key="carga"
              title={
                <div className="flex items-center gap-2">
                  <ArrowTrendingUpIcon className="w-4 h-4" />
                  <span>Actualizar Saldo</span>
                </div>
              }
            >
              <div className="pt-6 space-y-6">

                {/* PASO 1 — Empresa */}
                <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-bold">1</div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Seleccionar empresa</h2>
                  </div>

                  {loadingEmpresas ? (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Spinner size="sm" color="danger" />
                      <span className="text-sm">Cargando empresas...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        label="Empresa"
                        placeholder="Selecciona una empresa"
                        onSelectionChange={handleEmpresaCargaChange}
                        classNames={{ trigger: "bg-gray-50 dark:bg-gray-800" }}
                      >
                        {empresas.map((emp) => (
                          <SelectItem key={emp.id} textValue={emp.nombre}>
                            <div>
                              <p className="font-medium">{emp.nombre}</p>
                              <p className="text-xs text-gray-400">{emp.rfc}</p>
                            </div>
                          </SelectItem>
                        ))}
                      </Select>

                      {empresaCarga && (
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                          <BuildingOfficeIcon className="w-8 h-8 text-red-500 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Saldo FECAP disponible</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                              {formatCurrency(empresaCarga.saldoFecapDisponible)}
                            </p>
                            <p className="text-xs text-gray-400">
                              Aplicado: {formatCurrency(empresaCarga.saldoFecapAplicado)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>

                {/* PASO 2 — Excel */}
                {empresaCarga && !cargaExitosa && (
                  <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-bold">2</div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Cargar archivo Excel</h2>
                    </div>

                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={onDrop}
                      onClick={() => document.getElementById("fileInputFecap")?.click()}
                      className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300
                        ${dragging
                          ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                          : "border-gray-300 dark:border-gray-700 hover:border-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/10"
                        }`}
                    >
                      <input id="fileInputFecap" type="file" accept=".xlsx,.xls" className="hidden"
                        onChange={(e) => { if (e.target.files?.[0]) leerExcel(e.target.files[0]); }} />

                      {procesando ? (
                        <div className="flex flex-col items-center gap-3">
                          <Spinner size="lg" color="danger" />
                          <p className="text-gray-500">Procesando archivo...</p>
                        </div>
                      ) : archivoNombre ? (
                        <div className="flex flex-col items-center gap-3">
                          <DocumentTextIcon className="w-12 h-12 text-red-500" />
                          <p className="font-semibold text-gray-900 dark:text-white">{archivoNombre}</p>
                          <p className="text-sm text-gray-500">{facturas.length} facturas · Haz clic para cambiar</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <CloudArrowUpIcon className="w-14 h-14 text-gray-300 dark:text-gray-600" />
                          <div>
                            <p className="font-semibold text-gray-700 dark:text-gray-300">Arrastra tu archivo Excel aquí</p>
                            <p className="text-sm text-gray-400 mt-1">o haz clic para seleccionar · .xlsx, .xls</p>
                          </div>
                          <Button size="sm" variant="flat" color="danger"
                            startContent={<DocumentArrowUpIcon className="w-4 h-4" />}>
                            Seleccionar archivo
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* PASO 3 — Tabla + Resumen */}
                {facturas.length > 0 && !cargaExitosa && (
                  <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-bold">3</div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Detalle de facturas</h2>
                      </div>
                      <Chip color="danger" variant="flat" size="sm">{facturas.length} facturas</Chip>
                    </div>

                    {/* Tabla */}
                    <div className="overflow-x-auto max-h-96">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 z-10">
                          <tr className="bg-gray-50 dark:bg-gray-800/90 text-left">
                            {["#","No. Factura","Dependencia","Fecha","Retención","Descuentos","Uso","A Favor"].map((h, i) => (
                              <th key={i} className={`px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 ${i >= 4 ? "text-right" : ""}`}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {facturas.map((f, i) => (
                            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                              <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                              <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{f.numero}</td>
                              <td className="px-4 py-3"><Chip size="sm" variant="flat">{f.dependencia}</Chip></td>
                              <td className="px-4 py-3 text-gray-500">{f.fecha}</td>
                              <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{formatCurrency(f.retencion)}</td>
                              <td className="px-4 py-3 text-right text-red-500">{f.descuentos > 0 ? `-${formatCurrency(f.descuentos)}` : "—"}</td>
                              <td className="px-4 py-3 text-right text-gray-500">{f.uso > 0 ? formatCurrency(f.uso) : "—"}</td>
                              <td className="px-4 py-3 text-right font-bold text-green-600 dark:text-green-400">{formatCurrency(f.aFavor)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Resumen */}
                    <div className="p-6 border-t border-gray-100 dark:border-gray-800 space-y-6">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Resumen de carga</h3>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
                          <p className="text-xs text-gray-500 mb-1">Total facturas</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{facturas.length}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-center">
                          <p className="text-xs text-blue-500 mb-1">Total retención</p>
                          <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{formatCurrency(totalRetencion)}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/20 text-center">
                          <p className="text-xs text-green-500 mb-1">Monto a cargar</p>
                          <p className="text-2xl font-bold text-green-700 dark:text-green-400">{formatCurrency(totalAFavor)}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 text-center border-2 border-red-200 dark:border-red-800">
                          <p className="text-xs text-red-500 mb-1">Saldo actual</p>
                          <p className="text-2xl font-bold text-red-700 dark:text-red-400">{formatCurrency(saldoActual)}</p>
                        </div>
                      </div>

                      {/* Saldo nuevo destacado */}
                      <div className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 text-white">
                        <div className="flex items-center gap-3">
                          <BanknotesIcon className="w-8 h-8 opacity-80" />
                          <div>
                            <p className="text-red-200 text-sm">Saldo nuevo después de la carga</p>
                            <p className="text-3xl font-bold">{formatCurrency(saldoNuevo)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-red-200 text-xs">Empresa</p>
                          <p className="font-semibold">{empresaCarga?.nombre}</p>
                        </div>
                      </div>

                      {/* Progress bar — visible solo al confirmar */}
                      {(confirmando || progreso > 0) && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{progreso < 100 ? "Guardando saldo..." : "¡Completado!"}</span>
                            <span>{progreso}%</span>
                          </div>
                          <Progress
                            value={progreso}
                            color={progreso === 100 ? "success" : "danger"}
                            className="w-full"
                            aria-label="Progreso de carga"
                          />
                        </div>
                      )}

                      {/* Botón confirmar */}
                      <Button
                        color="danger"
                        size="lg"
                        className="w-full font-bold text-base"
                        startContent={
                          confirmando
                            ? <Spinner size="sm" color="white" />
                            : <CheckCircleIcon className="w-5 h-5" />
                        }
                        onPress={handleConfirmar}
                        isDisabled={confirmando || totalAFavor <= 0}
                      >
                        {confirmando ? "Guardando..." : `Confirmar carga de ${formatCurrency(totalAFavor)}`}
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Estado éxito */}
                {cargaExitosa && (
                  <Card className="p-10 bg-white dark:bg-gray-900 border border-green-200 dark:border-green-800 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
                        <CheckCircleIcon className="w-12 h-12 text-green-500" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">¡Saldo cargado exitosamente!</h2>
                        <p className="text-gray-500">
                          Se agregaron <span className="font-bold text-green-600">{formatCurrency(totalAFavor)}</span> al saldo de{" "}
                          <span className="font-bold">{empresaCarga?.nombre}</span>
                        </p>
                        <p className="text-gray-500 mt-1">
                          Nuevo saldo: <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(saldoNuevo)}</span>
                        </p>
                      </div>
                      <Progress value={100} color="success" className="w-full max-w-xs" aria-label="Completado" />
                      <Button color="danger" variant="flat"
                        startContent={<ArrowPathIcon className="w-4 h-4" />}
                        onPress={handleNuevaCarga}>
                        Realizar otra carga
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            </Tab>

            {/* ══════════════════════════════════════════
                TAB 2 — HISTORIAL
            ══════════════════════════════════════════ */}
            <Tab
              key="historial"
              title={
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4" />
                  <span>Historial de Movimientos</span>
                </div>
              }
            >
              <div className="pt-6 space-y-6">

                {/* Selector empresa historial */}
                <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {loadingEmpresas ? (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Spinner size="sm" color="danger" />
                        <span className="text-sm">Cargando empresas...</span>
                      </div>
                    ) : (
                      <Select
                        label="Empresa"
                        placeholder="Selecciona una empresa para ver su historial"
                        onSelectionChange={handleEmpresaHistorialChange}
                        classNames={{ trigger: "bg-gray-50 dark:bg-gray-800" }}
                      >
                        {empresas.map((emp) => (
                          <SelectItem key={emp.id} textValue={emp.nombre}>
                            <div>
                              <p className="font-medium">{emp.nombre}</p>
                              <p className="text-xs text-gray-400">{emp.rfc}</p>
                            </div>
                          </SelectItem>
                        ))}
                      </Select>
                    )}

                    {empresaHistorial && (
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <BuildingOfficeIcon className="w-8 h-8 text-red-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Saldo FECAP disponible</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {formatCurrency(empresaHistorial.saldoFecapDisponible)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {totalMovimientos} movimiento{totalMovimientos !== 1 ? "s" : ""} registrado{totalMovimientos !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Timeline de movimientos */}
                {empresaHistorial && (
                  <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-3">
                        <ClockIcon className="w-5 h-5 text-red-500" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Historial — {empresaHistorial.nombre}
                        </h2>
                      </div>
                      {totalMovimientos > 0 && (
                        <Chip color="default" variant="flat" size="sm">{totalMovimientos} movimientos</Chip>
                      )}
                    </div>

                    {loadingHistorial ? (
                      <div className="flex justify-center items-center py-20">
                        <Spinner size="lg" color="danger" />
                      </div>
                    ) : movimientos.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <ClockIcon className="w-12 h-12 mb-3 opacity-30" />
                        <p className="font-medium">Sin movimientos registrados</p>
                        <p className="text-sm mt-1">Esta empresa aún no tiene historial de saldo</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {movimientos.map((mov) => (
                          <div key={mov.id} className="flex items-start gap-4 p-5 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                            {/* Indicador tipo */}
                            <div className={`w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0 ${
                              mov.tipoMovimiento === "CARGA_INICIAL"    ? "bg-green-500" :
                              mov.tipoMovimiento === "APLICACION_CURSO" ? "bg-red-500"   :
                              mov.tipoMovimiento === "REVERSION"        ? "bg-yellow-500":
                              "bg-gray-400"
                            }`} />

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <Chip
                                    size="sm"
                                    variant="flat"
                                    color={tipoColor(mov.tipoMovimiento)}
                                  >
                                    {tipoLabel[mov.tipoMovimiento] ?? mov.tipoMovimiento}
                                  </Chip>
                                  {mov.inscripcion?.curso && (
                                    <span className="text-xs text-gray-500">
                                      · {mov.inscripcion.curso.nombre}
                                    </span>
                                  )}
                                </div>
                                <span className={`font-bold text-lg ${
                                  mov.monto >= 0
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                                }`}>
                                  {mov.monto >= 0 ? "+" : ""}{formatCurrency(mov.monto)}
                                </span>
                              </div>

                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{mov.concepto}</p>

                              <div className="flex items-center gap-4 mt-2 flex-wrap">
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <ClockIcon className="w-3 h-3" />
                                  {formatFecha(mov.creadoEn)}
                                </span>
                                <span className="text-xs text-gray-400">
                                  Saldo anterior: <span className="font-medium">{formatCurrency(mov.saldoAnterior)}</span>
                                </span>
                                <span className="text-xs text-gray-400">
                                  Saldo nuevo: <span className="font-medium text-gray-700 dark:text-gray-300">{formatCurrency(mov.saldoNuevo)}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Paginación */}
                    {totalMovimientos > 20 && (
                      <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-gray-800">
                        <Button
                          size="sm" variant="flat" color="danger"
                          isDisabled={paginaHistorial === 1}
                          onPress={() => setPaginaHistorial((p) => p - 1)}
                        >
                          Anterior
                        </Button>
                        <span className="text-sm text-gray-500">
                          Página {paginaHistorial} de {Math.ceil(totalMovimientos / 20)}
                        </span>
                        <Button
                          size="sm" variant="flat" color="danger"
                          isDisabled={paginaHistorial >= Math.ceil(totalMovimientos / 20)}
                          onPress={() => setPaginaHistorial((p) => p + 1)}
                        >
                          Siguiente
                        </Button>
                      </div>
                    )}
                  </Card>
                )}
              </div>
            </Tab>
          </Tabs>

        </div>
      </main>
    </div>
  );
}