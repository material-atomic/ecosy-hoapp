import { Descriptor } from "@ecosy/hoapp/descriptor";

export default Descriptor({
  url: "/:articleId/:revId/restore",
  summary: "Restore Revision",
  tags: ["System Revisions"]
}).use(() => ({ success: true }));
