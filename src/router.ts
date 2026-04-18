/* eslint-disable @typescript-eslint/no-explicit-any */
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { cors } from "./cors";
import { logger } from "hono/logger";
import { InternalServerError, HttpResult, NotFound } from "./result";
import type { CorsOptions } from "./cors";
import type { DescriptorLike } from "./descriptor";
import type { ResponseSchema } from "./types/schema";
import type { ErrorHandler, MiddlewareHandler, NotFoundHandler } from "hono";
import type { Bindings, RouterBinding, Handler, RouteContext } from "./types/router";

export interface UseFactoryEntry<B extends Bindings = Bindings> {
  path: string;
  use: MiddlewareHandler<RouterBinding<B>> | MiddlewareHandler<RouterBinding<B>>[];
}

export type RouterCorsOptions = CorsOptions & { path?: string };

export interface RouterOptions<B extends Bindings = Bindings> {
  base?: string;
  cors?: RouterCorsOptions;
  logger?: boolean | string;
  notFound?: NotFoundHandler<RouterBinding<B>>;
  error?: ErrorHandler<RouterBinding<B>>;
  useFactory?: UseFactoryEntry<B>[];
  middlewares?: DescriptorLike<unknown, string, B>[];
}

export interface RouterRegistryLike {
  register(method: string, path: string, desc: DescriptorLike): void;
}

export class Router<Base extends string = string, B extends Bindings = Bindings> {
  static registries = new Set<RouterRegistryLike>();
  private routes = new Map<string, Map<string, DescriptorLike>>();
  private middlewares = new Map<string, Map<string, DescriptorLike>>();
  private childRouters = new Set<Router<string, B>>();
  private readonly config: RouterOptions<B>;

  private static parseOptions<B extends Bindings>(options?: string | RouterOptions<B>): RouterOptions<B> {
    return typeof options === "string" ? { base: options } : (options ?? {});
  }

  constructor(options?: Base | RouterOptions<B>) {
    this.config = Router.parseOptions(options) as RouterOptions<B>;
  }

  get base(): Base | undefined {
    return this.config.base as Base;
  }

  static registry(registry: RouterRegistryLike) {
    Router.registries.add(registry);
    return Router;
  }

  private route<
    Data = unknown,
    R extends string = string,
    B extends Bindings = Bindings
  >(method: string, ...desc: [path: R, desc: DescriptorLike<Data, string, B>] | [desc: DescriptorLike<Data, string, B>]) {
    const reDesc = typeof desc[0] === "string" ? desc[1]!.url(desc[0]) : desc[0];
    const routePath = reDesc.descriptor.url ?? "*";

    if (!this.routes.has(method)) {
      this.routes.set(method, new Map());
    }

    this.routes.get(method)!.set(routePath, reDesc as unknown as DescriptorLike);
    return this;
  }

  get<
    Data = unknown,
    R extends string = string,
    B extends Bindings = Bindings
  >(...desc: [path: R, desc: DescriptorLike<Data, string, B>] | [desc: DescriptorLike<Data, string, B>]) {
    return this.route("get", ...desc);
  }

  post<
    Data = unknown,
    R extends string = string,
    B extends Bindings = Bindings
  >(...desc: [path: R, desc: DescriptorLike<Data, string, B>] | [desc: DescriptorLike<Data, string, B>]) {
    return this.route("post", ...desc);
  }

  put<
    Data = unknown,
    R extends string = string,
    B extends Bindings = Bindings
  >(...desc: [path: R, desc: DescriptorLike<Data, string, B>] | [desc: DescriptorLike<Data, string, B>]) {
    return this.route("put", ...desc);
  }

  patch<
    Data = unknown,
    R extends string = string,
    B extends Bindings = Bindings
  >(...desc: [path: R, desc: DescriptorLike<Data, string, B>] | [desc: DescriptorLike<Data, string, B>]) {
    return this.route("patch", ...desc);
  }

  delete<
    Data = unknown,
    R extends string = string,
    B extends Bindings = Bindings
  >(...desc: [path: R, desc: DescriptorLike<Data, string, B>] | [desc: DescriptorLike<Data, string, B>]) {
    return this.route("delete", ...desc);
  }

  options<
    Data = unknown,
    R extends string = string,
    B extends Bindings = Bindings
  >(...desc: [path: R, desc: DescriptorLike<Data, string, B>] | [desc: DescriptorLike<Data, string, B>]) {
    return this.route("options", ...desc);
  }

  all<
    Data = unknown,
    R extends string = string,
    B extends Bindings = Bindings
  >(...desc: [path: R, desc: DescriptorLike<Data, string, B>] | [desc: DescriptorLike<Data, string, B>]) {
    return this.route("all", ...desc);
  }

  use<
    Data = unknown,
    R extends string = string,
    B extends Bindings = Bindings
  >(...desc: [path: R, desc: DescriptorLike<Data, string, B>] | [desc: DescriptorLike<Data, string, B>]) {
    const reDesc = typeof desc[0] === "string" ? desc[1]!.url(desc[0]) : desc[0];
    const routePath = reDesc.descriptor.url ?? "*";

    if (!this.middlewares.has("all")) {
      this.middlewares.set("all", new Map());
    }

    this.middlewares.get("all")!.set(routePath as string, reDesc as unknown as DescriptorLike);
    return this;
  }

