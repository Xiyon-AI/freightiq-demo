"use client";

import { createContext, useContext, type ReactNode } from "react";

interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  role: string;
}

const DEMO_ORG: Organization = {
  id: "demo-org",
  name: "Acme Support",
  slug: "acme-support",
  plan: "pro",
  role: "admin",
};

interface OrgContextValue {
  activeOrg: Organization;
  organizations: Organization[];
  isPlatformAdmin: boolean;
  loading: boolean;
  switching: boolean;
  setActiveOrg: (orgId: string) => Promise<void>;
}

const OrgContext = createContext<OrgContextValue>({
  activeOrg: DEMO_ORG,
  organizations: [DEMO_ORG],
  isPlatformAdmin: false,
  loading: false,
  switching: false,
  setActiveOrg: async () => {},
});

export function useActiveOrg() {
  return useContext(OrgContext);
}

export function OrgProvider({ children }: { children: ReactNode }) {
  return <OrgContext.Provider value={{
    activeOrg: DEMO_ORG,
    organizations: [DEMO_ORG],
    isPlatformAdmin: false,
    loading: false,
    switching: false,
    setActiveOrg: async () => {},
  }}>{children}</OrgContext.Provider>;
}
