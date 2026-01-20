import { getStore } from "@netlify/blobs";

export default async () => {
  const store = getStore("vehicle_tokens");
  const records = [];

  for await (const key of store.keys()) {
    const item = await store.get(key);
    records.push(JSON.parse(item));
  }

  records.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return new Response(JSON.stringify(records), {
    headers: { "Content-Type": "application/json" }
  });
};
