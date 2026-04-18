import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { ResponseStructure } from "./types/schema";
import type { RouteContext, Bindings } from "./types/router";

export class HttpResult<Data = unknown> {
  constructor(
    public readonly success: boolean,
    public readonly statusText: string,
    public readonly statusCode: ContentfulStatusCode,
    public readonly message: string,
    public readonly data: Data | null = null,
    public readonly errorDetail: unknown = null,
  ) {}

  get(): ResponseStructure<Data> {
    return {
      success: this.success,
      data: this.data,
      status: this.statusCode,
      message: this.statusText,
      error: this.success ? null : {
        message: this.message || "",
        detail: this.errorDetail,
      },
    };
  }

  json<B extends Bindings = Bindings>(ctx: RouteContext<string, B>) {
    return ctx.json(this.get(), this.statusCode);
  }
}

export abstract class HttpError extends HTTPException {
  public readonly result: HttpResult<null>;
  constructor(
    statusText: string,
    statusCode: ContentfulStatusCode,
    message: string,
    errorDetail: unknown = null,
  ) {
    super(statusCode, { message });
    this.result = new HttpResult<null>(false, statusText, statusCode, message, null, errorDetail);
  }

  static internalServer(err: unknown) {
    return new InternalServerError(Object(err).message || "Internal Server Error", err);
  }
}

export class InternalServerError extends HttpError {
  constructor(message: string, errorDetail: unknown = null) {
    super("Internal Server Error", 500, message, errorDetail);
  }
}

export class BadRequest extends HttpError {
  constructor(message: string, errorDetail: unknown = null) {
    super("Bad Request", 400, message, errorDetail);
  }
}

export class Unauthorized extends HttpError {
  constructor(message: string, errorDetail: unknown = null) {
    super("Unauthorized", 401, message, errorDetail);
  }
}

export class Forbidden extends HttpError {
  constructor(message: string, errorDetail: unknown = null) {
    super("Forbidden", 403, message, errorDetail);
  }
}

export class Conflict extends HttpError {
  constructor(message: string, errorDetail: unknown = null) {
    super("Conflict", 409, message, errorDetail);
  }
}

export class NotFound extends HttpError {
  constructor(message: string, errorDetail: unknown = null) {
    super("Not Found", 404, message, errorDetail);
  }
}

export abstract class HttpSuccess<Data = unknown> {
  public readonly result: HttpResult<Data>;
  constructor(
    statusText: string,
    statusCode: ContentfulStatusCode,
    message: string = "Successful",
    data: Data | null = null,
  ) {
    this.result = new HttpResult<Data>(true, statusText, statusCode, message, data, null);
  }

  json<B extends Bindings = Bindings>(ctx: RouteContext<string, B>) {
    return this.result.json(ctx);
  }
}

export class OK<Data = unknown> extends HttpSuccess<Data> {
  constructor(data: Data | null = null, message: string = "OK") {
    super("OK", 200, message, data);
  }
}

export class Created<Data = unknown> extends HttpSuccess<Data> {
  constructor(data: Data | null = null, message: string = "Created") {
    super("Created", 201, message, data);
  }
}

export class Accepted<Data = unknown> extends HttpSuccess<Data> {
  constructor(data: Data | null = null, message: string = "Accepted") {
    super("Accepted", 202, message, data);
  }
}

export class ResetContent<Data = unknown> extends HttpSuccess<Data> {
  constructor(data: Data | null = null, message: string = "Reset Content") {
    super("Reset Content", 205 as ContentfulStatusCode, message, data);
  }
}

export class MovedPermanently<Data = unknown> extends HttpSuccess<Data> {
  constructor(data: Data | null = null, message: string = "Moved Permanently") {
    super("Moved Permanently", 301 as ContentfulStatusCode, message, data);
  }
}

export class Found<Data = unknown> extends HttpSuccess<Data> {
  constructor(data: Data | null = null, message: string = "Found") {
    super("Found", 302 as ContentfulStatusCode, message, data);
  }
}

export class TemporaryRedirect<Data = unknown> extends HttpSuccess<Data> {
  constructor(data: Data | null = null, message: string = "Temporary Redirect") {
    super("Temporary Redirect", 307 as ContentfulStatusCode, message, data);
  }
}

export class UnsupportedMediaType extends HttpError {
  constructor(message: string, errorDetail: unknown = null) {
    super("Unsupported Media Type", 415, message, errorDetail);
  }
}
