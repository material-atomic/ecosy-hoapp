import type { Context, Next } from "hono";
import type { Freezable, LiteralObject } from "./built-in";

export type Bindings = {};

export type Variables = {};

export interface RouterBinding<B extends Bindings = Bindings, V extends Variables = Variables> {
  Bindings: B;
  Variables: V;
}

export type RouteContext<
  Route extends string = string,
  B extends Bindings = Bindings,
  V extends Variables = Variables
> = Context<RouterBinding<B, V>, Route>;

export type Handler<
  Data = unknown,
  Route extends string = string,
  B extends Bindings = Bindings,
  V extends Variables = Variables,
> = (ctx: RouteContext<Route, B, V>, next: Next) => Data | Promise<Data>;

export type Middleware<
  Data = unknown,
  Route extends string = string,
  B extends Bindings = Bindings,
  V extends Variables = Variables
> = (ctx: RouteContext<Route, B, V>, next: Next) => Data | Promise<Data>;

export interface HandleLike<
  Data = unknown,
  Route extends string = string,
  B extends Bindings = Bindings,
  V extends Variables = Variables,
> {
  handle(ctx: RouteContext<Route, B, V>): Data;
}

export type RouteLike<
  Data = unknown,
  Route extends string = string,
  B extends Bindings = Bindings,
  V extends Variables = Variables,
  Descriptor extends LiteralObject = LiteralObject,
> = {
  new (ctx:  RouteContext<Route, B, V>): HandleLike<Data, Route, B, V>;
  descriptor: Freezable<Descriptor>;
};
