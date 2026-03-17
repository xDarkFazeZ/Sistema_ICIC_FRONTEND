import { createContext, useContext, useState } from "react";

type OrigenEmpresa = "fecap" | "participante";

interface EmpresaModalContextType {
  origen: OrigenEmpresa;
  setOrigen: (origen: OrigenEmpresa) => void;
}

const EmpresaModalContext = createContext<EmpresaModalContextType>({
  origen: "participante",
  setOrigen: () => {},
});

export function EmpresaModalProvider({ children }: { children: React.ReactNode }) {
  const [origen, setOrigen] = useState<OrigenEmpresa>("participante");
  return (
    <EmpresaModalContext.Provider value={{ origen, setOrigen }}>
      {children}
    </EmpresaModalContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useEmpresaModal = () => useContext(EmpresaModalContext);