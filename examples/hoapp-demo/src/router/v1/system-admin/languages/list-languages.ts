import { Descriptor } from "@ecosy/hoapp/descriptor";

export default Descriptor({
  url: "/:articleId",
  summary: "List Article Languages",
  tags: ["System Languages"]
}).use(() => [{ lang: "en", status: "published" }, { lang: "vi", status: "draft" }]);
