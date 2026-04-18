import { Router } from "@ecosy/hoapp";
import listLanguages from "./list-languages";
import addLanguage from "./add-language";

const languagesRouter = new Router("/languages");

languagesRouter.get("/:articleId", listLanguages);
languagesRouter.post("/:articleId", addLanguage);

export default languagesRouter;
