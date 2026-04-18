import { Router } from "@ecosy/hoapp";
import login from "./login";
import logout from "./logout";

const authRouter = new Router("/auth");

authRouter.post("/login", login);
authRouter.post("/logout", logout);

export default authRouter;
