import { Router, json } from "@ecosy/hoapp";
import { Swagger } from "@ecosy/hoapp/swagger";
import { SwaggerUI } from "@ecosy/hoapp/swagger-ui";
import v1 from "./router/v1";

// 1. Setup Swagger DIP
const swagger = new Swagger({
  jsonUrl: "/docs/openapi.json",
  info: { title: "HoApp Demo API", version: "1.0.0" }
});

swagger.addUI(new SwaggerUI().getRouter({
  base: "/docs",
  jsonUrl: "/docs/openapi.json",
  title: "HoApp Demo API"
}));

const app = Router.create({
  base: "/",
  logger: true,
  cors: {
    url: "*",
    origins: [
      "http://localhost:5173",
      "http://localhost:3000",
      ".pages.dev"
    ]
  },
  middlewares: [
    json.url("/v1/*")
  ],
});

Router.add(app, v1, swagger.getRouter());

export default app;
