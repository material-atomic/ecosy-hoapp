import { Router } from "@ecosy/hoapp";
import getStats from "./get-stats";

const dashRouter = new Router("/dashboard");

dashRouter.get("/stats", getStats);

export default dashRouter;
