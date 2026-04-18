import { Router, json } from "@ecosy/hoapp";
import { Swagger } from "@ecosy/hoapp/swagger-ui";
import v1 from "./router/v1";

// 1. Setup Swagger DIP
const swagger = new Swagger({
  base: "/docs",
  info: { title: "CFCMS Backend API", version: "2.0.0" }
});

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
