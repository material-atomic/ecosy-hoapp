import { Router } from "@ecosy/hoapp";
import getProfile from "./get-profile";
import updateProfile from "./update-profile";

const profileRouter = new Router("/profile");

profileRouter.get("/", getProfile);
profileRouter.put("/", updateProfile);

export default profileRouter;
