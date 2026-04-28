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
  /**
   * Append middlewares + handler. The B/V generics widen to whatever the
   * handlers declare — so `Descriptor({...}).use(handler<Env>)` yields
   * `DescriptorLike<..., Env>` instead of staying on the default Bindings.
   * This lets `Router.get(desc)` infer the worker's env type from the handler.
   */
  use<B2 extends Bindings = B, V2 extends Variables = V>(
    ...handles: RouteHandles<Data, Route, B2, V2>
  ): DescriptorLike<Data, Route, B2, V2>;
  /**
   * Returns a single Hono-compatible handler that runs the full middleware
   * chain + final handler. Use it to register a descriptor on a raw Hono app
   * directly, e.g. `app.get(desc.descriptor.url, desc.handle())`.
   */
  handle(): Handler<Data, Route, B, V>;
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

    static use<B2 extends Bindings = B, V2 extends Variables = V>(
      ...handles: RouteHandles<Data, Route, B2, V2>
    ) {
      RouteDescriptor.handles = [...RouteDescriptor.handles, ...handles] as unknown as RouteHandles<Data, Route, B, V>;
      return RouteDescriptor as unknown as DescriptorLike<Data, Route, B2, V2>;
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
