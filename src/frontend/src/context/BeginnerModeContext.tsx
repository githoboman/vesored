import { createContext, useContext, useState } from "react";

interface BeginnerModeContextValue {
  beginnerMode: boolean;
  setBeginnerMode: (v: boolean) => void;
}

const BeginnerModeContext = createContext<BeginnerModeContextValue>({
  beginnerMode: false,
  setBeginnerMode: () => {},
});

export function BeginnerModeProvider({
  children,
}: { children: React.ReactNode }) {
  const [beginnerMode, setBeginnerMode] = useState(false);
  return (
    <BeginnerModeContext.Provider value={{ beginnerMode, setBeginnerMode }}>
      {children}
    </BeginnerModeContext.Provider>
  );
}

export function useBeginnerMode() {
  return useContext(BeginnerModeContext);
}
