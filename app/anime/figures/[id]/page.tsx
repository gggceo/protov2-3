async function fetchAll() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "";
  const res = await fetch(`${base}/api/listings`, { cache: "no-store" });
  if (!res.ok) return { items: [] as any[] };
  return res.json();
}
async function fetchItem(id: string) {
  const { items } = await fetchAll();
  return items.find((x: any) => String(x.id) === String(id))
    || { id, title: "デモ商品", price: 5000, sellerAlias: "@demo", image: "/og.png" };
}

export default async function ItemPage({ params }: { params: { id: string } }) {
  const item = await fetchItem(params.id);
  return (
    <main style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      <div>
        <img src={item.image} alt={item.title} style={{ width: "100%", borderRadius: 8 }} />
      </div>
      <div>
        <h2 style={{ margin: "0 0 8px" }}>{item.title}</h2>
        <div style={{ fontSize: 18, marginBottom: 4 }}>¥{Number(item.price).toLocaleString()}</div>
        <div style={{ opacity: .8, marginBottom: 16 }}>{item.sellerAlias}</div>

        <a href={`/chat/${item.id}`} style={{
          display: "inline-block", padding: "10px 16px", border: "1px solid #333",
          borderRadius: 6, textDecoration: "none", color: "inherit", marginRight: 8
        }}>
          出品者に問い合わせ
        </a>

        <form action="/api/checkout" method="post" style={{ display: "inline-block" }}>
          <input type="hidden" name="title" value={item.title} />
          <input type="hidden" name="price" value={item.price} />
          <button type="submit" style={{ padding: "10px 16px", border: "1px solid #333", borderRadius: 6 }}>
            テスト購入（Stripe）
          </button>
        </form>

        <div style={{ marginTop: 16, fontSize: 12, opacity: .8 }}>
          ※ チャットではメール・電話・URL・SNS IDは自動でブロックされます。
        </div>
        <div style={{ marginTop: 12 }}>
          <a href="/reports">通報する</a>
        </div>
      </div>
    </main>
  );
}