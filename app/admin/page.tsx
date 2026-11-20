"use client";
import { useEffect,useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { ShieldCheck,ArrowLeft,RefreshCw,Users,Gift,LockKeyhole } from "lucide-react";

type Person={id:string;username:string;display_name:string|null;role:string;created_at:string;is_premium:boolean;is_verified:boolean;badge_label:string|null};
export default function AdminPage(){
 const router=useRouter();
 const [loading,setLoading]=useState(true);
 const [allowed,setAllowed]=useState(false);
 const [people,setPeople]=useState<Person[]>([]);
 const [error,setError]=useState("");
 async function load(){
  if(!supabase){setError("Supabase не настроен.");setLoading(false);return}
  const {data:{session}}=await supabase.auth.getSession();
  if(!session){router.replace("/");return}
  const {data:me,error:meError}=await supabase.from("profiles").select("role").eq("id",session.user.id).maybeSingle();
  if(meError||me?.role!=="admin"){setAllowed(false);setLoading(false);return}
  setAllowed(true);
  const {data,error:peopleError}=await supabase.from("profiles").select("id,username,display_name,role,created_at,is_premium,is_verified,badge_label").order("created_at",{ascending:false}).limit(200);
  if(peopleError)setError(peopleError.message);else setPeople((data||[]) as Person[]);
  setLoading(false);
 }
 async function updatePerson(id:string,patch:Partial<Person>){if(!supabase)return;const person=people.find(p=>p.id===id);if(!person)return;const next={...person,...patch};const {error}=await supabase.rpc("admin_set_profile_badges",{target_user:id,verified:next.is_verified,premium:next.is_premium,badge:next.badge_label||""});if(error){setError(error.message);return}setPeople(old=>old.map(p=>p.id===id?next:p));}
 useEffect(()=>{if(/Capacitor|MidixGramAndroid/i.test(navigator.userAgent)){setError("Админ-панель доступна только на сайте.");setLoading(false);return}load()},[]);
 if(loading)return <main className="admin-page">Загрузка панели…</main>;
 if(!allowed)return <main className="admin-page"><div className="admin-card"><LockKeyhole/><h1>Доступ запрещён</h1><p>{error||"Для просмотра панели нужна роль администратора."}</p><button onClick={()=>router.push("/")}>На главную</button></div></main>;
 return <main className="admin-page"><header><div><span className="eyebrow">MIDIX GRAM · WEB ONLY</span><h1><ShieldCheck/> Админ-панель</h1><p>Управление аккаунтами и просмотр статуса сервиса.</p></div><button onClick={()=>router.push("/")}><ArrowLeft/> В приложение</button></header><section className="admin-stats"><article><Users/><span>Пользователи</span><b>{people.length}</b></article><article><Gift/><span>Каталог подарков</span><b>6</b></article></section><section className="admin-card"><div className="admin-card-head"><h2>Пользователи</h2><button onClick={()=>{setLoading(true);load()}}><RefreshCw size={16}/> Обновить</button></div>{error&&<p className="error">{error}</p>}<div className="admin-table"><div className="admin-table-row heading"><span>Имя</span><span>Метки</span><span>Управление</span><span>Создан</span></div>{people.map(p=><div className="admin-table-row admin-user-row" key={p.id}><span><b>{p.display_name||p.username}</b><small>@{p.username} · {p.role}</small></span><span className="admin-user-badges">{p.is_premium&&<i>PREMIUM</i>}{p.is_verified&&<i>✓ VERIFIED</i>}{p.badge_label&&<i>{p.badge_label}</i>}</span><span className="admin-user-actions"><button onClick={()=>updatePerson(p.id,{is_verified:!p.is_verified})}>{p.is_verified?"Снять ✓":"Выдать ✓"}</button><button onClick={()=>updatePerson(p.id,{is_premium:!p.is_premium})}>{p.is_premium?"Снять Premium":"Выдать Premium"}</button><button onClick={()=>{const label=window.prompt("Название метки (пусто — убрать)",p.badge_label||"");if(label!==null)updatePerson(p.id,{badge_label:label.trim().slice(0,32)||null})}}>Метка</button></span><span>{new Date(p.created_at).toLocaleDateString("ru-RU")}</span></div>)}</div></section><p className="admin-foot">Привилегии должны назначаться через SQL/RLS, а не из публичного интерфейса.</p></main>;
}
