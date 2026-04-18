import { Router } from "@ecosy/hoapp";
import auth from "./auth";
import profile from "./profile";
import dashboard from "./dashboard";
import articles from "./articles";

const webRouter = new Router("/web");

// Domain bindings
webRouter.add(auth, profile, dashboard, articles);

export default webRouter;
