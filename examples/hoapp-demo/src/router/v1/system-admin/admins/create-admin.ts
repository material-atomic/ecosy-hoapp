import { Descriptor } from "@ecosy/hoapp/descriptor";

export default Descriptor({
  url: "/",
  summary: "Create Admin",
  tags: ["System Mgmt"],
  status: 201
}).use(() => ({ id: 2, name: "NewAdmin" }));
