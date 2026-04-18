import { Descriptor } from "@ecosy/hoapp/descriptor";

export default Descriptor({
  url: "/:id",
  summary: "Delete Admin",
  tags: ["System Mgmt"]
}).use(() => null);
