import { Router } from "@ecosy/hoapp";
import systemAdminRouter from "./system-admin";
import webRouter from "./web";

const v1 = new Router("/v1");

v1.add(systemAdminRouter, webRouter);

export default v1;