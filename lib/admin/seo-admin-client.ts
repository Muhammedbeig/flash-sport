// lib/admin/seo-admin-client.ts
export type AnyObject = Record<string, any>;

const ENDPOINT = "/api/admin/seo-store";

async function readErrorBody(res: Response) {
  try {
    const text = await res.text();
    return text?.slice(0, 500) || "";
  } catch {
    return "";
  }
}

export async function fetchSeoStore<T = AnyObject>(): Promise<T> {
  const res = await fetch(ENDPOINT, { cache: "no-store" });

  if (!res.ok) {
    const body = await readErrorBody(res);
    throw new Error(`Failed to load SEO store (${res.status}). ${body}`);
  }

  return (await res.json()) as T;
}

export async function patchSeoStore<T = AnyObject>(patch: AnyObject): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(patch),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await readErrorBody(res);
    throw new Error(`Failed to save SEO store (${res.status}). ${body}`);
  }

  return (await res.json()) as T;
}
