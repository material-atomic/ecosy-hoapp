import { Router, HttpResult, NotFound } from "@ecosy/hoapp";
import { Descriptor } from "@ecosy/hoapp/descriptor";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

// 1. Initialize Domain App (Child Router)
const usersModule = new Router("/users");

// 2. Define validation schema
const CreateUserSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
});

// 3. Define Endpoints via Swagger OpenAPI Descriptors Configuration (Design First)
const getUserDesc = Descriptor({
  url: "/:id",
  tags: ["Users Domain"],
  summary: "Retrieve User Profile",
  responses: { 200: { description: "Success" } }
});

const createUserDesc = Descriptor({
  url: "/",
  tags: ["Users Domain"],
  summary: "Register New User",
  responses: { 201: { description: "Created" } }
}).use(zValidator("json", CreateUserSchema));

// 4. Implement Business Logic Handlers
usersModule.get(getUserDesc, async (ctx) => {
  const id = ctx.req.param("id");
  
  if (id === "0") {
    // The Framework catches this Exception automatically and wraps it in a valid standard Response Format
    throw new NotFound("User does not exist in the system registry");
  }

  // Value maps to structured HttpResult: { success: true, data: { ... } }
  return new HttpResult({ id, role: "admin" }).json(ctx);
});

usersModule.post(createUserDesc, async (ctx) => {
  // Body input is completely validated type-safe via Zod Schema
  const reqBody = ctx.req.valid("json");
  
  return new HttpResult({ 
    created: true, 
    userInfo: reqBody 
  }).json(ctx);
});

export default usersModule;
