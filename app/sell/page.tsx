"use client";
import { useState } from "react";

export default function Sell() {
  const [title,setTitle]=useState(""); const [price,setPrice]=useState<number|"">(""); 
  const [alias,setAlias]=useState("@guest"); const [image,setImage]=useState(""); 
  const [msg,setMsg]=useState<string|null>(null); const [busy,setBusy]=useState(false);

  async function submit(e:React.FormEvent){e.preventDefault(); setMsg(null); setBusy(true);
    try{
      const r = await fetch("/api/listings/public",{method:"POST",headers:{ "content-type":"application/json"},
        body: JSON.stringify({ title, price: Number(price), sellerAlias: alias, image })});
      const j = await r.json().catch(()=>null);
      if(!r.ok) setMsg(j?.error || "投稿に失敗しました");
      else setMsg("投稿しました！ /anime/figures を見てください");
    }catch{ setMsg("ネットワークエラー"); } finally{ setBusy(false); }
  }

  return (
    <main style={{padding:24,maxWidth:640,margin:"0 auto"}}>
      <h2>かんたん出品</h2>
      <form onSubmit={submit} style={{display:"grid",gap:12}}>
        <label>タイトル
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="例: Megumin 1/7"
            style={{width:"100%",padding:10,borderRadius:6,border:"1px solid #ccc"}}/>
        </label>
        <label>価格（JPY）
          <input type="number" min={1} value={price}
            onChange={e=>setPrice(e.target.value===""?"":Number(e.target.value))}
            style={{width:"100%",padding:10,borderRadius:6,border:"1px solid #ccc"}}/>
        </label>
        <label>出品者@エイリアス
          <input value={alias} onChange={e=>setAlias(e.target.value)} placeholder="@yourname"
            style={{width:"100%",padding:10,borderRadius:6,border:"1px solid #ccc"}}/>
        </label>
        <label>画像URL（任意）
          <input value={image} onChange={e=>setImage(e.target.value)} placeholder="/og.png または https://…"
            style={{width:"100%",padding:10,borderRadius:6,border:"1px solid #ccc"}}/>
        </label>
        <button disabled={busy} style={{padding:"10px 16px",border:"1px solid #333",borderRadius:6}}>
          {busy?"送信中…":"出品する"}
        </button>
        {msg && <div style={{padding:8,background:"#f7f7f7",border:"1px solid #eee",borderRadius:6}}>{msg}</div>}
      </form>
      <p style={{marginTop:12,fontSize:12,opacity:.7}}>
        ※ 公開フォームのためスパム対策で軽いレート制限を行っています。問題があれば管理者にご連絡ください。
      </p>
    </main>
  );
}