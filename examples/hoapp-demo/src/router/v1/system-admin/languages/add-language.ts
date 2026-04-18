import { Descriptor } from "@ecosy/hoapp/descriptor";

export default Descriptor({
  url: "/:articleId",
  summary: "Add Article Language",
  tags: ["System Languages"],
  status: 201
}).use(() => ({ lang: "fr", status: "draft" }));
