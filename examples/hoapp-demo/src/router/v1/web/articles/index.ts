import { Router } from "@ecosy/hoapp";
import readArticles from "./read-articles";
import readArticleDetails from "./read-article-details";

const articlesRouter = new Router("/articles");

articlesRouter.get("/", readArticles);
articlesRouter.get("/:slug", readArticleDetails);

export default articlesRouter;
