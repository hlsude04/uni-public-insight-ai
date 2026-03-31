import type { CsvRow } from "./csv";
import { nonEmpty } from "./csv";

export type SatisfactionBucket = "olumlu" | "nötr" | "olumsuz";

const NEGATIVE = new Set(["Düşük", "Yetersiz", "Kesinlikle Katılmıyorum", "Katılmıyorum"]);
const NEUTRAL = new Set(["Orta", "Kararsızım", "Kısmen", "Ara sıra", "Nadiren"]);
const POSITIVE = new Set(["Yüksek", "Katılıyorum", "Kesinlikle Katılıyorum", "Evet, oldukça yeterli", "Sık"]);

export function bucketizeAnswer(ansRaw: string): SatisfactionBucket {
  const ans = ansRaw.trim();
  if (NEGATIVE.has(ans)) return "olumsuz";
  if (POSITIVE.has(ans)) return "olumlu";
  if (NEUTRAL.has(ans)) return "nötr";
  return "nötr";
}

export function pickKeyColumns(headers: string[]) {
  const generalSatisfaction = headers.find((h) =>
    h.startsWith("Kamu hizmetlerinden genel olarak memnuniyet seviyeniz nasıldır?"),
  );

  const digitalAdequacy = headers.find((h) =>
    h.startsWith("Dijital kamu hizmetlerini yeterli buluyor musunuz?"),
  );

  const improvementArea = headers.find((h) =>
    h.startsWith("Kamu hizmetlerinde en çok geliştirilmesini istediğiniz alan nedir?"),
  );

  const classLevel = headers.find(
    (h) => h.startsWith("Hangi sınıf düzeyinde eğitim görmektesiniz?") && !h.includes("["),
  );
  const gender = headers.find((h) => h.startsWith("Cinsiyetiniz?") && !h.includes("["));

  return { generalSatisfaction, digitalAdequacy, improvementArea, classLevel, gender };
}

export function countBy(rows: CsvRow[], col: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of rows) {
    const v = r[col];
    if (!nonEmpty(v)) continue;
    out[v] = (out[v] || 0) + 1;
  }
  return out;
}

export function satisfactionDistribution(rows: CsvRow[], col: string) {
  let pos = 0,
    neu = 0,
    neg = 0;
  for (const r of rows) {
    const v = r[col];
    if (!nonEmpty(v)) continue;
    const b = bucketizeAnswer(v);
    if (b === "olumlu") pos++;
    else if (b === "olumsuz") neg++;
    else neu++;
  }
  const total = pos + neu + neg;
  return { pos, neu, neg, total };
}

export type Hotspot = {
  question: string;
  negativeRate: number;
  negativeCount: number;
  total: number;
};

export function findHotspots(rows: CsvRow[], headers: string[], topN = 5): Hotspot[] {
  const candidates = headers
    .filter((h) => !h.includes("[Puan]") && !h.includes("[Geri Bildirim]"))
    .filter((h) => h !== "Zaman damgası" && h !== "Toplam puan");

  const hotspots: Hotspot[] = [];

  for (const col of candidates) {
    let neg = 0,
      total = 0;
    for (const r of rows) {
      const v = r[col];
      if (!nonEmpty(v)) continue;
      total++;
      if (bucketizeAnswer(v) === "olumsuz") neg++;
    }
    if (total < 10) continue;
    const rate = neg / total;
    if (rate <= 0) continue;

    hotspots.push({
      question: col,
      negativeRate: rate,
      negativeCount: neg,
      total,
    });
  }

  hotspots.sort((a, b) => b.negativeRate - a.negativeRate);
  return hotspots.slice(0, topN);
}

export function localActionableSuggestions(hotspots: Hotspot[]): string[] {
  const picks = hotspots.slice(0, 3);
  if (!picks.length) {
    return [
      "Veride belirgin bir memnuniyetsizlik yoğunlaşması görünmüyor. Anketi daha geniş örneklemle tekrarlayıp, özellikle “sorun yaşadınız mı?” alanına detaylı geri bildirim eklenmesini önerin.",
      "Veri kalitesini artırmak için “neden?” ve “örnek olay” türü 1–2 açık uçlu soru ekleyin; bu, doğru aksiyon planı üretmeyi kolaylaştırır.",
      "Sonuçları üniversite/ilçe bazında segmentleyin; her segment için ayrı iyileştirme backlog’u oluşturun.",
    ];
  }

  return picks.map((h, i) => {
    const q = h.question;
    const base = `Öncelik #${i + 1}: “${q}” alanında memnuniyetsizlik oranı %${Math.round(
      h.negativeRate * 100,
    )}.`;
    if (q.toLowerCase().includes("ulaşım")) {
      return `${base} Öğrenci yoğun hatlarda sefer sıklığını artırın, aktarma sürelerini kısaltın ve “öğrenci indirimi” süreçlerini tek ekrandan doğrulanabilir hale getirin.`;
    }
    if (
      q.toLowerCase().includes("dijital") ||
      q.toLowerCase().includes("e-devlet") ||
      q.toLowerCase().includes("teknolojik")
    ) {
      return `${base} Mobil/portal işlemlerinde hata ve gecikmeleri azaltmak için performans izleme kurun, en çok kullanılan 5 işlemi sadeleştirin ve canlı destek/geri bildirim kanalını görünürleştirin.`;
    }
    if (q.toLowerCase().includes("ekonomik") || q.toLowerCase().includes("ücret")) {
      return `${base} Öğrenciler için ücret/harç/ulaşım/abonman kalemlerinde hedefli indirim paketi oluşturun; başvuru kriterlerini netleştirip süreçleri otomatik doğrulayın.`;
    }
    if (q.toLowerCase().includes("iletişim") || q.toLowerCase().includes("bilgilendirme")) {
      return `${base} Tek bir “öğrenci kamu hizmetleri” bilgi sayfası yayınlayın, sık değişen duyuruları abonelikle bildirin ve başvuru adımlarını örnek ekranlarla standartlaştırın.`;
    }
    return `${base} Bu alandaki kök nedeni doğrulamak için kısa bir takip anketi yapın ve en çok şikâyet edilen 2 süreci “hız + erişilebilirlik” odaklı yeniden tasarlayın.`;
  });
}

