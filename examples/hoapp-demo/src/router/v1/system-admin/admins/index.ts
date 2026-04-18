import { Router } from "@ecosy/hoapp";
import listAdmins from "./list-admins";
import createAdmin from "./create-admin";
import updateAdmin from "./update-admin";
import deleteAdmin from "./delete-admin";

const adminsRouter = new Router("/admins");

adminsRouter.get("/", listAdmins);
adminsRouter.post("/", createAdmin);
adminsRouter.put("/:id", updateAdmin);
adminsRouter.delete("/:id", deleteAdmin);

export default adminsRouter;
