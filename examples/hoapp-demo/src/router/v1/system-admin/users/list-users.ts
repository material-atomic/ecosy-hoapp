import { Descriptor } from "@ecosy/hoapp/descriptor";

export default Descriptor({
  url: "/",
  summary: "List Web Users",
  tags: ["System Web Users"]
}).use(() => [{ id: "u1", username: "john" }]);
