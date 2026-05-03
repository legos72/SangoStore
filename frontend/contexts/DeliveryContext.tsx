"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Trip } from "@/lib/types";

interface DeliveryContextValue {
  deliveryDestination: "local" | "bangui" | null;
  setDeliveryDestination: (d: "local" | "bangui" | null) => void;
  banguiMode: "standard" | "advanced" | null;
  setBanguiMode: (m: "standard" | "advanced" | null) => void;
  receptionMode: "pickup" | "home" | null;
  setReceptionMode: (m: "pickup" | "home" | null) => void;
  selectedTrip: Trip | null;
  setSelectedTrip: (t: Trip | null) => void;
  localAddress: string;
  setLocalAddress: (a: string) => void;
  customerName: string;
  setCustomerName: (n: string) => void;
  customerPhone: string;
  setCustomerPhone: (p: string) => void;
  customerBanguiAddress: string;
  setCustomerBanguiAddress: (a: string) => void;
  /** Retourne true si la configuration de livraison est complète */
  isDeliveryValid: (standardTrip: Trip | null) => boolean;
  resetDelivery: () => void;
}

const DeliveryContext = createContext<DeliveryContextValue | null>(null);

export function DeliveryProvider({ children }: { children: ReactNode }) {
  const [deliveryDestination, setDeliveryDestination] = useState<"local" | "bangui" | null>(null);
  const [banguiMode, setBanguiMode] = useState<"standard" | "advanced" | null>(null);
  const [receptionMode, setReceptionMode] = useState<"pickup" | "home" | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [localAddress, setLocalAddress] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerBanguiAddress, setCustomerBanguiAddress] = useState("");

  const isDeliveryValid = useCallback((standardTrip: Trip | null): boolean => {
    if (!deliveryDestination) return false;
    if (deliveryDestination === "local") return true;
    if (!banguiMode || !receptionMode) return false;
    if (banguiMode === "standard") return standardTrip !== null;
    return selectedTrip !== null;
  }, [deliveryDestination, banguiMode, receptionMode, selectedTrip]);

  const resetDelivery = useCallback(() => {
    setDeliveryDestination(null);
    setBanguiMode(null);
    setReceptionMode(null);
    setSelectedTrip(null);
    setLocalAddress("");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerBanguiAddress("");
  }, []);

  return (
    <DeliveryContext.Provider value={{
      deliveryDestination, setDeliveryDestination,
      banguiMode, setBanguiMode,
      receptionMode, setReceptionMode,
      selectedTrip, setSelectedTrip,
      localAddress, setLocalAddress,
      customerName, setCustomerName,
      customerPhone, setCustomerPhone,
      customerBanguiAddress, setCustomerBanguiAddress,
      isDeliveryValid,
      resetDelivery,
    }}>
      {children}
    </DeliveryContext.Provider>
  );
}

export function useDelivery() {
  const ctx = useContext(DeliveryContext);
  if (!ctx) throw new Error("useDelivery must be used inside DeliveryProvider");
  return ctx;
}
