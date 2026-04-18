import { Descriptor } from "@ecosy/hoapp/descriptor";

export default Descriptor({
  url: "/stats",
  summary: "Get Dashboard Stats",
  tags: ["Web Dashboard"]
}).use(() => ({ views: 100, likes: 50 }));
