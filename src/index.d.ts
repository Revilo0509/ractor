/// <reference types="vite/client" />

import React from "react"

declare module "virtual:ractor" {
  interface Route {
    path?: string
    index?: boolean
    element?: React.ReactNode
    children?: Route[]
    Component?: React.ComponentType
    Layout?: React.ComponentType
  }

  const routes: Route[]
  export default routes
}