async function fetchItems() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "";
  const res = await fetch(`${base}/api/listings`, { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json();
  return json.items as any[];
}

export default async function FiguresList() {
  const items = await fetchItems();
  return (
    <main style={{ padding: 24 }}>
      <h2>Figures / Gunpla</h2>
      <ul style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 16, listStyle: "none", padding: 0
      }}>
        {items.map(i => (
          <li key={i.id} style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
            <a href={`/anime/figures/${i.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <img src={i.image || "/og.png"} alt={i.title}
                   style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 6 }} />
              <div style={{ marginTop: 8, fontWeight: 600 }}>{i.title}</div>
              <div>¥{Number(i.price).toLocaleString()}</div>
              <div style={{ opacity: 0.7 }}>{i.sellerAlias}</div>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}