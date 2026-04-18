import { Router } from "@ecosy/hoapp";
import { Descriptor } from "@ecosy/hoapp/descriptor";
import { HTTPException } from "hono/http-exception"; // Import natively from Hono core
import { 
  BadRequest, 
  Unauthorized, 
  Forbidden, 
  NotFound, 
  Conflict, 
  InternalServerError 
} from "@ecosy/hoapp"; // Unified generic imports module block

const errorDemoRouter = new Router("/demo-errors");

const triggerErrorDesc = Descriptor({
  url: "/:type",
  tags: ["Error Handling Architecture"],
  summary: "Testing System mapping across variable simulated framework failures",
  responses: { 200: { description: "Unified Error Masked Successfully mapping via internal HTTP result wrapper defaults!" } } 
});

errorDemoRouter.get(triggerErrorDesc, async (ctx) => {
  const type = ctx.req.param("type");

  // 1. Error 400 - Faulty client input invalidation requests 
  if (type === "bad-request") {
    throw new BadRequest("Parameter values violate local system integrity limits");
  }

  // 2. Error 401 - System lack authentic credential sessions 
  if (type === "unauthorized") {
    throw new Unauthorized("Active login tokens currently inaccessible or fully expired");
  }

  // 3. Error 403 - Privilege authorization block execution 
  if (type === "forbidden") {
    throw new Forbidden("Account identity does not maintain administrative clearance rights");
  }

  // 4. Error 404 - Document missing database extraction requests 
  if (type === "not-found") {
    throw new NotFound("Desired article configuration does not match available registered ID constraints");
  }

  // 5. Error 409 - Redundancy mappings trigger data collisions (e.g. Identity conflict registration logic loops)
  if (type === "conflict") {
    throw new Conflict("Assigned registry keys currently clash directly against alternative users mapped previously");
  }

  // 6. Native Runtime Extendable Errors executing customized mapping layer components 
  if (type === "custom") {
    // Specify completely bespoke parameters targeting edge HTTP standards variants (e.g processing Unprocessable entity configurations explicitly manually)
    throw new HTTPException(422, { message: "Intricate server computation mechanisms failed during operation resolving attempts" });
  }

  // 7. Error 500 - Hardware failures or third-party mapping interruptions outside normal predictable cycles 
  throw new InternalServerError("Major external network disruption sequence occurring natively, terminating transaction attempt completely");
});

export default errorDemoRouter;
