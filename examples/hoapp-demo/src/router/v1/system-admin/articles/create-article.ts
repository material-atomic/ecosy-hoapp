import { Descriptor } from "@ecosy/hoapp/descriptor";

export default Descriptor({
  url: "/",
  summary: "Create Master Article",
  tags: ["System Articles"],
  status: 201
}).use(() => ({ id: 102 }));
