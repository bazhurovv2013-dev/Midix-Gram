"use client";

import { useMemo, useState } from "react";
import { Archive, Bell, Gift, Image as ImageIcon, MessageCircle, MoreHorizontal, Plus, Search, Send, Settings, ShieldCheck, Smile, Users } from "lucide-react";

type Chat = { id: number; name: string; message: string; time: string; unread?: number; color: string; online?: boolean };

const initialChats: Chat[] = [
  { id: 1, name: "Избранное", message: "Заметки и сохранённые сообщения", time: "12:40", color: "#64748b" },
  { id: 2, name: "Команда Midix", message: "Добро пожаловать в Midix Gram!", time: "12:18", unread: 3, color: "#7c6cf2", online: true },
  { id: 3, name: "Алексей", message: "Отправил тебе подарок 🎁", time: "11:52", color: "#e58a65", online: true },
  { id: 4, name: "Дизайн и идеи", message: "Новый вариант интерфейса готов", time: "Вчера", color: "#299c91" },
  { id: 5, name: "Мария", message: "Спасибо! ✨", time: "Вчера", color: "#bd79b8" }
];

const gifts = [
  { emoji: "🌹", name: "Роза", price: "15 ⭐", rarity: "Обычный" },
  { emoji: "🧸", name: "Мишка", price: "50 ⭐", rarity: "Редкий" },
  { emoji: "💎", name: "Кристалл", price: "120 ⭐", rarity: "Эпический" },
  { emoji: "👑", name: "Корона", price: "500 ⭐", rarity: "Легендарный" },
  { emoji: "🚀", name: "Ракета", price: "250 ⭐", rarity: "Эпический" },
  { emoji: "🎁", name: "Сюрприз", price: "80 ⭐", rarity: "Редкий" }
];

