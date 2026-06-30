import { createContext, useContext, useState } from "react";

type OrigenEmpresa = "fecap" | "participante" | "curso";

interface EmpresaModalContextType {
  origen: OrigenEmpresa;
  setOrigen: (origen: OrigenEmpresa) => void;
}

const EmpresaModalContext = createContext<EmpresaModalContextType>({
  origen: "participante",
  setOrigen: () => {},
});

interface EmpresaModalProviderProps {
  children: React.ReactNode;
  origen?: OrigenEmpresa;
}

export function EmpresaModalProvider({
  children,
  origen = "participante",
}: EmpresaModalProviderProps) {
  const [origenState, setOrigen] = useState<OrigenEmpresa>(origen);

  return (
    <EmpresaModalContext.Provider
      value={{
        origen: origenState,
        setOrigen,
      }}
    >
      {children}
    </EmpresaModalContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useEmpresaModal = () => useContext(EmpresaModalContext);