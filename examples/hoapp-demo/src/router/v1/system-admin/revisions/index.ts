import { Router } from "@ecosy/hoapp";
import getRevisions from "./get-revisions";
import restoreRevision from "./restore-revision";

const revisionsRouter = new Router("/revisions");

revisionsRouter.get("/:articleId", getRevisions);
revisionsRouter.post("/:articleId/:revId/restore", restoreRevision);

export default revisionsRouter;
