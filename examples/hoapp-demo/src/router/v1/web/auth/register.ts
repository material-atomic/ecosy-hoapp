import { Descriptor } from "@ecosy/hoapp/descriptor";

export default Descriptor({
  url: "/register",
  summary: "User Register",
  tags: ["Web Auth"],
  status: 201
}).use(() => ({ id: "u2", username: "new_user" }));
