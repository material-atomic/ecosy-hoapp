import { Router } from "@ecosy/hoapp";
import listArticles from "./list-articles";
import createArticle from "./create-article";
import updateArticle from "./update-article";

const articlesRouter = new Router("/articles");

articlesRouter.get("/", listArticles);
articlesRouter.post("/", createArticle);
articlesRouter.put("/:id", updateArticle);

export default articlesRouter;
