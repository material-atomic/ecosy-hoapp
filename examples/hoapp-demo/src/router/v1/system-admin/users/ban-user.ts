import { Descriptor } from "@ecosy/hoapp/descriptor";

export default Descriptor({
  url: "/:id/ban",
  summary: "Ban Web User",
  tags: ["System Web Users"]
}).use(() => ({ banned: true }));
