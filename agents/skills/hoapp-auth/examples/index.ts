import { Router, HttpResult, Unauthorized } from "@ecosy/hoapp";
import { jwt } from "@ecosy/hoapp/auth";

const myProtectedRouter = new Router("/admin");

// Instantiate your secure route by generating the native JWT Descriptor 
// and chaining route configs explicitly using .refine() or .url() to inject 
// properties like `url` and `summary` while leaving auth configs purely isolated.
const adminProfileDesc = jwt({ secret: "MY_SUPER_SECRET" })
  .refine({
    url: "/profile",
    summary: "Render Admin Profile View details",
    tags: ["Admin"],
    responses: { 200: { description: "Secured Success response" } }
  });

myProtectedRouter.get(adminProfileDesc, async (ctx) => {
  // Extrapolate verified Payload directly extracted securely via Context registry
  const tokenPayload = ctx.get("jwtPayload");

  if (!tokenPayload) {
    throw new Unauthorized("Token validation processing failure due to unspecified payload parameters");
  }

  return new HttpResult({ role: tokenPayload.role }).json(ctx);
});

export default myProtectedRouter;
