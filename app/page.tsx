"use client";

import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Archive, Bell, Gift, Image as ImageIcon, MessageCircle, MoreHorizontal, Plus, Search, Send, Settings, ShieldCheck, Smile, Users, LogOut, LockKeyhole, UserRound, Crown, BadgeCheck, RefreshCw } from "lucide-react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

type Chat = { id:string; title:string; slug:string; is_group:boolean };
type Msg = { id:string; chat_id:string; sender_id:string; body:string; created_at:string; profiles?:{username:string}|null };
type Contact = { id:string; username:string; display_name:string|null };
type AdminPerson = {id:string;username:string;display_name:string|null;role:string;created_at:string;is_premium:boolean;is_verified:boolean;badge_label:string|null};

const gifts = [
  {emoji:"🌹",title:"Роза",price:15,rarity:"Обычный"},
  {emoji:"🧸",title:"Мишка",price:50,rarity:"Редкий"},
  {emoji:"💎",title:"Кристалл",price:120,rarity:"Эпический"},
  {emoji:"👑",title:"Корона",price:500,rarity:"Легендарный"},
  {emoji:"🚀",title:"Ракета",price:250,rarity:"Эпический"},
  {emoji:"🎁",title:"Сюрприз",price:80,rarity:"Редкий"}
];
const demoChats:Chat[]=[
 {id:"demo-general",title:"Общий чат",slug:"general",is_group:true},
 {id:"demo-friends",title:"Друзья",slug:"friends",is_group:true},
 {id:"demo-news",title:"Новости Midix",slug:"news",is_group:true}
];

