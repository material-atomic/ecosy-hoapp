import { Descriptor } from "@ecosy/hoapp/descriptor";

export default Descriptor({
  url: "/:id",
  summary: "Update Admin",
  tags: ["System Mgmt"]
}).use(() => ({ success: true }));
