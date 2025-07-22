
'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface CropCycle {
    id: string;
    cropName: string;
    sowingDate: Date;
    duration: number; // in days
}

interface FarmContextType {
  cropCycles: CropCycle[];
  addCropCycle: (cycle: CropCycle) => void;
  updateCropCycle: (cycle: CropCycle) => void;
  getCropCycle: (id: string) => CropCycle | undefined;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider = ({ children }: { children: ReactNode }) => {
  const [cropCycles, setCropCycles] = useState<CropCycle[]>([]);

  const addCropCycle = useCallback((cycle: CropCycle) => {
    setCropCycles(prev => [...prev, cycle]);
  }, []);

  const updateCropCycle = useCallback((cycleToUpdate: CropCycle) => {
    setCropCycles(prev => prev.map(c => c.id === cycleToUpdate.id ? cycleToUpdate : c));
  }, []);
  
  const getCropCycle = useCallback((id: string) => {
    return cropCycles.find(c => c.id === id);
  }, [cropCycles]);

  return (
    <FarmContext.Provider value={{ cropCycles, addCropCycle, updateCropCycle, getCropCycle }}>
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = (): FarmContextType => {
  const context = useContext(FarmContext);
  if (context === undefined) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
};
