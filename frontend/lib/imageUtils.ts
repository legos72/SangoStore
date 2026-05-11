const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function compressImage(file: File): Promise<File> {
  if (file.size <= 2.5 * 1024 * 1024) return file;

  return new Promise((resolve) => {
    const img = new Image();
    const blobUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(blobUrl);
      let { width, height } = img;
      const MAX_DIM = 1600;
      if (width > MAX_DIM || height > MAX_DIM) {
        if (width >= height) { height = Math.round(height * MAX_DIM / width); width = MAX_DIM; }
        else { width = Math.round(width * MAX_DIM / height); height = MAX_DIM; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          const name = file.name.replace(/\.[^.]+$/, ".jpg");
          resolve(new File([blob], name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.82
      );
    };

    img.onerror = () => { URL.revokeObjectURL(blobUrl); resolve(file); };
    img.src = blobUrl;
  });
}

export async function uploadImage(file: File, attempt = 0): Promise<string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("sango_token") : null;
  const compressed = await compressImage(file);
  const fd = new FormData();
  fd.append("image", compressed);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35_000);

  try {
    const res = await fetch(`${BASE}/api/uploads/image`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.status === 401 || res.status === 403) {
      const err = new Error("Session expirée — veuillez vous reconnecter") as Error & { isAuth: boolean };
      err.isAuth = true;
      throw err;
    }

    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.message ?? `Erreur upload (${res.status})`);
    return json.url as string;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err?.isAuth) throw err;
    if (attempt < 2) {
      await new Promise(r => setTimeout(r, 1200 * (attempt + 1)));
      return uploadImage(file, attempt + 1);
    }
    throw err;
  }
}
