import {
  Modal, ModalContent, ModalHeader, ModalBody, Button, Chip,
} from "@heroui/react";
import {
  Phone, Mail, Building2, CreditCard, MapPin,
  BookOpen, CheckCircle, Clock, XCircle, RefreshCw, User,
} from "lucide-react";

interface ParticipanteDetalleModalProps {
  isOpen: boolean;
  onClose: () => void;
  participante?: any;
}

const ESTADO_CONFIG: Record<string, {
  label: string;
  color: "success" | "warning" | "danger" | "default";
  Icon: any;
}> = {
  PAGADO:      { label: "Pagado",     color: "success", Icon: CheckCircle },
  PENDIENTE:   { label: "Pendiente",  color: "warning", Icon: Clock },
  CANCELADO:   { label: "Cancelado",  color: "danger",  Icon: XCircle },
  REEMBOLSADO: { label: "Reembolso",  color: "default", Icon: RefreshCw },
};

const formatFecha = (fecha: string) => {
  if (!fecha) return "No especificada";
  return new Date(fecha).toLocaleDateString("es-MX", {
    year: "numeric", month: "long", day: "numeric",
  });
};

const AVATAR_COLORS = [
  "bg-red-500", "bg-rose-500", "bg-pink-500", "bg-orange-500",
  "bg-amber-500", "bg-blue-500", "bg-indigo-500", "bg-violet-500", "bg-teal-500",
];
const avatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

export default function ParticipanteDetalleModal({
  isOpen, onClose, participante,
}: ParticipanteDetalleModalProps) {
  if (!participante) return null;

  const initials =
    `${participante.nombre?.[0] ?? ""}${participante.apellidoPaterno?.[0] ?? ""}`.toUpperCase();

  const nombreCompleto = [participante.nombre, participante.apellidoPaterno, participante.apellidoMaterno]
    .filter(Boolean).join(" ");

  const tieneDireccion = participante.calle || participante.colonia || participante.cp;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-bold">Detalle del Participante</h2>
        </ModalHeader>

        <ModalBody className="pb-6 space-y-5">

          {/* Avatar + nombre */}
          <div className="flex items-center gap-4 p-4 bg-default-50 dark:bg-default-100/10 rounded-xl">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0 ${avatarColor(participante.id)}`}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-default-900 truncate">{nombreCompleto}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Chip size="sm" variant="flat" color={participante.esAfiliado ? "warning" : "default"}>
                  {participante.esAfiliado ? "Afiliado" : "Público general"}
                </Chip>
                <Chip size="sm" variant="flat" color="secondary">
                  {participante.tipoPrecio?.replace("_", " ") ?? "—"}
                </Chip>
              </div>
            </div>
          </div>

          {/* Datos personales */}
          <Section title="DATOS PERSONALES">
            <Row label="Fecha de nacimiento" value={formatFecha(participante.fechaNacimiento)} />
            {participante.curp && <Row label="CURP" value={participante.curp} mono />}
            {participante.rfc  && <Row label="RFC"  value={participante.rfc}  mono />}
          </Section>

          {/* Contacto */}
          {(participante.correo || participante.celular) && (
            <Section title="CONTACTO">
              {participante.correo && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-default-400 shrink-0" />
                  <div>
                    <p className="text-xs text-default-500">Correo</p>
                    <p className="text-sm font-medium">{participante.correo}</p>
                  </div>
                </div>
              )}
              {participante.celular && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-default-400 shrink-0" />
                  <div>
                    <p className="text-xs text-default-500">Celular</p>
                    <p className="text-sm font-medium">{participante.celular}</p>
                  </div>
                </div>
              )}
            </Section>
          )}

          {/* Empresa */}
          {participante.empresa && (
            <Section title="EMPRESA">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-default-400 shrink-0" />
                <div>
                  <p className="text-xs text-default-500">Nombre</p>
                  <p className="text-sm font-medium">{participante.empresa.nombre}</p>
                </div>
              </div>
              {participante.empresa.rfc && (
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-default-400 shrink-0" />
                  <div>
                    <p className="text-xs text-default-500">RFC empresa</p>
                    <p className="text-sm font-medium font-mono">{participante.empresa.rfc}</p>
                  </div>
                </div>
              )}
            </Section>
          )}

          {/* Dirección */}
          {tieneDireccion && (
            <Section title="DIRECCIÓN">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-default-400 shrink-0 mt-0.5" />
                <p className="text-sm text-default-700">
                  {[participante.calle, participante.colonia, participante.cp]
                    .filter(Boolean).join(", ")}
                </p>
              </div>
            </Section>
          )}

          {/* Inscripciones */}
          <Section title="CURSOS E INSCRIPCIONES">
            {participante.inscripciones?.length > 0 ? (
              <div className="space-y-2">
                {participante.inscripciones.map((ins: any) => {
                  const cfg = ESTADO_CONFIG[ins.estadoPago] ?? ESTADO_CONFIG.PENDIENTE;
                  const { Icon } = cfg;
                  return (
                    <div key={ins.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-default-100 bg-default-50 dark:bg-default-100/5">
                      <div className="flex items-center gap-2 min-w-0">
                        <BookOpen className="w-4 h-4 text-default-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-default-800 truncate">
                            {ins.curso?.nombre ?? "—"}
                          </p>
                          {ins.fechaPago && (
                            <p className="text-[11px] text-default-400">
                              Pagado: {formatFecha(ins.fechaPago)}
                            </p>
                          )}
                        </div>
                      </div>
                      <Chip size="sm" variant="flat" color={cfg.color}
                        startContent={<Icon className="w-3 h-3" />}
                        className="shrink-0 ml-2">
                        {cfg.label}
                      </Chip>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-default-400 py-2">
                <User className="w-4 h-4" />
                <p className="text-sm italic">Sin inscripciones registradas</p>
              </div>
            )}
          </Section>

        </ModalBody>

        <div className="flex justify-end px-6 pb-5">
          <Button color="danger" variant="light" onPress={onClose}>
            Cerrar
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}

// ── Sub-componentes internos ──────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-default-500 uppercase tracking-wider mb-2">{title}</p>
      <div className="bg-default-50 dark:bg-default-100/10 rounded-xl p-4 space-y-3">
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <p className="text-xs text-default-500 shrink-0">{label}</p>
      <p className={`text-sm font-medium text-default-800 text-right ${mono ? "font-mono" : ""}`}>
        {value}
      </p>
    </div>
  );
}