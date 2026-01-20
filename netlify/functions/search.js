import { getStore } from "@netlify/blobs";

export default async (req) => {
  const q = new URL(req.url).searchParams.get("q")?.toLowerCase();
  if (!q) {
    return new Response(JSON.stringify([]));
  }

  const store = getStore("vehicle_tokens");
  const results = [];

  for await (const key of store.keys()) {
    const item = JSON.parse(await store.get(key));
    if (
      item.receipt_no.toLowerCase().includes(q) ||
      item.car.toLowerCase().includes(q)
    ) {
      results.push(item);
    }
  }

  return new Response(JSON.stringify(results), {
    headers: { "Content-Type": "application/json" }
  });
};
