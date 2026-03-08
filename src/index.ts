import fs from "fs"
import path from "path"

interface RouteNode {
    path: string
    page?: string
    layout?: string
    children: RouteNode[]
    isIndex?: boolean
}

// Convert folder name to route segment
function folderToRoute(entry: string): string {
    if (entry.startsWith("[") && entry.endsWith("]")) {
        const param = entry.slice(1, -1)
        if (param.startsWith("...")) return `*${param.slice(3)}`
        if (param.endsWith("?")) return `:${param.slice(0, -1)}?`
        return `:${param}`
    }
    return entry
}

// Parse filesystem into route tree
function parseRoutes(directory: string, prefix: string = ""): RouteNode {
    const node: RouteNode = { path: prefix || "/", children: [] }

    const layoutPath = path.join(directory, "+layout.tsx")
    if (fs.existsSync(layoutPath)) node.layout = layoutPath

    const pagePath = path.join(directory, "+page.tsx")
    if (fs.existsSync(pagePath)) {
        node.page = pagePath
        node.isIndex = prefix === "/" || prefix.endsWith("/")
    }

    for (const entry of fs.readdirSync(directory)) {
        const full = path.join(directory, entry)
        const stat = fs.statSync(full)
        if (stat.isDirectory() && !entry.startsWith(".")) {
            const routePath = folderToRoute(entry)
            const childPrefix = prefix === "/" || prefix === "" ? `/${routePath}` : `${prefix}/${routePath}`
            node.children.push(parseRoutes(full, childPrefix))
        }
    }

    return node
}

// Generate route element with layout chain
function wrapWithLayouts(pageAlias: string | null, layoutAliases: string[]): string {
    let element = pageAlias ? `React.createElement(${pageAlias}.default, null)` : "null"
    for (const layout of layoutAliases) {
        element = `React.createElement(${layout}.default, null, ${element})`
    }
    return element
}

// Generate routes recursively
function generateRoutes(node: RouteNode, parentLayouts: string[] = []): string[] {
    const routes: string[] = []

    const pageAlias = node.page
        ? `Page_${path.relative(process.cwd(), node.page).replace(/[^a-zA-Z0-9]/g, "_")}`
        : null
    const currentLayouts = [...parentLayouts]
    if (node.layout) {
        const layoutAlias = `Layout_${path.relative(process.cwd(), node.layout).replace(/[^a-zA-Z0-9]/g, "_")}`
        currentLayouts.push(layoutAlias)
    }

    if (node.page || node.children.length > 0) {
        const element = wrapWithLayouts(pageAlias, currentLayouts)
        if (node.isIndex) {
            routes.push(`{ index: true, element: ${element} }`)
        } else if (node.page) {
            routes.push(`{ path: "${node.path}", element: ${element} }`)
        }
    }

    for (const child of node.children) {
        routes.push(...generateRoutes(child, currentLayouts))
    }

    return routes
}

// Collect imports
function collectImports(node: RouteNode, imports: Set<string>) {
    if (node.page) {
        const importPath = "./" + path.relative(process.cwd(), node.page).replace(/\\/g, "/")
        const alias = `Page_${path.relative(process.cwd(), node.page).replace(/[^a-zA-Z0-9]/g, "_")}`
        imports.add(`import * as ${alias} from "${importPath}"`)
    }
    if (node.layout) {
        const importPath = "./" + path.relative(process.cwd(), node.layout).replace(/\\/g, "/")
        const alias = `Layout_${path.relative(process.cwd(), node.layout).replace(/[^a-zA-Z0-9]/g, "_")}`
        imports.add(`import * as ${alias} from "${importPath}"`)
    }
    node.children.forEach(child => collectImports(child, imports))
}

// Vite plugin
export default function ractor() {
    const virtualId = "virtual:ractor"
    const resolvedId = `\0${virtualId}`

    return {
        name: "ractor",

        resolveId(id: string) {
            if (id === virtualId) return resolvedId
        },

        load(id: string) {
            if (id !== resolvedId) return

            const routesDirectory = path.resolve("src/routes")
            const routeTree = parseRoutes(routesDirectory)
            const imports = new Set<string>()
            collectImports(routeTree, imports)
            const routeCodes = generateRoutes(routeTree)

            return `import React from "react"
${Array.from(imports).join("\n")}

export default [${routeCodes.join(", ")}]`
        }
    }
}