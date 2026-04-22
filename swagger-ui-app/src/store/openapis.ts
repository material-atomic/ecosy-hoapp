import { createSlice, type PayloadAction } from "@ecosy/store";

export interface OpenApiInfo {
  title: string;
  version: string;
  description?: string;
}

export interface SchemaItem {
  type: string;
  nullable?: boolean;
}

export interface ContentTypeSchema {
  type: string;
  properties: Record<string, SchemaItem>;
}

export interface ContentTypeResponse {
  schema: ContentTypeSchema;
}

export interface OpenApiResponse {
  description: string;
  content: Record<string, ContentTypeResponse>;
}

export type OpenApoResponses = Record<string | number, OpenApiResponse>;

export type OpenApiSecurity = Record<string, string[]>[];

export interface OpenApiExample {
  summary?: string;
  description?: string;
  value: unknown;
}

export interface OpenApiParameter {
  name: string;
  in: string;
  description?: string;
  required?: boolean;
  schema?: unknown;
}

export interface OpenApiPathInfo {
  summary: string;
  description: string;
  tags: string[];
  security?: OpenApiSecurity;
  parameters?: OpenApiParameter[];
  responses: OpenApoResponses;
  "x-examples"?: Record<string, OpenApiExample>;
}

export type OpenApiMethod = Record<string, OpenApiPathInfo>;

export interface OpenApiSecurityScheme {
  type: string;
  scheme?: string;
  description?: string;
  name?: string;
  in?: string;
  bearerFormat?: string;
  flows?: unknown;
  openIdConnectUrl?: string;
}

export interface OpenApiComponents {
  securitySchemes?: Record<string, OpenApiSecurityScheme>;
  schemas?: Record<string, unknown>;
  responses?: Record<string, unknown>;
  parameters?: Record<string, unknown>;
  requestBodies?: Record<string, unknown>;
  headers?: Record<string, unknown>;
}

export interface OpenApi {
  openapi: string;
  info: OpenApiInfo;
  paths: Record<string, OpenApiMethod>;
  security?: OpenApiSecurity;
  components?: OpenApiComponents;
}

export type OpenApiState = Record<string, OpenApi>;

const initialState: OpenApiState = {};

export const openApisSlice = createSlice({
  name: "openapis",
  initialState,
  reducers: {
    setOpenApi(state, action: PayloadAction<OpenApi, "$openapis.setOpenApi", string>) {
      state[action.meta] = action.payload;
    },
  },
});

export const openApiAction = openApisSlice.actions;
