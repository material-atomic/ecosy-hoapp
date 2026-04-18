import type { TypedResponse } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { InvalidJSONValue, JSONParsed, JSONValue } from "hono/utils/types";

export interface ErrorDetail {
  message: string;
  detail: unknown;
}

export interface ResponseStructure<Data = unknown> {
  success: boolean;
  data: Data | null;
  message: string | null;
  status: ContentfulStatusCode;
  error: ErrorDetail | null;
}

type JSONRespondReturn<T extends JSONValue | {} | InvalidJSONValue, U extends ContentfulStatusCode> = Response & TypedResponse<JSONParsed<T>, U, 'json'>;

export type ResponseSchema<Data = unknown> = JSONRespondReturn<ResponseStructure<Data>, ContentfulStatusCode>;
