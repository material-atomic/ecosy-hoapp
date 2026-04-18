/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router, type RouterRegistryLike } from "../router";
import { Descriptor, type DescriptorLike } from "../descriptor";
import type { Context } from "hono";
import type { Bindings } from "../types/router";

export interface SwaggerConfig {
  openapi?: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
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
    const config = desc.descriptor as { url?: string; title?: string; summary?: string; tags?: string[]; status?: number };
    
    this.paths[openApiPath][lowerMethod] = {
      summary: config.title || config.summary || `${method} ${path}`,
      description: config.summary,
      tags: config.tags || ["Default"],
      responses: {
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
      }
    };
  }

  getOpenApiJson() {
    return {
      openapi: this.config.openapi,
      info: this.config.info,
      paths: this.paths,
      components: {
        schemas: {}
      }
    };
  }
}

export interface SwaggerOptions extends SwaggerConfig {
  base: string; // Tên miền gốc để mount (vd: '/docs')
}

export class Swagger<B extends Bindings = Bindings> {
  private registry: SwaggerRegistry;
  public options: SwaggerOptions;
  private router: Router<string, B>;

  constructor(options: SwaggerOptions) {
    this.options = options;
    this.registry = new SwaggerRegistry(options);
    this.router = new Router<string, B>(options.base);
    
    // Auto-inject this instance into the Global Router DIP
    Router.registry(this.registry);

    // Natively only serve the JSON Specs
    this.router.get(
      Descriptor({ url: '/json', summary: 'Swagger JSON Specs', tags: ['Swagger Specs'] })
        .use((c: Context) => c.json(this.registry.getOpenApiJson()))
    );
  }

  addUI(uiRouter: Router<string, B>): this {
    this.router.add(uiRouter);
    return this;
  }

  getRouter(): Router<string, B> {
    return this.router;
  }
}
