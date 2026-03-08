# Ractor

Small, simple page router for react.

## Usage

Link or include this package to your project somehow. This is usally done with _npm link_.

Then configure vite to use the ractor plugin.

Example config:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import ractor from "ractor";

export default defineConfig({
  plugins: [ractor(), react()],
});
```

After you've configured vite you need to configure the entry react file with react router. But instead of defining your own routes you import and use "routes" from "virtual:ractor".

Example:

```ts
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import routes from "virtual:ractor";
import { createBrowserRouter, RouterProvider } from "react-router";

const router = createBrowserRouter(routes);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
```

## Note

I couldn't get the project configured correctly to play nicely with typescript. So you'll most likly get an error that "virtual:ractor" doesn't exist. While it does. 