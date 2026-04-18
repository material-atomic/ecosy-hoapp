import { Router, json } from "@ecosy/hoapp";
import { Swagger } from "@ecosy/hoapp/swagger-ui";
import usersModule from "./router/users"; // Example Sub-Router integration 

// 1. Setup Swagger DIP interface panel
const swagger = new Swagger({
  base: "/docs",
  info: { title: "HoApp Backend Architecture API", version: "1.0.0" }
});

// 2. Initialize Main App Layer adopting Configuration Options mapping
const app = Router.create({
  base: "/",
  logger: "/api/*", // Seamless hono router logging registration module execution 
  
  // Advanced Optimal Route (Strict Object Descriptor Injection mechanism)
  middlewares: [
    json.url("/v1/*")
  ],

  // Legacy approach: Backwards support compatibility 
  useFactory: [
    {
      path: "/v2/*",
      use: [json.forRoute()] // Directly exports static MiddlewareHandlers (deprecated method)
    }
  ],
});

// 3. Bind Independent Sub-Routers
Router.add(app, usersModule, swagger.getRouter());

export default app;
