import { createDescriptor } from "./descriptor";
import { basicAuth as honoBasicAuth } from "hono/basic-auth";
import { bearerAuth as honoBearerAuth } from "hono/bearer-auth";
import { jwt as honoJwt } from "hono/jwt";

type BasicOptions = Parameters<typeof honoBasicAuth>[0];
export const basic = (options: BasicOptions) => {
  return createDescriptor(honoBasicAuth(options));
};

type BearerOptions = Parameters<typeof honoBearerAuth>[0];
export const bearer = (options: BearerOptions) => {
  return createDescriptor(honoBearerAuth(options));
};

type JwtOptions = Parameters<typeof honoJwt>[0];
export const jwt = (options: JwtOptions) => {
  return createDescriptor(honoJwt(options));
};
