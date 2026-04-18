import { Descriptor } from "@ecosy/hoapp/descriptor";

export default Descriptor({
  url: "/",
  summary: "Get Profile",
  tags: ["Web Profile"]
}).use(() => ({ username: "john", email: "john@example.com" }));