  add(...routers: Router<string, B>[]) {
    for (const router of routers) {
      this.childRouters.add(router);
    }
    return this;
  }

  private guard<B extends Bindings = Bindings>(app: Hono<RouterBinding<B>>) {
    const all = this.middlewares.get("all");

    if (all) {
      for (const [route, handle] of all.entries()) {
        app.use(route, ...handle.forRoute() as MiddlewareHandler[]);
      }
    }
  }

  private assign<B extends Bindings = Bindings>(
    app: Hono<RouterBinding<B>>,
    method: string,
    route: string,
    desc: DescriptorLike,
    parentPath: string
  ) {
    const handlers = [
      route, 
      ...desc.forRoute(),
    ] as unknown as Handler<any, string, B>[];

    const methods: Record<string, () => void> = {
      get: () => app.get(...handlers),
      post: () => app.post(...handlers),
      put: () => app.put(...handlers),
      patch: () => app.patch(...handlers),
      delete: () => app.delete(...handlers),
      options: () => app.options(...handlers),
      all: () => app.all(...handlers),
    };

    if (method in methods) {
      methods[method]();
    }

    Router.registries.forEach(registry => {
      let fullPath = `${parentPath}${route === "/" || route === "*" ? "" : route}`;
      registry.register(method.toUpperCase(), fullPath, desc);
    });
  }

  getRouter(fullBasePath: string = "") {
    const app = Router.create<B>({
      ...this.config,
      base: undefined
    });
    this.guard(app);

    ["all", "get", "post", "put", "patch", "delete", "options"].forEach((method) => {
      const handlers = this.routes.get(method);

      if (!handlers?.size) {
        return;
      }

      for (const [route, handle] of handlers.entries()) {
        this.assign(app, method, route, handle, fullBasePath);
      }
    });

    for (const router of this.childRouters) {
      const childPath = router.base ?? "/";
      app.route(childPath, router.getRouter(`${fullBasePath}${childPath === "/" ? "" : childPath}`));
    }

    return app;
  }

  static add<B extends Bindings = Bindings>(
    app: Hono<RouterBinding<B>>,
    ...routers: Router<string, B>[]
  ) {
    for (const router of routers) {
      const base = router.base ?? "/";
      app.route(base, router.getRouter(base === "/" ? "" : base));
    }
  }

  static notFound<B extends Bindings = Bindings>(ctx: RouteContext<string, B>) {
    return new NotFound("URL not found").result.json(ctx as unknown as RouteContext) as unknown as ResponseSchema<null>;
  }

  static error<B extends Bindings = Bindings>(e: unknown, ctx: RouteContext<string, B>) {
    if (e && typeof e === 'object' && 'result' in e && (e as any).result instanceof HttpResult) {
      return (e as any).result.json(ctx as unknown as RouteContext) as unknown as ResponseSchema<null>;
    }

    if (e instanceof HTTPException) {
      const resp = new HttpResult(false, e.message, e.status, e.message, null, e);
      return resp.json(ctx as unknown as RouteContext) as unknown as ResponseSchema<null>;
    }

    const err = new InternalServerError(e instanceof Error ? e.message : String(e), e);
    return err.result.json(ctx as unknown as RouteContext) as unknown as ResponseSchema<null>;
  }

  static create<B extends Bindings = Bindings>(options: string | RouterOptions<B> = {}) {
    const opts = Router.parseOptions(options);
    const app = new Hono<RouterBinding<B>>();

    app.notFound(opts.notFound ?? Router.notFound);
    app.onError(opts.error ?? Router.error);

    if (opts.cors) {
      const corsPath = opts.cors.path || opts.cors.url;
      const corsDesc = cors({ ...opts.cors, url: corsPath }) as unknown as DescriptorLike<unknown, string, B>;
      if (corsDesc.descriptor.url === undefined) {
        app.use(...corsDesc.forRoute() as MiddlewareHandler[]);
      } else {
        app.use(corsDesc.descriptor.url, ...corsDesc.forRoute() as MiddlewareHandler[]);
      }
    }

    if (opts.logger) {
      const loggerPath = typeof opts.logger === "string" ? opts.logger : "*";
      app.use(loggerPath, logger());
    }

    if (opts.middlewares) {
      for (const entry of opts.middlewares) {
        if ('descriptor' in entry && typeof (entry as any).forRoute === 'function') {
          const desc = entry as DescriptorLike<unknown, string, B>;
          if (desc.descriptor.url === undefined) {
            app.use(...desc.forRoute() as MiddlewareHandler[]);
          } else {
            app.use(desc.descriptor.url, ...desc.forRoute() as MiddlewareHandler[]);
          }
        }
      }
    }

    if (opts.useFactory) {
      for (const entry of opts.useFactory) {
        const middlewares = Array.isArray(entry.use) ? entry.use : [entry.use];
        app.use(entry.path, ...middlewares);
      }
    }

    if (opts.base !== undefined) {
      return app.basePath(opts.base);
    }

    return app;
  }
}
