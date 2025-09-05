// メール・電話・URL・主要SNS ID を検出してエラーにする簡易ルール
const email = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const phone = /(\+?\d{1,3}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}/;
const url = /\b((https?:\/\/)?[a-z0-9.-]+\.[a-z]{2,}(\/\S*)?)\b/i;
const socials = /\b(line|wechat|kakao|instagram|telegram|discord|snap|tiktok)\b/i;

export function containsPII(text: string): string | null {
  if (email.test(text)) return "メールアドレス";
  if (url.test(text)) return "URL/ドメイン";
  if (phone.test(text)) return "電話番号";
  if (socials.test(text)) return "SNS名/ID";
  return null;
}