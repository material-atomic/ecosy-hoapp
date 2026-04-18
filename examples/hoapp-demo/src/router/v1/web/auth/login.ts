import { Descriptor } from "@ecosy/hoapp/descriptor";

export default Descriptor({
  url: "/login",
  summary: "User Login",
  tags: ["Web Auth"]
}).use(() => ({ token: "user-token-abc" }));
