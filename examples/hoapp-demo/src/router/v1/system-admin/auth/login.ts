import { Descriptor } from "@ecosy/hoapp/descriptor";

export default Descriptor({
  url: "/login",
  summary: "Admin Login",
  tags: ["System Auth"]
}).use(() => ({ token: "sys-admin-token-123" }));
