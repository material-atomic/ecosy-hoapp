import { Router, HttpResult } from "@ecosy/hoapp";
import { Descriptor } from "@ecosy/hoapp/descriptor";

const responseDemoRouter = new Router("/demo-responses");

// 1. Returning a typical JSON Object payload (Standard Data)
const getSingleItemDesc = Descriptor({
  url: "/single",
  tags: ["Response Handling"],
  summary: "Fetch standard single record",
  responses: { 200: { description: "Success" } }
});

responseDemoRouter.get(getSingleItemDesc, async (ctx) => {
  const item = { id: 1, name: "Product X", price: 100 };
  
  // Implicitly resolved within the global "data" attribute
  return new HttpResult(item).json(ctx);
});

// 2. Returning standard Lists (Array Data)
const getMultipleItemsDesc = Descriptor({
  url: "/list",
  tags: ["Response Handling"],
  summary: "Fetch item collections",
  responses: { 200: { description: "List Success" } }
});

responseDemoRouter.get(getMultipleItemsDesc, async (ctx) => {
  const items = [
    { id: 1, name: "Device Alpha" },
    { id: 2, name: "Device Beta" }
  ];
  
  // Directly bind arrays utilizing the payload constructor
  return new HttpResult(items).json(ctx);
});

// 3. Append distinct HTTP Header Status mappings (e.g. 201 Created)
const createItemDesc = Descriptor({
  url: "/create",
  tags: ["Response Handling"],
  summary: "Deploy external entity record",
  responses: { 201: { description: "Success creation" } }
});

responseDemoRouter.post(createItemDesc, async (ctx) => {
  const newItem = { id: 99, status: "created" };
  
  // Activate pipeline chaining via .status(201) immediately before mapping JSON stream
  return new HttpResult(newItem).status(201).json(ctx);
});

// 4. Wrapping metadata extensions inside isolated objects (Custom Pagination wrapping structure)
const getPaginatedDesc = Descriptor({
  url: "/pages",
  tags: ["Response Handling"],
  summary: "Fetch index map",
  responses: { 200: { description: "Success Page Load" } }
});

responseDemoRouter.get(getPaginatedDesc, async (ctx) => {
  const data = {
    items: [1, 2, 3],
    page: 1,
    total: 50
  };
  
  return new HttpResult(data).json(ctx);
});

export default responseDemoRouter;
