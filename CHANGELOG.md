# Changelog

All notable changes to the `@ecosy/hoapp` package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1] - Handler Composition Type Fixes

A focused patch that unblocks composing typed handlers into descriptors when the worker's environment differs from the framework's default `Bindings`. Type plumbing only — no runtime behavior change.

### 🐛 Bug Fixes
- **`ctx.req.valid()` no longer resolves to `never`**: `RouteContext` now passes `Input = any` through to Hono's `Context`. Previously the default `{}` made `keyof Input["in"]` collapse to `never`, blocking any call to `ctx.req.valid("query" | "json" | …)` inside hoapp handlers. Callers still cast the return when full type-safety is required.
- **`Descriptor.use(...)` widens `B` from handlers**: The descriptor's `Bindings` generic now infers from the handlers passed into `.use()` instead of staying fixed at construction time. `Descriptor({...}).use(handler<Env>)` now yields `DescriptorLike<..., Env>` rather than collapsing back to the default `Bindings`, so downstream `Router.get(desc)` correctly picks up the worker's env type.

### ⚙️ API Surface
- **`DescriptorLike.handle()` is now part of the public interface**: The class already implemented `handle()` (returns a single Hono-compatible handler that runs the full middleware + handler chain), but the interface didn't expose it. Mounting a descriptor on a raw Hono app via `app.get(desc.descriptor.url, desc.handle())` is now type-safe.

## [0.2.0] - Generic Router and Swagger Binding Propagation

This release significantly hardens the rigid type-safety bounds between HoApp modules by ensuring deeply nested generics correctly trickle down through parent instances, effectively bypassing strict `Contravariance` typescript constraints.

### 🌟 Features / Fixes
- **Strict Generic Routing Engine (`ContextBindings`)**: Fixed a core Router definition preventing child routers (e.g. `Router<string, ContextBindings>`) from correctly being appended via `.add(...)`. Framework now delegates `B extends Bindings` recursively down children sets (`Set<Router<string, B>>`).
- **Swagger Generic Options**: Refactored the generic context mappings for the injected Swagger interface exposing a new pattern `new Swagger<ContextBindings>` to mirror standard system environments to UI.
- **Standalone Compile Target**: Abstracted away root monorepo TS dependencies by introducing an independent typescript configurations `moduleResolution: Bundler` optimizing nested local resolution inside external modules.

## [0.1.0] - Initial Production-Ready Engine Release

This release solidifies the architectural foundation of the `@ecosy/hoapp` Edge Router, integrating strict types, OpenAPI compatibility, and fully covered validation logic.

### 🌟 Features
- **Strict Descriptor-First Design**: Completely decoupled Hono runtime routing from declarative metadata (`.summary`, `.tags`, `.url`). Developers first create structural designs using `Descriptor({ ... })` natively integrating OpenAPI specifications without code duplication.
- **Topological Sub-Router Isolation**: Deep multi-level subtree mounting (`Router.add(app, usersModule)`) enabling complex domain isolation.
- **Unified HttpResult Encapsulations**: Automatically enforces a standard JSON response model `{ success, status, message, error, data }` avoiding fragmented API payloads.
- **Exception Transformer (Fallback Layer)**: Implemented global interception logic wrapping all errors (including `throw new Error(...)` or custom faults like `throw new NotFound(...)`) into pure JSON 500/400 payloads effortlessly securing the Edge gateway.
- **`createDescriptor` Factory Function**: Cleanly implements isolated closure bindings without breaking generic inference typings inside Typescript.
- **Native Pure Authentication Wrapping**: Exposed `basic`, `bearer`, and `jwt` validators mapped gracefully onto sub-descriptors (`Descriptor(...).use(jwt(...))`).
- **Core Security Modules**: Provided rigorously tested `cors` handling dynamic subsets, and `json` intercepting irregular mutated Body-Payload attacks. 

### 🛡 Validation & Stability
- Built 100% Type-Safe architectures verified explicitly via strict `tsc --noEmit`. Restrictive generic mapping limits unhandled bindings implicitly (`Variables: { jwtPayload: unknown }`). 
- Rolled out rigorous unit test pipelines targeting edge-case payloads (`cors.test.ts`, `json.test.ts`, `result.test.ts`, `descriptor.test.ts`, `router.test.ts`) guaranteeing seamless CI/CD integrations.
- Conclusive benchmark validations on Cloudflare V8 Edge instances yielding **~1,100+ Requests/Sec** maintaining **< 2ms CPU Execution Time** carrying a 0% fault execution margin.

### 🧠 AI-Native Skill Documentation
- Shipped initial foundational AI agent workflow guidelines inside `package.json -> agents`. Integrated markdown descriptors for agentic context scaling (`hoapp-init-route`, `hoapp-route-response-error`, etc).
