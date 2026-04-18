import { Descriptor } from "@ecosy/hoapp/descriptor";

export default Descriptor({
  url: "/",
  summary: "Update Profile",
  tags: ["Web Profile"]
}).use(() => ({ success: true }));
