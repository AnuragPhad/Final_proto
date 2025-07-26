
'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface Location {
    state: string;
    district: string;
}

interface LocationContextType {
  location: Location | null;
  isLocating: boolean;
  setLocation: (location: Location) => void;
  setIsLocating: (isLocating: boolean) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [isLocating, setIsLocating] = useState(true);

  return (
    <LocationContext.Provider value={{ location, isLocating, setLocation, setIsLocating }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
