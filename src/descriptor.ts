/* eslint-disable @typescript-eslint/no-explicit-any */
import { freeze } from "./utils/freeze";
import { InternalServerError, HttpResult } from "./result";
import type { Next } from "hono";
import type { Freezable, LiteralObject } from "./types/built-in";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { Bindings, Handler, Middleware, RouteContext, Variables } from "./types/router";

type Handles<
  Data = unknown,
  Route extends string = string,
  B extends Bindings = Bindings,
  V extends Variables = Variables
> = [...midlewares: Middleware<Data, Route, B, V>[], handle: Handler<Data, Route, B, V>];

export type RouteHandles<
  Data = unknown,
  Route extends string = string,
  B extends Bindings = Bindings,
  V extends Variables = Variables
> =
  | Handles<Data, Route, B, V>
  | [handle: Handler<Data, Route, B, V>];

export interface DescritorConfigurations<Route extends string = string> {
  url?: Route;
  title?: string;
  summary?: string;
  status?: ContentfulStatusCode | 205;
  tags?: string[];
  type?: "json" | "html" | "text";
  responses?: Record<number | string, unknown>;
  basic?: boolean;
  bearer?: boolean;
  examples?: Record<string, unknown>;
}

export interface DescriptorLike<
  Data = unknown,
  Route extends string = string,
  B extends Bindings = Bindings,
  V extends Variables = Variables
> {
  descriptor: Freezable<DescritorConfigurations<Route>>;
  use(...handles: RouteHandles<Data, Route, B, V>): DescriptorLike<Data, Route, B, V>;
  forRoute(): RouteHandles<Data, Route, B, V>;
  url<R extends string = string>(url: R): DescriptorLike<Data, R, B, V>;
  refine<Extended extends LiteralObject>(config: Partial<DescritorConfigurations<Route>> & Extended): DescriptorLike<Data, Route, B, V>;
}

export function Descriptor<
  Data = unknown,
  Route extends string = string,
  B extends Bindings = Bindings,
  V extends Variables = Variables
>(descriptor: DescritorConfigurations<Route>) {
  return class RouteDescriptor {
    static readonly descriptor = freeze(descriptor);
    static handles = [] as unknown as RouteHandles<Data, Route, B, V>;

    static use(...handles: RouteHandles<Data, Route, B, V>) {
      RouteDescriptor.handles = [...RouteDescriptor.handles, ...handles] as unknown as RouteHandles<Data, Route, B, V>;
      return RouteDescriptor;
    }

    static handle() {
      if (!RouteDescriptor.handles.length) {
        throw new InternalServerError(`No handler for route: "${RouteDescriptor.descriptor.url}"`);
      }

      return async (ctx: RouteContext<Route, B, V>, next: Next) => {
        const handle = RouteDescriptor.handles[RouteDescriptor.handles.length - 1] as Handler<Data, Route, B, V>;;
        const result = await handle(ctx, next);

        if (handle.length > 1) {
          return result;
        }

        if (result instanceof Response) return result;

        const type = descriptor.type || "json";
        const status = descriptor.status || 200;

        if (type === "html") return ctx.html(String(result), status as any);
        if (type === "text") return ctx.text(String(result), status as any);

        return new HttpResult(true, "Successful", status as ContentfulStatusCode, "Successful", result).json(ctx as unknown as RouteContext);
      };
    }

    static forRoute() {
      if (!RouteDescriptor.handles.length) {
        throw new InternalServerError(`No handler for route: "${RouteDescriptor.descriptor.url}"`);
      }

      return RouteDescriptor.handles.map((handle, index) => {
        const fn = handle as Handler<Data, Route, B, V>;
    
        return async (ctx: RouteContext<Route, B, V>, next: Next) => {
          const result = await fn(ctx, next);
          const isEnd = index === RouteDescriptor.handles.length - 1;

          if (!isEnd) {
            return fn.length > 1 ? result : await next();
          }

          if (fn.length > 1) {
            return result;
          }

          if (result instanceof Response) return result;

          const type = descriptor.type || "json";
          const status = descriptor.status || 200;

          if (type === "html") return ctx.html(String(result), status as any);
          if (type === "text") return ctx.text(String(result), status as any);

          return new HttpResult(true, "Successful", status as ContentfulStatusCode, "Successful", result).json(ctx as unknown as RouteContext);
        };
      }) as unknown as RouteHandles;
    }

    static url<R extends string = string>(url: R) {
      return Descriptor<Data, R, B, V>({
        ...descriptor,
        url,
      }).use(...RouteDescriptor.handles);
    }

    static refine<Extended extends LiteralObject>(config: Partial<DescritorConfigurations<Route>> & Extended) {
      return Descriptor<Data, Route, B, V>({
        ...descriptor,
        ...config
      }).use(...RouteDescriptor.handles) as unknown as DescriptorLike<Data, Route, B, V>;
    }
  } as unknown as DescriptorLike<Data, Route, B, V>;
}

export function createDescriptor<
  Data = unknown,
  Route extends string = string,
  B extends Bindings = Bindings,
  V extends Variables = Variables
> (...handles: RouteHandles<Data, Route, B, V>): DescriptorLike<Data, Route, B, V> {
  return Descriptor<Data, Route, B, V>({} as DescritorConfigurations<Route>).use(...handles);
}
