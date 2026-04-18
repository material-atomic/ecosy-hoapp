import { Descriptor } from "@ecosy/hoapp/descriptor";

function getListAdmins() {
  return [{ id: 1, name: "SuperAdmin" }];
}

export default Descriptor({
  url: "/", summary:
  "List Admins",
  tags: ["System Mgmt"]
})
  .use(getListAdmins);