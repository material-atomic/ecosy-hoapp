import { Router } from "@ecosy/hoapp";
import login from "./login";
import register from "./register";

const authRouter = new Router("/auth");

authRouter.post("/login", login);
authRouter.post("/register", register);

export default authRouter;
