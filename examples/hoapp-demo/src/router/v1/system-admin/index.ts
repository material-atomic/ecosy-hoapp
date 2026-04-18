import { Router } from "@ecosy/hoapp";
import auth from "./auth";
import admins from "./admins";
import articles from "./articles";
import languages from "./languages";
import revisions from "./revisions";
import users from "./users";

const systemRouter = new Router("/system-admin");

// Domain bindings
systemRouter.add(auth, admins, articles, languages, revisions, users);

export default systemRouter;
