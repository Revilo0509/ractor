/// <reference types="vite/client" />

import type { RouteObject } from "react-router"

declare module "virtual:ractor" {
  const routes: RouteObject[]
  export default routes
}

export default function ractor(): {
    name: string;
    resolveId(id: string): "\0virtual:ractor" | undefined;
    load(id: string): string | undefined;
};