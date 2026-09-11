import { EXTRACT_KEYS } from "./merge";

const MODEL = process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite";

const stringField = { type: "STRING", nullable: true };

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    product_item_id: stringField,
    product_name: stringField,
    product_category: stringField,
    product_sub_category: stringField,
    standard_size: stringField,
    mrp: stringField,
    mfd: stringField,
    expiry_date: stringField,
  },
  required: [...EXTRACT_KEYS],
};

const PROMPT = `Extract grocery pack label fields from these photos.
Packaging text may be English and/or Hindi.
Use null when a field is not visible or not readable.
Dates must be ISO YYYY-MM-DD.
product_item_id is the barcode or packing id; digits only when the barcode is numeric.
product_category should prefer one of: Eatables, Washing, Cleaning, Masala, Milk Products. Other short English labels are allowed.
Do not invent values that are not on the pack.`;

export async function extractFromImages(
  images: { mimeType: string; data: string }[],
  apiKey: string,
): Promise<Record<string, unknown>> {
  if (images.length === 0) {
    throw Object.assign(new Error("No images to extract."), { status: 400 });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const parts = [
    ...images.map((image) => ({
      inline_data: { mime_type: image.mimeType, data: image.data },
    })),
    { text: PROMPT },
  ];

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    }),
  });

  const json = (await response.json()) as {
    error?: { message?: string };
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };

  if (!response.ok) {
    throw Object.assign(
      new Error(json.error?.message ?? `Gemini request failed (${MODEL}).`),
      { status: 502 },
    );
  }

  const text =
    json.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("") ?? "";
  if (!text.trim()) {
    throw Object.assign(new Error("Gemini returned an empty extract."), {
      status: 502,
    });
  }

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw Object.assign(new Error("Gemini returned invalid JSON."), {
      status: 502,
    });
  }
}
