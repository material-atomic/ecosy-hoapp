import { Descriptor } from "@ecosy/hoapp/descriptor";

export default Descriptor({
  url: "/logout",
  summary: "Admin Logout",
  tags: ["System Auth"]
}).use(() => ({ success: true }));
