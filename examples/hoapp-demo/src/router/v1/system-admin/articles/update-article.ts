import { Descriptor } from "@ecosy/hoapp/descriptor";

export default Descriptor({
  url: "/:id",
  summary: "Update Master Article",
  tags: ["System Articles"]
}).use(() => ({ success: true }));
