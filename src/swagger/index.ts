/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RouterRegistryLike } from "../router";
import type { DescriptorLike } from "../descriptor";

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
