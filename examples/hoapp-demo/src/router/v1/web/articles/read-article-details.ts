import { Descriptor } from "@ecosy/hoapp/descriptor";

export default Descriptor({
  url: "/:slug",
  summary: "Read Article Details",
  tags: ["Web Articles"]
}).use(() => ({ slug: "hello-world", content: "..." }));
