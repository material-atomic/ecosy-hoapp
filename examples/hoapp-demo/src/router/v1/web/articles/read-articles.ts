import { Descriptor } from "@ecosy/hoapp/descriptor";

export default Descriptor({
  url: "/",
  summary: "Read Articles",
  tags: ["Web Articles"]
}).use(() => [{ slug: "hello-world", title: "Hello World" }]);