export default function Home(){
 const [session,setSession]=useState<Session|null>(null);
 const [ready,setReady]=useState(false);
 const [authMode,setAuthMode]=useState<"login"|"signup">("login");
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [username,setUsername]=useState("");
 const [authError,setAuthError]=useState("");
 const [busy,setBusy]=useState(false);
 const [active,setActive]=useState("chats");
 const [chatFilter,setChatFilter]=useState<"all"|"private"|"groups">("all");
 const [chats,setChats]=useState<Chat[]>(demoChats);
 const [selected,setSelected]=useState("demo-general");
 const [messages,setMessages]=useState<Msg[]>([]);
 const [chatPreviews,setChatPreviews]=useState<Record<string,{body:string;created_at:string}>>({});
 const [draft,setDraft]=useState("");
 const [query,setQuery]=useState("");
 const [profile,setProfile]=useState<{username:string;role:string;display_name:string|null;bio:string;is_premium:boolean;is_verified:boolean;badge_label:string|null}>({username:"Гость",role:"user",display_name:null,bio:"",is_premium:true,is_verified:false,badge_label:null});
 const [displayName,setDisplayName]=useState(""); const [bioText,setBioText]=useState(""); const [savingProfile,setSavingProfile]=useState(false);
 const [native,setNative]=useState(false);
 const [toast,setToast]=useState("");
 const [balance,setBalance]=useState(250);
 const [mobileChat,setMobileChat]=useState(false);
 const [contacts,setContacts]=useState<Contact[]>([]);
 const [contactQuery,setContactQuery]=useState("");
 const [contactsLoading,setContactsLoading]=useState(false);
 const [adminPeople,setAdminPeople]=useState<AdminPerson[]>([]); const [adminLoading,setAdminLoading]=useState(false); const [adminError,setAdminError]=useState("");
 const current=chats.find(c=>c.id===selected)||chats[0]||demoChats[0];
 const filtered=useMemo(()=>chats.filter(c=>c.title.toLowerCase().includes(query.toLowerCase())&&(chatFilter==="all"||(chatFilter==="groups"&&c.is_group)||(chatFilter==="private"&&!c.is_group))),[chats,query,chatFilter]);
 const say=(s:string)=>{setToast(s);window.setTimeout(()=>setToast(""),2600)};
 useEffect(()=>{if(!session||!supabase||!chats.length)return;let live=true;(async()=>{const ids=chats.filter(c=>!c.id.startsWith("demo-")).map(c=>c.id);if(!ids.length)return;const {data}=await supabase!.from("messages").select("chat_id,body,created_at").in("chat_id",ids).order("created_at",{ascending:false}).limit(300);if(!live||!data)return;const latest:Record<string,{body:string;created_at:string}>={};for(const m of data){if(!latest[m.chat_id])latest[m.chat_id]={body:m.body,created_at:m.created_at};}setChatPreviews(latest)})();return()=>{live=false}},[session,chats]);

 useEffect(()=>{
  setNative(/Capacitor|MidixGramAndroid/i.test(navigator.userAgent));
  if(!supabase){setReady(true);return}
  supabase.auth.getSession().then(({data})=>{setSession(data.session);setReady(true)});
  const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,next)=>setSession(next));
  return()=>subscription.unsubscribe();
 },[]);
 useEffect(()=>{
  if(!session||!supabase)return;
  let live=true;
  (async()=>{
   const {data:prof}=await supabase!.from("profiles").select("username,role,display_name,bio,is_premium,is_verified,badge_label").eq("id",session.user.id).maybeSingle();
   if(live&&prof){setProfile({username:prof.username,role:prof.role,display_name:prof.display_name,bio:prof.bio||"",is_premium:prof.is_premium??true,is_verified:prof.is_verified??false,badge_label:prof.badge_label||null});setDisplayName(prof.display_name||"");setBioText(prof.bio||"");}
   const {data:publicRooms}=await supabase!.from("chats").select("id,title,slug,is_group").eq("is_public",true).order("created_at");
   if(publicRooms?.length){
    const joins=publicRooms.map((r:any)=>({chat_id:r.id,user_id:session.user.id}));
    await supabase!.from("chat_members").upsert(joins,{onConflict:"chat_id,user_id",ignoreDuplicates:true});
   }
   const {data:members}=await supabase!.from("chat_members").select("chat_id").eq("user_id",session.user.id);
   const ids=(members||[]).map((m:any)=>m.chat_id);
   const {data:joined}=ids.length?await supabase!.from("chats").select("id,title,slug,is_group").in("id",ids).order("created_at"):({data:[] as any[]});
   const rooms=[...(publicRooms||[]),...(joined||[])].filter((r:any,i:number,a:any[])=>a.findIndex(x=>x.id===r.id)===i);
   if(live&&rooms.length){
    setChats(rooms as Chat[]);
    setSelected(old=>rooms.some((r:any)=>r.id===old)?old:rooms[0].id);
   } else if(live){setChats([]);setSelected("");}
  })();
  return()=>{live=false};
 },[session]);
 useEffect(()=>{
  if(!session||!supabase||!current||current.id.startsWith("demo-")){setMessages([]);return}
  let live=true;
  (async()=>{
   const {data,error}=await supabase!.from("messages").select("id,chat_id,sender_id,body,created_at,profiles(username)").eq("chat_id",current.id).order("created_at").limit(100);
   if(live&&!error)setMessages((data||[]) as unknown as Msg[]);
   if(error&&live)say(error.message);
  })();
  const channel=supabase.channel("messages-"+current.id).on("postgres_changes",{event:"INSERT",schema:"public",table:"messages",filter:"chat_id=eq."+current.id},async payload=>{
   const row=payload.new as Msg;
   if(!live)return;
   const {data:sender}=await supabase!.from("profiles").select("username").eq("id",row.sender_id).maybeSingle();
   setMessages(old=>[...old,{...row,profiles:sender}]);
  }).subscribe();
  return()=>{live=false;supabase!.removeChannel(channel)};
 },[session,current?.id]);
 async function auth(e:React.FormEvent){
  e.preventDefault();setAuthError("");setBusy(true);
  try{
   if(!supabase){setAuthError("Добавь ключи Supabase в GitHub Secrets и .env.local — тогда регистрация будет онлайн.");return}
   if(authMode==="signup"){
    const {error}=await supabase.auth.signUp({email,password,options:{data:{username:username.trim()||email.split("@")[0]}}});
    if(error)throw error;say("Проверь почту для подтверждения регистрации");
   }else{const {error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error}
  }catch(err:any){setAuthError(err.message||"Ошибка авторизации")}finally{setBusy(false)}
 }
 async function send(e:React.FormEvent){
  e.preventDefault();const body=draft.trim();if(!body)return;
  if(!session||!supabase){say("Войди в аккаунт, чтобы отправлять сообщения");return}
  if(current.id.startsWith("demo-")){say("Не удалось найти комнату на сервере");return}
  setDraft("");
  const {error}=await supabase.from("messages").insert({chat_id:current.id,sender_id:session.user.id,body});
  if(error){setDraft(body);say(error.message)}
 }
 async function loadContacts(){
  if(!supabase||!session)return;
  setContactsLoading(true);
  const {data,error}=await supabase.from("profiles").select("id,username,display_name").neq("id",session.user.id).order("username").limit(100);
  if(error)say(error.message);else setContacts((data||[]) as Contact[]);
  setContactsLoading(false);
 }
 async function startDirectChat(person:Contact){
  if(!supabase)return;
  const {data,error}=await supabase.rpc("create_direct_chat",{target_user:person.id});
  if(error){say(error.message);return}
  const {data:room}=await supabase.from("chats").select("id,title,slug,is_group").eq("id",data).single();
  if(room){setChats(old=>[room as Chat,...old.filter(c=>c.id!==room.id)]);setSelected(room.id);setActive("chats");setMobileChat(true);say("Личный чат создан")}
 }
 async function createGroup(){
  if(!supabase||!session)return;
  const title=window.prompt("Название группы");
  if(!title?.trim())return;
  const {data:room,error}=await supabase.from("chats").insert({title:title.trim().slice(0,60),is_group:true,is_public:false,created_by:session.user.id}).select("id,title,slug,is_group").single();
  if(error||!room){say(error?.message||"Не удалось создать группу");return}
  const {error:joinError}=await supabase.from("chat_members").insert({chat_id:room.id,user_id:session.user.id});
  if(joinError){say(joinError.message);return}
  setChats(old=>[room as Chat,...old]);setSelected(room.id);setActive("chats");setMobileChat(true);say("Группа создана");
 }
 async function saveProfile(e:React.FormEvent){e.preventDefault();if(!supabase||!session)return;setSavingProfile(true);const {error}=await supabase.from("profiles").update({display_name:displayName.trim().slice(0,60),bio:bioText.trim().slice(0,160)}).eq("id",session.user.id);setSavingProfile(false);if(error){say(error.message);return}setProfile(p=>({...p,display_name:displayName.trim(),bio:bioText.trim()}));say("Профиль сохранён");}
 async function logout(){if(supabase)await supabase.auth.signOut();setSession(null);setProfile({username:"Гость",role:"user",display_name:null,bio:"",is_premium:true,is_verified:false,badge_label:null})}
 function openSection(section:string){if(section==="admin"&&profile.role!=="admin"){say("Нет доступа");return}setActive(section);setMobileChat(false);if(section==="contacts")loadContacts();if(section==="admin")loadAdminPeople();}
 async function loadAdminPeople(){if(!supabase||!session||profile.role!=="admin")return;setAdminLoading(true);setAdminError("");const {data:me}=await supabase.from("profiles").select("role").eq("id",session.user.id).maybeSingle();if(me?.role!=="admin"){setAdminError("Доступ запрещён");setAdminLoading(false);return;}const {data,error}=await supabase.from("profiles").select("id,username,display_name,role,created_at,is_premium,is_verified,badge_label").order("created_at",{ascending:false}).limit(200);if(error)setAdminError(error.message);else setAdminPeople((data||[]) as AdminPerson[]);setAdminLoading(false);}
 async function updateAdminPerson(person:AdminPerson,patch:Partial<AdminPerson>){if(!supabase)return;const next={...person,...patch};const {error}=await supabase.rpc("admin_set_profile_badges",{target_user:person.id,verified:next.is_verified,premium:next.is_premium,badge:next.badge_label||""});if(error){setAdminError(error.message);return;}setAdminPeople(old=>old.map(p=>p.id===person.id?next:p));say("Изменения сохранены");}

 if(!ready)return <div className="auth-screen"><div className="auth-card">Загрузка Midix Gram…</div></div>;
 if(!session)return <main className="auth-screen"><form className="auth-card" onSubmit={auth}><div className="brand-mark">M</div><span className="eyebrow">ТВОЁ ОБЩЕНИЕ • ТВОИ ПРАВИЛА</span><h1>Midix Gram</h1><p className="muted">Общайся, делись моментами и собирай подарки.</p><div className="auth-tabs"><button type="button" className={authMode==="login"?"selected":""} onClick={()=>setAuthMode("login")}>Войти</button><button type="button" className={authMode==="signup"?"selected":""} onClick={()=>setAuthMode("signup")}>Регистрация</button></div>{authMode==="signup"&&<label>Имя пользователя<input value={username} onChange={e=>setUsername(e.target.value)} required placeholder="Например, alex"/></label>}<label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="name@example.com"/></label><label>Пароль<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} placeholder="Не менее 6 символов"/></label>{authError&&<p className="error">{authError}</p>}<button className="primary full" disabled={busy}>{busy?"Подождите…":authMode==="login"?"Войти":"Создать аккаунт"}</button>{!isSupabaseConfigured&&<div className="demo-note">Сервер пока не подключён. Добавь NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY в настройки проекта. Это не демо-авторизация: вход станет доступен после подключения.</div>}</form></main>;

 return <main className={mobileChat?"app-shell chat-open":"app-shell"}>
  <aside className="rail"><div className="brand-mark">M</div><button className={active==="chats"?"rail-btn active":"rail-btn"} onClick={()=>openSection("chats")} aria-label="Чаты"><MessageCircle/></button><button className={active==="contacts"?"rail-btn active":"rail-btn"} onClick={()=>openSection("contacts")} aria-label="Контакты"><Users/></button><button className={active==="gifts"?"rail-btn active":"rail-btn"} onClick={()=>openSection("gifts")} aria-label="Подарки"><Gift/></button><button className={active==="profile"?"rail-btn active":"rail-btn"} onClick={()=>openSection("profile")} aria-label="Профиль"><UserRound/></button><button className={active==="settings"?"rail-btn active":"rail-btn"} onClick={()=>openSection("settings")} aria-label="Настройки"><Settings/></button>{profile.role==="admin"&&<button className="rail-btn" onClick={()=>openSection("admin")} aria-label="Админ-панель"><ShieldCheck/></button>}<div className="rail-spacer"/><button className="rail-btn" onClick={logout} aria-label="Выйти"><LogOut/></button><div className="profile-mini">{profile.username.slice(0,1).toUpperCase()}</div></aside>
  <nav className="mobile-nav" aria-label="Основная навигация"><button className={active==="chats"?"active":""} onClick={()=>openSection("chats")}><MessageCircle/><span>Чаты</span></button><button className={active==="contacts"?"active":""} onClick={()=>openSection("contacts")}><Users/><span>Контакты</span></button><button className={active==="gifts"?"active":""} onClick={()=>openSection("gifts")}><Gift/><span>Подарки</span></button><button className={active==="profile"?"active":""} onClick={()=>openSection("profile")}><UserRound/><span>Профиль</span></button><button className={active==="settings"?"active":""} onClick={()=>openSection("settings")}><Settings/><span>Настройки</span></button>{profile.role==="admin"&&<button className={active==="admin"?"active":""} onClick={()=>openSection("admin")}><ShieldCheck/><span>Админ</span></button>}</nav>
  <section className={mobileChat||active!=="chats"?"sidebar mobile-hide":"sidebar"}><header className="side-header"><div><span className="eyebrow">MESSENGER</span><h1>Midix <b>Gram</b></h1></div><div className="side-head-actions"><button className="icon-btn" onClick={()=>openSection("contacts")} aria-label="Новое сообщение"><MessageCircle/></button><button className="icon-btn" onClick={createGroup} aria-label="Создать группу"><Plus/></button></div></header><div className="search-box"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Поиск чатов"/></div><div className="chat-filter-tabs"><button className={chatFilter==="all"?"chosen":""} onClick={()=>setChatFilter("all")}>Все</button><button className={chatFilter==="private"?"chosen":""} onClick={()=>setChatFilter("private")}>Личные</button><button className={chatFilter==="groups"?"chosen":""} onClick={()=>setChatFilter("groups")}>Группы</button></div><div className="section-label">ВСЕ СООБЩЕНИЯ <span>{filtered.length}</span></div><div className="chat-list">{filtered.map((chat,i)=><button key={chat.id} onClick={()=>{setSelected(chat.id);setActive("chats");setMobileChat(true)}} className={selected===chat.id?"chat-row selected":"chat-row"}><span className="avatar" style={{background:["#64748b","#7c6cf2","#e58a65","#299c91"][i%4]}}>{chat.title[0]}</span><span className="chat-copy"><b>{chat.title}</b><small>{chatPreviews[chat.id]?.body||(chat.slug==="news"?"Обновления Midix":chat.is_group?"Групповой чат":"Личный диалог")}</small></span></button>)}</div><div className="sidebar-footer"><span className="status-dot"/>{isSupabaseConfigured?"Онлайн-соединение":"Сервер не настроен"} <MoreHorizontal size={17}/></div></section>
  <section className={mobileChat||active!=="chats"?"conversation":"conversation mobile-hide"}>
   {active==="admin"?<div className="welcome-panel admin-mobile"><div className="hero-icon"><ShieldCheck size={34}/></div><span className="eyebrow">MIDIX GRAM · ADMIN</span><h2>Админ-панель</h2><p>Управление Premium, верификацией и метками пользователей.</p><div className="admin-mobile-head"><b>Пользователи · {adminPeople.length}</b><button className="icon-btn" onClick={loadAdminPeople} disabled={adminLoading}><RefreshCw size={17}/></button></div>{adminError&&<p className="error">{adminError}</p>}{adminLoading?<p>Загрузка пользователей…</p>:adminPeople.map(person=><article className="admin-mobile-user" key={person.id}><div className="admin-mobile-user-title"><b>{person.display_name||person.username}</b><small>@{person.username} · {person.role}</small></div><div className="admin-user-badges">{person.is_premium&&<i>PREMIUM</i>}{person.is_verified&&<i>✓ VERIFIED</i>}{person.badge_label&&<i>{person.badge_label}</i>}</div><div className="admin-mobile-actions"><button onClick={()=>updateAdminPerson(person,{is_verified:!person.is_verified})}>{person.is_verified?"Снять ✓":"Выдать ✓"}</button><button onClick={()=>updateAdminPerson(person,{is_premium:!person.is_premium})}>{person.is_premium?"Снять Premium":"Выдать Premium"}</button><button onClick={()=>{const label=window.prompt("Название метки",person.badge_label||"");if(label!==null)updateAdminPerson(person,{badge_label:label.trim().slice(0,32)||null})}}>Метка</button></div></article>)}</div>:{active==="profile"?<div className="welcome-panel profile-editor"><div className="profile-avatar">{(profile.display_name||profile.username).slice(0,1).toUpperCase()}</div><span className="eyebrow">MIDIX IDENTITY</span><h2>{profile.display_name||profile.username}</h2><p>@{profile.username}</p><div className="identity-badges">{profile.is_premium&&<span className="premium-mark"><Crown size={14}/> PREMIUM</span>}{profile.is_verified&&<span className="verified-mark"><BadgeCheck size={14}/> ПРОВЕРЕН</span>}{profile.badge_label&&<span className="custom-mark">{profile.badge_label}</span>}</div><form className="profile-form" onSubmit={saveProfile}><label>Отображаемое имя<input value={displayName} onChange={e=>setDisplayName(e.target.value)} maxLength={60} placeholder="Как тебя называть"/></label><label>О себе<textarea value={bioText} onChange={e=>setBioText(e.target.value)} maxLength={160} placeholder="Расскажи о себе"/></label><button className="primary" disabled={savingProfile}>{savingProfile?"Сохраняем…":"Сохранить профиль"}</button></form><p className="premium-note"><Crown size={16}/> Premium включён бесплатно для всех пользователей Midix Gram.</p><p className="muted">Верификация и специальные метки выдаются администрацией после проверки.</p></div>:active==="settings"?<div className="welcome-panel"><div className="hero-icon"><Settings size={34}/></div><span className="eyebrow">PREFERENCES</span><h2>Настройки</h2><p>Управление аккаунтом и сеансом.</p><button className="primary" onClick={logout}>Выйти из аккаунта</button></div>:active==="gifts"?<div className="welcome-panel"><div className="hero-icon"><Gift size={34}/></div><span className="eyebrow">MIDIX COLLECTIBLES</span><h2>Подарки и коллекции</h2><p>Каталог подарков. Реальные покупки и NFT пока отключены.</p><div className="gift-cards">{gifts.map(g=><article key={g.title}><span>{g.emoji}</span><b>{g.title}</b><small>{g.rarity}</small><strong>{g.price} ⭐</strong></article>)}</div></div>:active==="contacts"?<div className="welcome-panel contacts-panel"><div className="hero-icon"><Users size={34}/></div><span className="eyebrow">MIDIX PEOPLE</span><h2>Контакты</h2><p>Найди пользователя и начни личный диалог.</p><div className="contact-search"><Search size={18}/><input value={contactQuery} onChange={e=>setContactQuery(e.target.value)} placeholder="Поиск по имени пользователя"/></div>{contactsLoading?<p>Загружаем пользователей…</p>:contacts.filter(p=>p.username.toLowerCase().includes(contactQuery.toLowerCase())||(p.display_name||"").toLowerCase().includes(contactQuery.toLowerCase())).map(p=><button className="contact-row" key={p.id} onClick={()=>startDirectChat(p)}><span className="avatar">{(p.display_name||p.username)[0].toUpperCase()}</span><span><b>{p.display_name||p.username}</b><small>@{p.username}</small></span><span className="contact-action">Написать</span></button>)}{!contactsLoading&&contacts.length===0&&<p>Пока нет других пользователей. Пригласи друзей зарегистрироваться.</p>}</div>:<><header className="conversation-header"><button className="back-mobile" onClick={()=>setMobileChat(false)}>‹</button><div className="avatar large">{current?.title?.[0]||"M"}</div><div className="person-title"><b>{current?.title||"Чат"}</b><small>{session.user.email}</small></div><div className="header-actions"><button className="icon-btn"><Search/></button><button className="icon-btn"><Bell/></button><button className="icon-btn"><MoreHorizontal/></button></div></header><div className="message-area"><div className="date-chip">СООБЩЕНИЯ</div>{messages.map(m=><div key={m.id} className={m.sender_id===session.user.id?"bubble outgoing":"bubble incoming"}>{m.sender_id===session.user.id?"Вы":m.profiles?.username||"Пользователь"}: {m.body}<small>{new Date(m.created_at).toLocaleTimeString("ru-RU",{hour:"2-digit",minute:"2-digit"})}</small></div>)}{messages.length===0&&<div className="system-note">Пока нет сообщений. Напиши первым!</div>}</div><form className="composer" onSubmit={send}><button type="button" className="icon-btn" onClick={()=>say("Вложения появятся в следующем обновлении")}><Plus/></button><input value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Написать сообщение…"/><button type="button" className="icon-btn muted" onClick={()=>setDraft(d=>d+" 😊")}><Smile/></button><button className="send-btn" aria-label="Отправить"><Send size={18}/></button></form></>}
  </section>
  <aside className="info-panel"><div className="info-top"><span className="eyebrow">ВАШ ПРОФИЛЬ</span><button className="icon-btn" onClick={logout}><LogOut/></button></div><div className="profile-card"><div className="profile-avatar">{profile.username.slice(0,1).toUpperCase()}</div><h2>{profile.username}</h2><p className="handle">{session.user.email}</p><span className="profile-badge"><ShieldCheck size={13}/> {profile.role==="admin"?"Администратор":"Midix member"}</span>{profile.is_premium&&<span className="premium-mark"><Crown size={13}/> PREMIUM</span>}{profile.is_verified&&<span className="verified-mark"><BadgeCheck size={13}/> Проверен</span>}</div><div className="info-divider"/><div className="info-section"><div className="section-label">БЫСТРЫЙ ДОСТУП</div><button onClick={()=>setActive("gifts")}><Gift/> Подарки <span>✦</span></button><button onClick={()=>say("Медиафайлы появятся позже")}><ImageIcon/> Медиафайлы <span>—</span></button><button onClick={()=>say("Архив чатов пока не подключён к серверу")}><Archive/> Архив чатов <span>скоро</span></button></div><div className="info-tip"><span>✦</span><b>Midix collectibles</b><p>Цифровые подарки и коллекции будут расширены после настройки сервера.</p></div>{profile.role==="admin"&&<button className="admin-link" onClick={()=>openSection("admin")}><LockKeyhole size={14}/> ADMIN CONSOLE</button>}</aside>
  {toast&&<div className="toast">{toast}</div>}
 </main>;
}
