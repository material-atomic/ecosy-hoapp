import { Descriptor } from "@ecosy/hoapp/descriptor";

export default Descriptor({
  url: "/:articleId",
  summary: "Get Revisions",
  tags: ["System Revisions"]
}).use(() => [{ revId: "r1", date: "2024" }]);
