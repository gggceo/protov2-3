export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Proto v2</h1>
      <p>このトップページが表示されれば 404 は解消です 🎉</p>
      <ul>
        <li><a href="/api/health">/api/health</a></li>
        <li><a href="/shipping/labels">/shipping/labels</a></li>
        <li><a href="/api/risk">/api/risk</a></li>
      </ul>
    </main>
  );
}