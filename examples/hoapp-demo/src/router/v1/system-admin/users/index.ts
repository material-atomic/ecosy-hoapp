import { Router } from "@ecosy/hoapp";
import listUsers from "./list-users";
import banUser from "./ban-user";

const usersRouter = new Router("/users");

usersRouter.get("/", listUsers);
usersRouter.put("/:id/ban", banUser);

export default usersRouter;
