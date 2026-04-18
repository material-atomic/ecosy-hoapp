import { Descriptor } from "@ecosy/hoapp/descriptor";

export default Descriptor({
  url: "/",
  summary: "List Master Articles",
  tags: ["System Articles"]
}).use(() => [{ id: 101, title: "Master Article" }]);