export default function Home() {
  const [active, setActive] = useState("chats");
  const [selected, setSelected] = useState(2);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState<string[]>([]);
  const [chats, setChats] = useState(initialChats);
  const current = chats.find(c => c.id === selected) ?? chats[1];
  const filtered = useMemo(() => chats.filter(c => c.name.toLowerCase().includes(query.toLowerCase())), [chats, query]);

  function sendMessage() {
    if (!message.trim()) return;
    setSent(old => [...old, message.trim()]);
    setMessage("");
  }

  return (
    <main className="app-shell">
      <aside className="rail">
        <div className="brand-mark">M</div>
        <button className={active === "chats" ? "rail-btn active" : "rail-btn"} onClick={() => setActive("chats")} aria-label="Чаты"><MessageCircle /></button>
        <button className={active === "gifts" ? "rail-btn active" : "rail-btn"} onClick={() => setActive("gifts")} aria-label="Подарки"><Gift /></button>
        <button className={active === "contacts" ? "rail-btn active" : "rail-btn"} onClick={() => setActive("contacts")} aria-label="Контакты"><Users /></button>
        <div className="rail-spacer" />
        <button className="rail-btn" aria-label="Архив"><Archive /></button>
        <button className="rail-btn" aria-label="Настройки"><Settings /></button>
        <div className="profile-mini">M</div>
      </aside>

      <section className="sidebar">
        <header className="side-header">
          <div><span className="eyebrow">MESSENGER</span><h1>Midix <b>Gram</b></h1></div>
          <button className="icon-btn" aria-label="Новое сообщение"><Plus /></button>
        </header>
        <div className="search-box"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск чатов"/></div>
        <div className="section-label">{active === "gifts" ? "КАТАЛОГ ПОДАРКОВ" : active === "contacts" ? "КОНТАКТЫ" : "ВСЕ СООБЩЕНИЯ"} <span>{active === "chats" ? chats.length : "✦"}</span></div>
        {active === "gifts" ? (
          <div className="gift-list">{gifts.map(g => <button className="gift-row" key={g.name}><span className="gift-emoji">{g.emoji}</span><span><b>{g.name}</b><small>{g.rarity}</small></span><strong>{g.price}</strong></button>)}</div>
        ) : (
          <div className="chat-list">{filtered.map(chat => <button key={chat.id} onClick={() => {setSelected(chat.id); setActive("chats");}} className={selected === chat.id ? "chat-row selected" : "chat-row"}><span className="avatar" style={{background:chat.color}}>{chat.name[0]}</span><span className="chat-copy"><b>{chat.name}{chat.online && <i className="online-dot"/>}</b><small>{chat.message}</small></span><span className="chat-meta"><small>{chat.time}</small>{chat.unread && <i className="unread">{chat.unread}</i>}</span></button>)}</div>
        )}
        <div className="sidebar-footer"><span className="status-dot"/> Все системы работают <MoreHorizontal size={17}/></div>
      </section>

      <section className="conversation">
        {active === "gifts" ? (
          <div className="welcome-panel"><div className="hero-icon"><Gift size={34}/></div><span className="eyebrow">MIDIX COLLECTIBLES</span><h2>Подарки и коллекции</h2><p>Выбирай подарки, собирай редкие предметы и создавай собственную коллекцию.</p><div className="feature-pills"><span>✦ Редкость</span><span>◇ Коллекции</span><span>↗ Обмен — скоро</span></div></div>
        ) : active === "contacts" ? (
          <div className="welcome-panel"><div className="hero-icon"><Users size={34}/></div><h2>Контакты</h2><p>Здесь появится список контактов и поиск пользователей после подключения сервера.</p></div>
        ) : (
          <>
            <header className="conversation-header"><div className="avatar large" style={{background:current.color}}>{current.name[0]}</div><div className="person-title"><b>{current.name}</b><small>{current.online ? "в сети" : "был(а) недавно"}</small></div><div className="header-actions"><button className="icon-btn"><Search/></button><button className="icon-btn"><Bell/></button><button className="icon-btn"><MoreHorizontal/></button></div></header>
            <div className="message-area"><div className="date-chip">СЕГОДНЯ</div><div className="system-note">Это демонстрационный интерфейс Midix Gram. Сообщения пока хранятся только в состоянии страницы.</div><div className="bubble incoming">Привет! Добро пожаловать в Midix Gram 👋<small>12:18 ✓✓</small></div><div className="bubble incoming">Здесь будут чаты, подарки и коллекции.<small>12:19 ✓✓</small></div>{sent.map((m,i)=><div className="bubble outgoing" key={i}>{m}<small>сейчас ✓</small></div>)}</div>
            <form className="composer" onSubmit={e => {e.preventDefault(); sendMessage();}}><button type="button" className="icon-btn"><Plus/></button><input value={message} onChange={e => setMessage(e.target.value)} placeholder="Написать сообщение..."/><button type="button" className="icon-btn muted"><Smile/></button><button className="send-btn" aria-label="Отправить"><Send size={18}/></button></form>
          </>
        )}
      </section>

      <aside className="info-panel"><div className="info-top"><span className="eyebrow">ВАШ ПРОФИЛЬ</span><button className="icon-btn"><MoreHorizontal/></button></div><div className="profile-card"><div className="profile-avatar">M</div><h2>Мой профиль</h2><p className="handle">@midix_user</p><span className="profile-badge"><ShieldCheck size={13}/> Midix member</span></div><div className="info-divider"/><div className="info-section"><div className="section-label">БЫСТРЫЙ ДОСТУП</div><button onClick={() => setActive("gifts")}><Gift/> Мои подарки <span>06</span></button><button><ImageIcon/> Медиафайлы <span>—</span></button><button><Archive/> Архив чатов <span>—</span></button></div><div className="info-tip"><span>✦</span><b>Midix collectibles</b><p>Собирай цифровые подарки и открывай редкие коллекции.</p></div><div className="admin-link">ADMIN CONSOLE <span>WEB ONLY</span></div></aside>
    </main>
  );
}