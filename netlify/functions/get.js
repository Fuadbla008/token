import { getStore } from "@netlify/blobs";

export default async (req) => {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return new Response("Missing id", { status: 400 });
  }

  const store = getStore("vehicle_tokens");
  const item = await store.get(id);

  if (!item) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(item, {
    headers: { "Content-Type": "application/json" }
  });
};
