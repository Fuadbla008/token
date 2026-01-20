import { getStore } from "@netlify/blobs";

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const store = getStore("vehicle_tokens");
  const data = await req.json();

  const id = Date.now();
  const receipt_no = `${data.date.replace(/-/g, "")}-${Math.floor(Math.random()*90000+10000)}`;

  const record = {
    id,
    receipt_no,
    ...data,
    created_at: new Date().toISOString()
  };

  await store.set(String(id), JSON.stringify(record));

  return new Response(JSON.stringify({ success: true, record }), {
    headers: { "Content-Type": "application/json" }
  });
};
