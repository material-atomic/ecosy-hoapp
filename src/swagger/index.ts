/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router, type RouterRegistryLike } from "../router";
import { Descriptor, type DescriptorLike, type DescritorConfigurations } from "../descriptor";
import type { Context } from "hono";
import type { Bindings, Variables } from "../types/router";

export type SecuritySchemeType = "apiKey" | "http" | "oauth2" | "openIdConnect";

export interface SecuritySchemeObject {
  type: SecuritySchemeType;
  description?: string;
  name?: string;
  in?: "query" | "header" | "cookie";
  scheme?: string; // e.g. "bearer"
  bearerFormat?: string; // e.g. "JWT"
  flows?: Record<string, any>;
  openIdConnectUrl?: string;
}

export interface SwaggerAuth {
  basic?: boolean | SecuritySchemeObject;
  bearer?: boolean | SecuritySchemeObject;
}

export interface ApiOperationOptions<Route extends string = string> extends DescritorConfigurations<Route> {
  description?: string;
  parameters?: Array<{
    name: string;
    in: "query" | "header" | "path" | "cookie";
    description?: string;
    required?: boolean;
    deprecated?: boolean;
    schema?: any;
  }>;
  requestBody?: {
    description?: string;
    required?: boolean;
    content: Record<string, any>;
  };
  security?: Array<Record<string, string[]>>;
  deprecated?: boolean;
  operationId?: string;
}

export function ApiOperation<
  Data = unknown,
  Route extends string = string,
  B extends Bindings = Bindings,
  V extends Variables = Variables
>(options: ApiOperationOptions<Route>) {
  return Descriptor<Data, Route, B, V>(options as any);
}

export interface SwaggerConfig {
  openapi?: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  auth?: SwaggerAuth;
}

export class SwaggerRegistry implements RouterRegistryLike {
  private config: SwaggerConfig;
  private paths: Record<string, any> = {};

  constructor(config: SwaggerConfig) {
    this.config = config;
    if (!this.config.openapi) {
      this.config.openapi = "3.1.0";
    }
  }

  register(method: string, path: string, desc: DescriptorLike): void {
    const openApiPath = path.replace(/:([a-zA-Z0-9_]+)/g, "{$1}");

    if (!this.paths[openApiPath]) {
      this.paths[openApiPath] = {};
    }

    const lowerMethod = method.toLowerCase();
    const config = desc.descriptor as ApiOperationOptions<string>;
    
    // Auto map responses
    let compiledResponses = config.responses || {};
    
    // Auto map security blocks
    const security: Record<string, any>[] = config.security || [];
    if (!config.security) {
      if (config.basic) security.push({ basicAuth: [] });
      if (config.bearer) security.push({ bearerAuth: [] });
    }

    // Ensure there is at least one default response if empty
    if (Object.keys(compiledResponses).length === 0) {
      compiledResponses = {
        [config.status?.toString() || "200"]: {
          description: "Successful response",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  status: { type: "integer" },
                  message: { type: "string" },
                  error: { nullable: true },
                  data: {} 
                }
              }
            }
          }
        }
      };
    }

    this.paths[openApiPath][lowerMethod] = {
      summary: config.title || config.summary || `${method} ${path}`,
      description: config.description || config.summary,
      tags: config.tags || ["Default"],
      responses: compiledResponses,
      ...(config.parameters ? { parameters: config.parameters } : {}),
      ...(config.requestBody ? { requestBody: config.requestBody } : {}),
      ...(config.operationId ? { operationId: config.operationId } : {}),
      ...(config.deprecated !== undefined ? { deprecated: config.deprecated } : {}),
      ...(security.length > 0 ? { security } : {}),
      ...(config.examples ? { "x-examples": config.examples } : {}) // Store examples at root using OpenAPI extension property
    };
  }

  getOpenApiJson() {
    const securitySchemes: Record<string, any> = {};
    const globalSecurity: Record<string, any>[] = [];

    if (this.config.auth?.bearer) {
      const defaultBearer = { type: "http", scheme: "bearer", bearerFormat: "JWT" };
      const bearerOptions = typeof this.config.auth.bearer === "object" 
        ? { ...defaultBearer, ...this.config.auth.bearer }
        : defaultBearer;
        
      securitySchemes["bearerAuth"] = bearerOptions;
      globalSecurity.push({ bearerAuth: [] });
    }

    if (this.config.auth?.basic) {
      const defaultBasic = { type: "http", scheme: "basic" };
      const basicOptions = typeof this.config.auth.basic === "object"
        ? { ...defaultBasic, ...this.config.auth.basic }
        : defaultBasic;

      securitySchemes["basicAuth"] = basicOptions;
      globalSecurity.push({ basicAuth: [] });
    }

    return {
      openapi: this.config.openapi,
      info: this.config.info,
      paths: this.paths,
      components: {
        schemas: {},
        ...(Object.keys(securitySchemes).length > 0 ? { securitySchemes } : {})
      },
      ...(globalSecurity.length > 0 ? { security: globalSecurity } : {})
    };
  }
}

export interface SwaggerOptions extends SwaggerConfig {
  jsonUrl?: string; // Target URL for JSON, defaults to '/json' if not using a custom descriptor
}

export class Swagger<B extends Bindings = Bindings> {
  private registry: SwaggerRegistry;
  public options: SwaggerOptions;
  private router: Router<string, B>;

  constructor(options: SwaggerOptions) {
    this.options = options;
    this.registry = new SwaggerRegistry(options);
    this.router = new Router<string, B>("");
    
    // Auto-inject this instance into the Global Router DIP
    Router.registry(this.registry);

    // Natively only serve the JSON Specs via explicit url or default fallback
    const jsonUrl = options.jsonUrl || '/json';
    this.router.get(
      Descriptor({ url: jsonUrl, summary: 'Swagger JSON Specs', tags: ['Swagger Specs'] })
        .use((c: Context) => c.json(this.registry.getOpenApiJson()))
    );
  }

  getJsonDescriptor(url: string) {
    return Descriptor({ url, summary: 'Swagger JSON Specs', tags: ['Swagger Specs'] })
        .use((c: Context) => c.json(this.registry.getOpenApiJson()));
  }

  addUI(uiRouter: Router<string, B>): this {
    this.router.add(uiRouter);
    return this;
  }

  getRouter(): Router<string, B> {
    return this.router;
  }
}
