export async function geminiAnalyze(params: { apiKey: string; prompt: string }): Promise<string> {
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
    encodeURIComponent(params.apiKey);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: params.prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 450
      }
    })
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini hata verdi (HTTP ${res.status}): ${body || res.statusText}`);
  }

  const json = (await res.json()) as any;
  const text =
    json?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join("") ?? "";

  if (!text) throw new Error("Gemini yanıtı boş geldi.");
  return text.trim();
}

