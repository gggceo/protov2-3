// 個人情報っぽいものを簡易検出
const email   = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
const phone   = /(\+?\d[\d -]{8,}\d)/;
const url     = /(https?:\/\/[^\s]+)|([A-Za-z0-9-]+\.[A-Za-z]{2,}\/?[^\s]*)/;
const socials = /\b(line|wechat|kakao|instagram|telegram|discord|snap|tiktok)\b/i;

export function containsPII(text: string): string | null {
  if (email.test(text))   return "メールアドレス";
  if (url.test(text))     return "URL/ドメイン";
  if (phone.test(text))   return "電話番号";
  if (socials.test(text)) return "SNS名/ID";
  return null;
}

export default containsPII;   // ← default を追加