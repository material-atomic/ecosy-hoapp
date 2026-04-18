import { Router, HttpResult, NotFound } from "@ecosy/hoapp";
import { Descriptor } from "@ecosy/hoapp/descriptor";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const articlesRouter = new Router("/articles");

// 1. Initialize Schemas (Zod)
const QuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(10).max(100).default(20)
});

const ArticleBodySchema = z.object({
  title: z.string().min(5),
  content: z.string(),
  tags: z.array(z.string()).optional()
});

// 2. Define Route logic interface by Descriptor (DIP Pattern)
const getArticlesDesc = Descriptor({
  url: "/",
  tags: ["Articles API"],
  summary: "Retrieve a paginated list of articles",
  responses: { 200: { description: "Article List Data" } }
}).use(zValidator("query", QuerySchema));

const createArticleDesc = Descriptor({
  url: "/",
  tags: ["Articles API"],
  summary: "Publish a new article",
  responses: { 201: { description: "Article successfully created" } }
}).use(zValidator("json", ArticleBodySchema));

const getArticleByIdDesc = Descriptor({
  url: "/:articleId",
  tags: ["Articles API"],
  summary: "Retrieve specific article details",
  responses: { 200: { description: "Article Details Data" } }
});

// 3. Mount Handlers by passing the Descriptor directly to the Router map
articlesRouter.get(getArticlesDesc, async (ctx) => {
  // Extract validated query
  const query = ctx.req.valid("query");
  
  return new HttpResult({ 
    items: [], 
    page: query.page 
  }).json(ctx);
});

articlesRouter.post(createArticleDesc, async (ctx) => {
  // .valid("json") payload returns 100% Type Inference due to the bound zValidator
  const payload = ctx.req.valid("json");
  
  return new HttpResult({
    id: "new-uuid",
    ...payload
  }).status(201).json(ctx);
});

articlesRouter.get(getArticleByIdDesc, async (ctx) => {
  const articleId = ctx.req.param("articleId");
  
  if (articleId === "0") {
    throw new NotFound(`Article ID ${articleId} could not be successfully resolved`);
  }

  return new HttpResult({ id: articleId, title: "Test Article" }).json(ctx);
});

export default articlesRouter;
