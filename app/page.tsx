"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Archive, Bell, Gift, Image as ImageIcon, MessageCircle, MoreHorizontal, Plus, Search, Send, Settings, ShieldCheck, Smile, Users, LogOut, LockKeyhole, UserRound, Crown, BadgeCheck, RefreshCw } from "lucide-react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

type Chat = { id:string; title:string; slug:string; is_group:boolean };
type Msg = { id:string; chat_id:string; sender_id:string; body:string; created_at:string; reply_to_id?:string|null; edited_at?:string|null; media_path?:string|null; media_type?:string|null; file_name?:string|null; file_size?:number|null; media_url?:string|null; profiles?:{username:string}|null };
type Reaction = {id:string;message_id:string;user_id:string;emoji:"👍"|"❤️"|"😂"|"🔥"|"👏"};
type Contact = { id:string; username:string; display_name:string|null; is_verified?:boolean; is_premium?:boolean; badge_label?:string|null };
type AdminPerson = {id:string;username:string;display_name:string|null;role:string;created_at:string;is_premium:boolean;is_verified:boolean;badge_label:string|null;stars_balance:number};

const emojiSets:Record<string,string[]>={
 "Часто":["😂","❤️","😍","🥰","😊","😭","😘","🔥","👍","🙏","🥳","✨","🤣","💕","😎","🤔","🙌","💀","😅","🫶","💯","👏","🎉","🥹","😴","🤍","💔","😇","🤗","😜","😡","🤝"],
 "Смайлы":["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😗","☺️","😚","😙","🥲","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🫢","🫣","🤫","🤔","🫡","🤐","🤨","😐","😑","😶","🫥","😏","😒","🙄","😬","😮‍💨","🤥","😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤮","🥵","🥶","🥴","😵","🤯","🥳","🥸","😎","🤓","🧐","😕","🫤","😟","🙁","☹️","😮","😯","😲","😳","🥺","🥹","😦","😧","😨","😰","😥","😢","😭","😱","😖","😣","😞","😓","😩","😫","🥱","😤","😡","😠","🤬","😈","👿","💀","☠️","💩","🤡","👻","👽","🤖"],
 "Жесты":["👋","🤚","🖐️","✋","🖖","🫱","🫲","🫳","🫴","👌","🤌","🤏","✌️","🤞","🫰","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","🫵","👍","👎","✊","👊","🤛","🤜","👏","🙌","👐","🤲","🤝","🙏","✍️","💅","🤳","💪","🦾","🦿","🦵","🦶","👂","🦻","👃","🧠","🫀","🫁","🦷","🦴","👀","👁️","👅","👄"],
 "Сердца":["❤️","🩷","🧡","💛","💚","💙","🩵","💜","🤎","🖤","🩶","🤍","💔","❤️‍🔥","❤️‍🩹","💕","💞","💓","💗","💖","💘","💝","💟","❣️","💌","💋","🫶"],
 "Животные":["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐻‍❄️","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🙈","🙉","🙊","🐔","🐧","🐦","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🪱","🐛","🦋","🐌","🐞","🐜","🪰","🦟","🪳","🕷️","🦂","🐢","🐍","🦎","🦖","🦕","🐙","🦑","🦐","🦞","🦀","🐡","🐠","🐟","🐬","🐳","🦈","🐊","🐅","🐆","🦓","🦍","🦧","🐘","🦛","🦏","🐪","🐫","🦒","🦘","🦬","🐃","🐂","🐄","🐎","🐖","🐏","🐑","🦙","🐐","🦌","🐕","🐈","🐓","🦃","🦚","🦜","🦢","🦩","🕊️","🐇","🦝","🦨","🦡","🦦","🦥","🐁","🐀","🐿️","🦔"],
 "Еда":["🍏","🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🍆","🥑","🥦","🥬","🥒","🌶️","🫑","🌽","🥕","🫒","🧄","🧅","🥔","🍠","🥐","🥯","🍞","🥖","🥨","🧀","🥚","🍳","🧈","🥞","🧇","🥓","🥩","🍗","🍖","🌭","🍔","🍟","🍕","🫓","🥪","🥙","🧆","🌮","🌯","🫔","🥗","🥘","🫕","🍝","🍜","🍲","🍛","🍣","🍱","🥟","🦪","🍤","🍙","🍚","🍘","🍥","🥠","🥮","🍢","🍡","🍧","🍨","🍦","🥧","🧁","🍰","🎂","🍮","🍭","🍬","🍫","🍿","🍩","🍪","🌰","🥜","🍯","🥛","🍼","☕","🫖","🍵","🧃","🥤","🧋","🍺","🍻","🥂","🍷","🥃","🍸","🍹","🧉","🍾"],
 "Путешествия":["🚗","🚕","🚙","🚌","🚎","🏎️","🚓","🚑","🚒","🚐","🛻","🚚","🚛","🚜","🛵","🏍️","🛺","🚲","🛴","🛹","🛼","🚁","✈️","🛩️","🛫","🛬","🪂","🚀","🛸","🚉","🚄","🚅","🚆","🚇","🚈","🚂","🚢","⛵","🛶","🚤","🛥️","🛳️","⚓","⛽","🚧","🚦","🚥","🏖️","🏝️","🏜️","🌋","⛰️","🏔️","🗻","🏕️","🏟️","🏛️","🏗️","🧱","🏘️","🏙️","🌃","🌉","🌌","🌠","🎆","🎇","🌇","🌆","🏞️","🌅","🌄"],
 "Предметы":["⌚","📱","📲","💻","⌨️","🖥️","🖨️","🖱️","🖲️","🕹️","🗜️","💽","💾","💿","📀","📷","📸","📹","🎥","📞","☎️","📟","📠","📺","📻","🎙️","🎚️","🎛️","🧭","⏱️","⏰","⌛","📡","🔋","🪫","💡","🔦","🕯️","🪔","🧯","🛢️","💸","💵","💴","💶","💷","🪙","💰","💳","🧾","💎","⚖️","🪜","🧰","🪛","🔧","🔨","⚒️","🛠️","⛏️","🪚","🔩","⚙️","🧱","⛓️","🧲","🔫","💣","🧨","🔪","🗡️","🛡️","🚬","⚰️","⚱️","🏺","🔮","📿","🧿","🪬","💈","⚗️","🔭","🔬","🩻","🩺","💊","💉","🩹","🩼","🩻","🧬","🦠","🧫","🧪","🌡️","🧹","🪠","🧺","🧻","🪣","🧼","🫧","🪥","🧽","🧴","🔑","🗝️","🚪","🪑","🛏️","🛋️","🪞","🪟","🛁","🚿","🪤","🪒","🧸","🖼️","🛍️","🎁","🎈","🎀","🪄","🪅","🎊","🎉","🎎","🏆","🥇","🎮","🧩","🎯","🎲","🎭","🎨","🧵","🪡","🧶","🪢"],
 "Символы":["❤️","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟","☮️","✝️","☪️","🕉️","☸️","✡️","🔯","🕎","☯️","☦️","🛐","⛎","♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓","🆔","⚛️","🉑","☢️","☣️","📴","📳","🈶","🈚","🈸","🈺","🈷️","✴️","🆚","💮","🉐","㊙️","㊗️","🈴","🈵","🈹","🈲","🅰️","🅱️","🆎","🅾️","🆑","🆒","🆓","ℹ️","🆕","🆖","🆗","🆙","🆘","🆔","🔴","🟠","🟡","🟢","🔵","🟣","⚫","⚪","🟤","🔺","🔻","💠","🔘","🔳","🔲","▪️","▫️","◾","◽","🔶","🔷","🔸","🔹","🔈","🔉","🔊","🔔","🔕","📣","📢","💬","💭","🗯️","♻️","⚜️","🔱","📛","🔰","⭕","✅","☑️","✔️","❌","❎","➕","➖","➗","✖️","♾️","💲","#️⃣","*️⃣","0️⃣","1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"]
};

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
 const [authMethod,setAuthMethod]=useState<"phone"|"email">("phone");
 const [phone,setPhone]=useState(""); const [otp,setOtp]=useState(""); const [otpSent,setOtpSent]=useState(false);
 const [firstName,setFirstName]=useState(""); const [lastName,setLastName]=useState("");
 const [username,setUsername]=useState("");
 const [authError,setAuthError]=useState("");
 const [busy,setBusy]=useState(false);
 const [active,setActive]=useState("chats");
 const [chatFilter,setChatFilter]=useState<"all"|"private"|"groups">("all");
 const [chats,setChats]=useState<Chat[]>(demoChats);
 const [selected,setSelected]=useState("demo-general");
 const [messages,setMessages]=useState<Msg[]>([]);
 const [replyTo,setReplyTo]=useState<Msg|null>(null);
 const [editingMessageId,setEditingMessageId]=useState<string|null>(null);
 const [messageSearchOpen,setMessageSearchOpen]=useState(false);
 const [messageQuery,setMessageQuery]=useState("");
 const [reactions,setReactions]=useState<Reaction[]>([]);
 const [chatPreviews,setChatPreviews]=useState<Record<string,{body:string;created_at:string}>>({});
 const [draft,setDraft]=useState("");
 const [emojiOpen,setEmojiOpen]=useState(false);
 const [emojiCategory,setEmojiCategory]=useState("Часто");
 const [emojiSearch,setEmojiSearch]=useState("");
 const [query,setQuery]=useState("");
 type ProfileState={username:string;role:string;display_name:string|null;bio:string;is_premium:boolean;is_verified:boolean;badge_label:string|null;stars_balance:number;avatar_url:string|null;cover_url:string|null;profile_color:string;profile_emoji:string;profile_status:string;location:string;website:string;birthday:string;pronouns:string;music_status:string};
 const [profile,setProfile]=useState<ProfileState>({username:"Гость",role:"user",display_name:null,bio:"",is_premium:true,is_verified:false,badge_label:null,stars_balance:250,avatar_url:null,cover_url:null,profile_color:"#3390ec",profile_emoji:"✨",profile_status:"",location:"",website:"",birthday:"",pronouns:"",music_status:""});
 const [displayName,setDisplayName]=useState(""); const [bioText,setBioText]=useState(""); const [savingProfile,setSavingProfile]=useState(false); const [uploadingMedia,setUploadingMedia]=useState<"avatar"|"cover"|null>(null);
 const [native,setNative]=useState(false);
 const [recording,setRecording]=useState(false);
 const [uploadingChatMedia,setUploadingChatMedia]=useState(false);
 const [voiceRecorder,setVoiceRecorder]=useState<MediaRecorder|null>(null);
 const voiceChunks=useRef<Blob[]>([]);
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
 async function attachSignedMedia(rows:Msg[]):Promise<Msg[]>{if(!supabase)return rows;return Promise.all(rows.map(async m=>{if(!m.media_path)return m;const {data,error}=await supabase!.storage.from("chat-media").createSignedUrl(m.media_path,3600);return {...m,media_url:error?null:data?.signedUrl||null};}));}
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
   const {data:prof}=await supabase!.from("profiles").select("username,role,display_name,bio,is_premium,is_verified,badge_label,stars_balance,avatar_url,cover_url,profile_color,profile_emoji,profile_status,location,website,birthday,pronouns,music_status").eq("id",session.user.id).maybeSingle();
   if(live&&prof){setProfile({username:prof.username,role:prof.role,display_name:prof.display_name,bio:prof.bio||"",is_premium:prof.is_premium??true,is_verified:prof.is_verified??false,badge_label:prof.badge_label||null,stars_balance:prof.stars_balance??250,avatar_url:prof.avatar_url||null,cover_url:prof.cover_url||null,profile_color:prof.profile_color||"#3390ec",profile_emoji:prof.profile_emoji||"✨",profile_status:prof.profile_status||"",location:prof.location||"",website:prof.website||"",birthday:prof.birthday||"",pronouns:prof.pronouns||"",music_status:prof.music_status||""});setDisplayName(prof.display_name||"");setBioText(prof.bio||"");}
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
   const {data,error}=await supabase!.from("messages").select("id,chat_id,sender_id,body,created_at,reply_to_id,edited_at,media_path,media_type,file_name,file_size,profiles(username)").eq("chat_id",current.id).order("created_at").limit(100);
   if(live&&!error)setMessages(await attachSignedMedia((data||[]) as unknown as Msg[]));
   if(error&&live)say(error.message);
  })();
  const channel=supabase.channel("messages-"+current.id).on("postgres_changes",{event:"*",schema:"public",table:"messages",filter:"chat_id=eq."+current.id},async payload=>{
   if(!live)return;
   if(payload.eventType==="DELETE"){const gone=(payload.old as Partial<Msg>).id;if(gone)setMessages(old=>old.filter(m=>m.id!==gone));return;}
   const row=payload.new as Msg;
   if(payload.eventType==="UPDATE"){setMessages(old=>old.map(m=>m.id===row.id?{...m,...row}:m));return;}
   const {data:sender}=await supabase!.from("profiles").select("username").eq("id",row.sender_id).maybeSingle();
   setMessages(old=>old.some(m=>m.id===row.id)?old:[...old,{...row,profiles:sender}]);
  }).subscribe();
  return()=>{live=false;supabase!.removeChannel(channel)};
 },[session,current?.id]);
 async function auth(e:React.FormEvent){
  e.preventDefault();setAuthError("");setBusy(true);
  try{
   if(!supabase){setAuthError("Сервер авторизации не настроен.");return}
   if(authMethod==="phone"){
    const normalized=phone.replace(/[\s()-]/g,"");
    if(!/^\+[1-9]\d{7,14}$/.test(normalized)){setAuthError("Введи номер в международном формате, например +31612345678.");return}
    if(!otpSent){
     if(authMode==="signup"&&(!firstName.trim()||!username.trim())){setAuthError("Укажи имя и username.");return}
     const {error}=await supabase.auth.signInWithOtp({phone:normalized,options:{shouldCreateUser:authMode==="signup",data:authMode==="signup"?{username:username.trim().toLowerCase(),display_name:[firstName.trim(),lastName.trim()].filter(Boolean).join(" ")}:undefined}});
     if(error)throw error;setPhone(normalized);setOtpSent(true);say("Код отправлен по SMS");
    }else{
     if(!/^\d{6}$/.test(otp.trim())){setAuthError("Введи 6-значный код из SMS.");return}
     const {error}=await supabase.auth.verifyOtp({phone:normalized,token:otp.trim(),type:"sms"});
     if(error)throw error;
    }
   }else if(authMode==="signup"){
    const {error}=await supabase.auth.signUp({email,password,options:{data:{username:username.trim()||email.split("@")[0],display_name:[firstName.trim(),lastName.trim()].filter(Boolean).join(" ")}}});
    if(error)throw error;say("Проверь почту для подтверждения регистрации");
   }else{const {error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error}
  }catch(err:any){setAuthError(err.message||"Ошибка авторизации")}finally{setBusy(false)}
 }
 useEffect(()=>{if(!session||!supabase||!messages.length)return;let live=true;(async()=>{const {data}=await supabase!.from("message_reactions").select("id,message_id,user_id,emoji").in("message_id",messages.map(m=>m.id));if(live)setReactions((data||[]) as Reaction[])})();return()=>{live=false}},[session,messages.map(m=>m.id).join(",")]);
 async function toggleReaction(messageId:string,emoji:Reaction["emoji"]){if(!supabase||!session)return;const existing=reactions.find(r=>r.message_id===messageId&&r.user_id===session.user.id&&r.emoji===emoji);if(existing){const {error}=await supabase.from("message_reactions").delete().eq("id",existing.id);if(error){say(error.message);return}setReactions(old=>old.filter(r=>r.id!==existing.id));}else{const {data,error}=await supabase.from("message_reactions").insert({message_id:messageId,user_id:session.user.id,emoji}).select("id,message_id,user_id,emoji").single();if(error){say(error.message);return}setReactions(old=>[...old,data as Reaction]);}}
 async function send(e:React.FormEvent){
  e.preventDefault();const body=draft.trim();if(!body)return;
  if(!session||!supabase){say("Войди в аккаунт, чтобы отправлять сообщения");return}
  if(current.id.startsWith("demo-")){say("Не удалось найти комнату на сервере");return}
  setDraft("");
  if(editingMessageId){const {error}=await supabase.from("messages").update({body,edited_at:new Date().toISOString()}).eq("id",editingMessageId).eq("sender_id",session.user.id);if(error){setDraft(body);say(error.message);return;}setMessages(old=>old.map(m=>m.id===editingMessageId?{...m,body,edited_at:new Date().toISOString()}:m));setEditingMessageId(null);say("Сообщение изменено");return;}
  const {error}=await supabase.from("messages").insert({chat_id:current.id,sender_id:session.user.id,body,reply_to_id:replyTo?.id||null});
  if(error){setDraft(body);say(error.message)}else setReplyTo(null);
 }
 function beginReply(message:Msg){setEditingMessageId(null);setReplyTo(message);}
 function beginEdit(message:Msg){setReplyTo(null);setEditingMessageId(message.id);setDraft(message.body);}
 async function deleteMessage(message:Msg){if(!supabase||!session||message.sender_id!==session.user.id)return;if(!window.confirm("Удалить это сообщение?"))return;const {error}=await supabase.from("messages").delete().eq("id",message.id).eq("sender_id",session.user.id);if(error){say(error.message);return;}setMessages(old=>old.filter(m=>m.id!==message.id));setReactions(old=>old.filter(r=>r.message_id!==message.id));say("Сообщение удалено");}
 async function loadContacts(){
  if(!supabase||!session)return;
  setContactsLoading(true);
  const {data,error}=await supabase.from("profiles").select("id,username,display_name,is_verified,is_premium,badge_label").neq("id",session.user.id).order("username").limit(100);
  if(error)say(error.message);else setContacts((data||[]) as Contact[]);
  setContactsLoading(false);
 }
 async function startDirectChat(person:Contact){
  if(!supabase)return;
  const {data,error}=await supabase.rpc("create_direct_chat",{target_user:person.id});
  if(error){say(error.message);return}
  const {data:room}=await supabase.from("chats").select("id,title,slug,is_group").eq("id",data).single();
  if(room){setChats(old=>[room as Chat,...old.filter(c=>c.id!==room.id)]);setSelected(room.id);setActive("chats");setMobileChat(true);say("Личный чат создан")} }
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
 async function saveProfile(e:React.FormEvent){e.preventDefault();if(!supabase||!session)return;setSavingProfile(true);const patch={display_name:displayName.trim().slice(0,60),bio:bioText.trim().slice(0,160),profile_color:profile.profile_color,profile_emoji:profile.profile_emoji,profile_status:profile.profile_status.trim().slice(0,50),location:profile.location.trim().slice(0,80),website:profile.website.trim().slice(0,120),birthday:profile.birthday||null,pronouns:profile.pronouns.trim().slice(0,40),music_status:profile.music_status.trim().slice(0,100)};const {error}=await supabase.from("profiles").update(patch).eq("id",session.user.id);setSavingProfile(false);if(error){say(error.message);return}setProfile(p=>({...p,...patch,birthday:patch.birthday||""}));say("Профиль сохранён");}
 async function uploadProfileMedia(kind:"avatar"|"cover",file?:File){if(!supabase||!session||!file)return;if(!file.type.startsWith("image/")||file.size>5*1024*1024){say("Выбери изображение до 5 МБ");return;}setUploadingMedia(kind);const ext=(file.name.split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"");const path=session.user.id+"/"+kind+"-"+Date.now()+"."+ext;const {error:uploadError}=await supabase.storage.from("profile-media").upload(path,file,{upsert:false,contentType:file.type,cacheControl:"3600"});if(uploadError){say(uploadError.message);setUploadingMedia(null);return;}const {data}=supabase.storage.from("profile-media").getPublicUrl(path);const url=data.publicUrl;const column=kind==="avatar"?"avatar_url":"cover_url";const {error}=await supabase.from("profiles").update({[column]:url}).eq("id",session.user.id);if(error){say(error.message);setUploadingMedia(null);return;}setProfile(p=>({...p,[column]:url}));setUploadingMedia(null);say(kind==="avatar"?"Аватар обновлён":"Обложка обновлена");}
 async function logout(){if(supabase)await supabase.auth.signOut();setSession(null);setProfile({username:"Гость",role:"user",display_name:null,bio:"",is_premium:true,is_verified:false,badge_label:null,stars_balance:250,avatar_url:null,cover_url:null,profile_color:"#3390ec",profile_emoji:"✨",profile_status:"",location:"",website:"",birthday:"",pronouns:"",music_status:""})}
 function openSection(section:string){if(section==="admin"&&profile.role!=="admin"){say("Нет доступа");return}setActive(section);setMobileChat(false);if(section==="contacts")loadContacts();if(section==="admin")loadAdminPeople();}
 async function loadAdminPeople(){if(!supabase||!session||profile.role!=="admin")return;setAdminLoading(true);setAdminError("");const {data:me}=await supabase.from("profiles").select("role").eq("id",session.user.id).maybeSingle();if(me?.role!=="admin"){setAdminError("Доступ запрещён");setAdminLoading(false);return;}const {data,error}=await supabase.from("profiles").select("id,username,display_name,role,created_at,is_premium,is_verified,badge_label,stars_balance").order("created_at",{ascending:false}).limit(200);if(error)setAdminError(error.message);else setAdminPeople((data||[]) as AdminPerson[]);setAdminLoading(false);}
 async function updateAdminPerson(person:AdminPerson,patch:Partial<AdminPerson>){if(!supabase)return;const next={...person,...patch};const {error}=await supabase.rpc("admin_set_profile_badges",{target_user:person.id,verified:next.is_verified,premium:next.is_premium,badge:next.badge_label||""});if(error){setAdminError(error.message);return;}setAdminPeople(old=>old.map(p=>p.id===person.id?next:p));if(person.id===session?.user.id)setProfile(p=>({...p,is_verified:next.is_verified,is_premium:next.is_premium,badge_label:next.badge_label||null}));say("Изменения сохранены");}
 async function grantStars(person:AdminPerson){if(!supabase)return;const raw=window.prompt("Сколько звёзд выдать пользователю?", "100");if(raw===null)return;const amount=Number(raw);if(!Number.isInteger(amount)||amount<1||amount>100000){say("Введи число от 1 до 100000");return;}const {data,error}=await supabase.rpc("admin_grant_stars",{target_user:person.id,amount,reason:"Выдано администратором"});if(error){say(error.message);return;}setAdminPeople(old=>old.map(p=>p.id===person.id?{...p,stars_balance:Number(data)}:p));if(person.id===session?.user.id)setProfile(p=>({...p,stars_balance:Number(data)}));say("Звёзды выданы");}
 async function purchaseGift(title:string){if(!supabase)return;const {data,error}=await supabase.rpc("purchase_midix_gift",{gift_title:title});if(error){say(error.message);return;}const result=data as {balance:number;title:string};setProfile(p=>({...p,stars_balance:result.balance}));say("Подарок «"+result.title+"» куплен!");}
 async function uploadChatMedia(file?:File,forcedType?:string){
  if(!file||!supabase||!session||!current||current.id.startsWith("demo-"))return;
  if(file.size>20*1024*1024){say("Максимальный размер файла — 20 МБ");return;}
  setUploadingChatMedia(true);
  const safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,"_").slice(-90)||"attachment";
  const path=current.id+"/"+session.user.id+"/"+Date.now()+"-"+safeName;
  const {error:uploadError}=await supabase.storage.from("chat-media").upload(path,file,{upsert:false,contentType:file.type||"application/octet-stream",cacheControl:"3600"});
  if(uploadError){say(uploadError.message);setUploadingChatMedia(false);return;}
  const mediaType=forcedType||(file.type.startsWith("image/")?"image":file.type.startsWith("video/")?"video":file.type.startsWith("audio/")?"audio":"file");
  const {error}=await supabase.from("messages").insert({chat_id:current.id,sender_id:session.user.id,body:mediaType==="audio"?"Голосовое сообщение":"",media_path:path,media_type:mediaType,file_name:file.name,file_size:file.size,reply_to_id:replyTo?.id||null});
  if(error){await supabase.storage.from("chat-media").remove([path]);say(error.message);}else{setReplyTo(null);say(mediaType==="audio"?"Голосовое отправлено":"Файл отправлен");}
  setUploadingChatMedia(false);
 }
 async function startVoiceRecording(){
  if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==="undefined"){say("Запись аудио не поддерживается этим устройством");return;}
  try{
   const stream=await navigator.mediaDevices.getUserMedia({audio:true});
   const mime=MediaRecorder.isTypeSupported("audio/webm;codecs=opus")?"audio/webm;codecs=opus":"audio/webm";
   const recorder=new MediaRecorder(stream,{mimeType:mime});
   voiceChunks.current=[];
   recorder.ondataavailable=e=>{if(e.data.size)voiceChunks.current.push(e.data);};
   recorder.onstop=async()=>{const blob=new Blob(voiceChunks.current,{type:recorder.mimeType||"audio/webm"});stream.getTracks().forEach(t=>t.stop());setVoiceRecorder(null);setRecording(false);if(blob.size)await uploadChatMedia(new File([blob],"voice-"+Date.now()+".webm",{type:blob.type}),"audio");};
   recorder.start();setVoiceRecorder(recorder);setRecording(true);say("Запись идёт — нажми ещё раз, чтобы отправить");
  }catch(err:any){say(err?.message||"Не удалось получить доступ к микрофону");}
 }
 function stopVoiceRecording(){if(voiceRecorder&&voiceRecorder.state!=="inactive")voiceRecorder.stop();}


 if(!ready)return <div className="auth-screen"><div className="auth-card">Загрузка Midix Gram…</div></div>;
 if(!session)return <main className="auth-screen"><form className="auth-card telegram-auth" onSubmit={auth}>
  <div className="telegram-auth-top"><div className="brand-mark">M</div><span className="eyebrow">MIDIX GRAM</span><h1>{authMode==="signup"?"Создать аккаунт":"Добро пожаловать"}</h1><p className="muted">{authMode==="signup"?"Присоединяйся к друзьям и общайся без границ.":"Войди, чтобы продолжить общение."}</p></div>
  <div className="auth-tabs"><button type="button" className={authMode==="login"?"selected":""} onClick={()=>{setAuthMode("login");setOtpSent(false);setOtp("");setAuthError("")}}>Войти</button><button type="button" className={authMode==="signup"?"selected":""} onClick={()=>{setAuthMode("signup");setOtpSent(false);setOtp("");setAuthError("")}}>Регистрация</button></div>
  <div className="auth-method-tabs"><button type="button" className={authMethod==="phone"?"chosen":""} onClick={()=>{setAuthMethod("phone");setOtpSent(false);setAuthError("")}}>Телефон</button><button type="button" className={authMethod==="email"?"chosen":""} onClick={()=>{setAuthMethod("email");setOtpSent(false);setAuthError("")}}>Email</button></div>
  {authMethod==="phone"?<>
   {authMode==="signup"&&!otpSent&&<><div className="auth-name-grid"><label>Имя<input value={firstName} onChange={e=>setFirstName(e.target.value)} required placeholder="Имя"/></label><label>Фамилия<input value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Фамилия"/></label></div><label>Имя пользователя<input value={username} onChange={e=>setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g,""))} required minLength={3} placeholder="username"/></label></>}
   <label>Номер телефона<input type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={e=>setPhone(e.target.value)} required placeholder="+31 6 12345678" disabled={otpSent}/></label>
   {otpSent&&<><div className="otp-hint">Мы отправили код на <b>{phone}</b></div><label>Код подтверждения<input inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,"").slice(0,6))} required placeholder="123456" maxLength={6}/></label><button type="button" className="auth-resend" onClick={()=>{setOtpSent(false);setOtp("");setAuthError("")}}>Изменить номер</button></>}
  </>:<>
   {authMode==="signup"&&<><div className="auth-name-grid"><label>Имя<input value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="Имя"/></label><label>Фамилия<input value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Фамилия"/></label></div><label>Имя пользователя<input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Например, alex"/></label></>}
   <label>Email<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="name@example.com"/></label><label>Пароль<input type="password" autoComplete={authMode==="signup"?"new-password":"current-password"} value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} placeholder="Не менее 6 символов"/></label>
  </>}
  {authError&&<p className="error">{authError}</p>}
  <button className="primary full" disabled={busy}>{busy?"Подождите…":authMethod==="phone"?(otpSent?"Подтвердить и продолжить":"Продолжить"):(authMode==="login"?"Войти":"Создать аккаунт")}</button>
  {authMethod==="phone"&&<div className="auth-footnote">Вход по номеру использует SMS-подтверждение. Доступность зависит от настройки SMS-провайдера в Supabase.</div>}
  {!isSupabaseConfigured&&<div className="demo-note">Сервер пока не подключён. Настрой Supabase, чтобы включить онлайн-регистрацию.</div>}
 </form></main>;

 return <main className={mobileChat?"app-shell chat-open":"app-shell"}>
  <aside className="rail"><div className="brand-mark">M</div><button className={active==="chats"?"rail-btn active":"rail-btn"} onClick={()=>openSection("chats")} aria-label="Чаты"><MessageCircle/></button><button className={active==="contacts"?"rail-btn active":"rail-btn"} onClick={()=>openSection("contacts")} aria-label="Контакты"><Users/></button><button className={active==="gifts"?"rail-btn active":"rail-btn"} onClick={()=>openSection("gifts")} aria-label="Подарки"><Gift/></button><button className={active==="profile"?"rail-btn active":"rail-btn"} onClick={()=>openSection("profile")} aria-label="Профиль"><UserRound/></button><button className={active==="settings"?"rail-btn active":"rail-btn"} onClick={()=>openSection("settings")} aria-label="Настройки"><Settings/></button>{profile.role==="admin"&&<button className="rail-btn" onClick={()=>openSection("admin")} aria-label="Админ-панель"><ShieldCheck/></button>}<div className="rail-spacer"/><button className="rail-btn" onClick={logout} aria-label="Выйти"><LogOut/></button><div className="profile-mini">{profile.username.slice(0,1).toUpperCase()}</div></aside>
  <nav className="mobile-nav" aria-label="Основная навигация"><button className={active==="chats"?"active":""} onClick={()=>openSection("chats")}><MessageCircle/><span>Чаты</span></button><button className={active==="contacts"?"active":""} onClick={()=>openSection("contacts")}><Users/><span>Контакты</span></button><button className={active==="gifts"?"active":""} onClick={()=>openSection("gifts")}><Gift/><span>Подарки</span></button><button className={active==="profile"?"active":""} onClick={()=>openSection("profile")}><UserRound/><span>Профиль</span></button><button className={active==="settings"?"active":""} onClick={()=>openSection("settings")}><Settings/><span>Настройки</span></button>{profile.role==="admin"&&<button className={active==="admin"?"active":""} onClick={()=>openSection("admin")}><ShieldCheck/><span>Админ</span></button>}</nav>
  <section className={mobileChat||active!=="chats"?"sidebar mobile-hide":"sidebar"}><header className="side-header"><div><span className="eyebrow">MESSENGER</span><h1>Midix <b>Gram</b></h1></div><div className="side-head-actions"><button className="icon-btn" onClick={()=>openSection("contacts")} aria-label="Новое сообщение"><MessageCircle/></button><button className="icon-btn" onClick={createGroup} aria-label="Создать группу"><Plus/></button></div></header><div className="search-box"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Поиск чатов"/></div><div className="chat-filter-tabs"><button className={chatFilter==="all"?"chosen":""} onClick={()=>setChatFilter("all")}>Все</button><button className={chatFilter==="private"?"chosen":""} onClick={()=>setChatFilter("private")}>Личные</button><button className={chatFilter==="groups"?"chosen":""} onClick={()=>setChatFilter("groups")}>Группы</button></div><div className="section-label">ВСЕ СООБЩЕНИЯ <span>{filtered.length}</span></div><div className="chat-list">{filtered.map((chat,i)=><button key={chat.id} onClick={()=>{setSelected(chat.id);setActive("chats");setMobileChat(true)}} className={selected===chat.id?"chat-row selected":"chat-row"}><span className="avatar" style={{background:["#64748b","#7c6cf2","#e58a65","#299c91"][i%4]}}>{chat.title[0]}</span><span className="chat-copy"><b>{chat.title}</b><small>{chatPreviews[chat.id]?.body||(chat.slug==="news"?"Обновления Midix":chat.is_group?"Групповой чат":"Личный диалог")}</small></span></button>)}</div><div className="sidebar-footer"><span className="status-dot"/>{isSupabaseConfigured?"Онлайн-соединение":"Сервер не настроен"} <MoreHorizontal size={17}/></div></section>
  <section className={mobileChat||active!=="chats"?"conversation":"conversation mobile-hide"}>
   {active==="admin"?<div className="welcome-panel admin-mobile"><div className="hero-icon"><ShieldCheck size={34}/></div><span className="eyebrow">MIDIX GRAM · ADMIN</span><h2>Админ-панель</h2><p>Управление Premium, верификацией и метками пользователей.</p><div className="admin-mobile-head"><b>Пользователи · {adminPeople.length}</b><button className="icon-btn" onClick={loadAdminPeople} disabled={adminLoading}><RefreshCw size={17}/></button></div>{adminError&&<p className="error">{adminError}</p>}{adminLoading?<p>Загрузка пользователей…</p>:adminPeople.map(person=><article className="admin-mobile-user" key={person.id}><div className="admin-mobile-user-title"><b>{person.display_name||person.username}</b><small>@{person.username} · {person.role} · ⭐ {person.stars_balance}</small></div><div className="admin-user-badges">{person.is_premium&&<i>PREMIUM</i>}{person.is_verified&&<i>✓ VERIFIED</i>}{person.badge_label&&<i>{person.badge_label}</i>}</div><div className="admin-mobile-actions"><button onClick={()=>updateAdminPerson(person,{is_verified:!person.is_verified})}>{person.is_verified?"Снять ✓":"Выдать ✓"}</button><button onClick={()=>updateAdminPerson(person,{is_premium:!person.is_premium})}>{person.is_premium?"Снять Premium":"Выдать Premium"}</button><button onClick={()=>{const label=window.prompt("Название метки",person.badge_label||"");if(label!==null)updateAdminPerson(person,{badge_label:label.trim().slice(0,32)||null})}}>Метка</button><button onClick={()=>grantStars(person)}>Выдать ⭐</button></div></article>)}</div>:active==="profile"?<div className="welcome-panel profile-editor profile-studio"><div className="profile-preview" style={{"--profile-accent":profile.profile_color} as React.CSSProperties}><div className="profile-cover" style={profile.cover_url?{backgroundImage:"linear-gradient(180deg,transparent,#07111dcc),url("+profile.cover_url+")"}:{background:"linear-gradient(130deg,"+profile.profile_color+",#192b48 72%,#101b2a)"}}><label className="cover-upload">📷 {uploadingMedia==="cover"?"Загрузка…":"Изменить обложку"}<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={e=>uploadProfileMedia("cover",e.target.files?.[0])}/></label></div><div className="profile-preview-main"><div className="profile-avatar-wrap">{profile.avatar_url?<img className="profile-avatar-photo" src={profile.avatar_url} alt="Аватар"/>:<div className="profile-avatar">{(profile.display_name||profile.username).slice(0,1).toUpperCase()}</div>}<label className="avatar-upload">📷<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={e=>uploadProfileMedia("avatar",e.target.files?.[0])}/></label></div><div className="profile-preview-name"><span className="eyebrow">MIDIX IDENTITY</span><h2>{profile.profile_emoji||"✨"} {profile.display_name||profile.username} {profile.is_verified&&<BadgeCheck size={18} className="inline-verified"/>}</h2><p>@{profile.username}</p>{profile.profile_status&&<span className="profile-status-pill">{profile.profile_status}</span>}</div></div><p className="profile-bio-preview">{bioText||"Добавь описание, чтобы рассказать о себе."}</p><div className="profile-meta-preview">{profile.location&&<span>📍 {profile.location}</span>}{profile.website&&<span>🔗 {profile.website}</span>}{profile.pronouns&&<span>👤 {profile.pronouns}</span>}{profile.birthday&&<span>🎂 {profile.birthday}</span>}{profile.music_status&&<span>🎵 {profile.music_status}</span>}</div><div className="identity-badges"><span className="stars-balance">⭐ {profile.stars_balance} звёзд</span>{profile.is_premium&&<span className="premium-mark"><Crown size={14}/> PREMIUM</span>}{profile.is_verified&&<span className="verified-mark"><BadgeCheck size={14}/> ПРОВЕРЕН</span>}{profile.badge_label&&<span className="custom-mark">{profile.badge_label}</span>}</div><div className="profile-quick-actions"><button type="button" onClick={()=>say("Ссылка на профиль: midixgram://"+profile.username)}>↗ Поделиться профилем</button><button type="button" onClick={()=>say("QR-профиль появится в следующем обновлении")}>▦ Мой QR</button><button type="button" onClick={()=>setActive("gifts")}>🎁 Подарки</button></div></div><form className="profile-form profile-settings-form" onSubmit={saveProfile}><h3>Настроить профиль</h3><label>Отображаемое имя<input value={displayName} onChange={e=>setDisplayName(e.target.value)} maxLength={60} placeholder="Как тебя называть"/></label><label>О себе<textarea value={bioText} onChange={e=>setBioText(e.target.value)} maxLength={160} placeholder="Расскажи о себе"/></label><label>Статус профиля<input value={profile.profile_status} onChange={e=>setProfile(p=>({...p,profile_status:e.target.value}))} maxLength={50} placeholder="Например: всегда на связи"/></label><label>Эмодзи профиля<select value={profile.profile_emoji} onChange={e=>setProfile(p=>({...p,profile_emoji:e.target.value}))}>{["✨","🔥","💎","👑","🚀","🎮","🎧","🦋","🌙","💜","❤️","⚡","🌸","🖤","☀️","🍀","🫶","🤍"].map(x=><option key={x}>{x}</option>)}</select></label><label>Цвет профиля<div className="profile-color-picker">{["#3390ec","#8b5cf6","#ec4899","#f97316","#10b981","#eab308","#ef4444","#64748b","#111827"].map(color=><button type="button" key={color} aria-label={"Выбрать цвет "+color} className={profile.profile_color===color?"chosen":""} style={{background:color}} onClick={()=>setProfile(p=>({...p,profile_color:color}))}/>)}</div></label><div className="profile-form-grid"><label>Местоположение<input value={profile.location} onChange={e=>setProfile(p=>({...p,location:e.target.value}))} maxLength={80} placeholder="Город"/></label><label>Обращение / местоимения<input value={profile.pronouns} onChange={e=>setProfile(p=>({...p,pronouns:e.target.value}))} maxLength={40} placeholder="Например: он/его"/></label><label>Дата рождения<input type="date" value={profile.birthday} onChange={e=>setProfile(p=>({...p,birthday:e.target.value}))}/></label><label>Сайт<input type="url" value={profile.website} onChange={e=>setProfile(p=>({...p,website:e.target.value}))} placeholder="https://example.com"/></label></div><label>Сейчас слушаю<input value={profile.music_status} onChange={e=>setProfile(p=>({...p,music_status:e.target.value}))} maxLength={100} placeholder="🎵 Исполнитель — трек"/></label><button className="primary" disabled={savingProfile}>{savingProfile?"Сохраняем…":"Сохранить профиль"}</button></form><p className="premium-note"><Crown size={16}/> Premium включён бесплатно в Midix Gram.</p><p className="muted">Верификация и специальные метки выдаются администрацией после проверки.</p></div>:active==="settings"?<div className="welcome-panel"><div className="hero-icon"><Settings size={34}/></div><span className="eyebrow">PREFERENCES</span><h2>Настройки</h2><p>Управление аккаунтом и сеансом.</p><button className="primary" onClick={logout}>Выйти из аккаунта</button></div>:active==="gifts"?<div className="welcome-panel"><div className="hero-icon"><Gift size={34}/></div><span className="eyebrow">MIDIX COLLECTIBLES</span><h2>Подарки и коллекции</h2><p>Покупай подарки за звёзды Midix Gram. Баланс: <b className="stars-balance">⭐ {profile.stars_balance}</b></p><div className="gift-cards">{gifts.map(g=><article key={g.title}><span>{g.emoji}</span><b>{g.title}</b><small>{g.rarity}</small><strong>{g.price} ⭐</strong><button className="gift-buy" onClick={()=>purchaseGift(g.title)}>Купить</button></article>)}</div></div>:active==="contacts"?<div className="welcome-panel contacts-panel"><div className="hero-icon"><Users size={34}/></div><span className="eyebrow">MIDIX PEOPLE</span><h2>Контакты</h2><p>Найди пользователя и начни личный диалог.</p><div className="contact-search"><Search size={18}/><input value={contactQuery} onChange={e=>setContactQuery(e.target.value)} placeholder="Поиск по имени пользователя"/></div>{contactsLoading?<p>Загружаем пользователей…</p>:contacts.filter(p=>p.username.toLowerCase().includes(contactQuery.toLowerCase())||(p.display_name||"").toLowerCase().includes(contactQuery.toLowerCase())).map(p=><button className="contact-row" key={p.id} onClick={()=>startDirectChat(p)}><span className="avatar">{(p.display_name||p.username)[0].toUpperCase()}</span><span><b>{p.display_name||p.username} {p.is_verified&&<BadgeCheck size={14} className="inline-verified"/>}</b><small>@{p.username} {p.badge_label&&"· "+p.badge_label}</small></span><span className="contact-action">Написать</span></button>)}{!contactsLoading&&contacts.length===0&&<p>Пока нет других пользователей. Пригласи друзей зарегистрироваться.</p>}</div>:<><header className="conversation-header"><button className="back-mobile" onClick={()=>setMobileChat(false)}>‹</button><div className="avatar large">{current?.title?.[0]||"M"}</div><div className="person-title"><b>{current?.title||"Чат"}</b><small>{session.user.email}</small></div><div className="header-actions"><button className="icon-btn" onClick={()=>setMessageSearchOpen(v=>!v)} aria-label="Поиск по сообщениям"><Search/></button><button className="icon-btn" onClick={()=>say("Настройки уведомлений чата появятся позже")}><Bell/></button><button className="icon-btn"><MoreHorizontal/></button></div></header>{messageSearchOpen&&<div className="message-search-bar"><Search size={16}/><input autoFocus value={messageQuery} onChange={e=>setMessageQuery(e.target.value)} placeholder="Найти в переписке"/><button type="button" onClick={()=>{setMessageSearchOpen(false);setMessageQuery("")}}>×</button></div>}<div className="message-area"><div className="date-chip">СООБЩЕНИЯ</div>{messages.filter(m=>!messageQuery||m.body.toLowerCase().includes(messageQuery.toLowerCase())).map(m=><div key={m.id} className={m.sender_id===session.user.id?"bubble outgoing":"bubble incoming"}>{m.reply_to_id&&<div className="reply-quote">{messages.find(x=>x.id===m.reply_to_id)?.body||"Ответ на сообщение"}</div>}{m.sender_id===session.user.id?"Вы":m.profiles?.username||"Пользователь"}: {m.body}{m.media_url&&m.media_type==="image"&&<a className="message-media-link" href={m.media_url} target="_blank" rel="noreferrer"><img className="message-image" src={m.media_url} alt={m.file_name||"Изображение"}/></a>}{m.media_url&&m.media_type==="video"&&<video className="message-video" src={m.media_url} controls playsInline/>}{m.media_url&&m.media_type==="audio"&&<audio className="message-audio" src={m.media_url} controls/>}{m.media_url&&m.media_type==="file"&&<a className="message-file" href={m.media_url} target="_blank" rel="noreferrer">📎 {m.file_name||"Скачать файл"} · {Math.max(1,Math.round((m.file_size||0)/1024))} КБ</a>}<small>{new Date(m.created_at).toLocaleTimeString("ru-RU",{hour:"2-digit",minute:"2-digit"})}{m.edited_at?" · изменено":""}</small><div className="message-tools"><button type="button" onClick={()=>beginReply(m)}>Ответить</button>{m.sender_id===session.user.id&&<><button type="button" onClick={()=>beginEdit(m)}>Изменить</button><button type="button" onClick={()=>deleteMessage(m)}>Удалить</button></>}</div><div className="message-reactions">{(["👍","❤️","😂","🔥","👏"] as const).map(emoji=>{const rows=reactions.filter(r=>r.message_id===m.id&&r.emoji===emoji);return <button key={emoji} className={rows.some(r=>r.user_id===session.user.id)?"reaction-chip mine":"reaction-chip"} onClick={()=>toggleReaction(m.id,emoji)}>{emoji}{rows.length>0&&<span>{rows.length}</span>}</button>})}</div></div>)}{messages.length===0&&<div className="system-note">Пока нет сообщений. Напиши первым!</div>}{messages.length>0&&messageQuery&&messages.filter(m=>m.body.toLowerCase().includes(messageQuery.toLowerCase())).length===0&&<div className="system-note">Совпадений не найдено</div>}</div><>{emojiOpen&&<div className="ios-emoji-picker"><div className="emoji-picker-top"><b>Эмодзи</b><button type="button" onClick={()=>setEmojiOpen(false)} aria-label="Закрыть">×</button></div><input className="emoji-search" value={emojiSearch} onChange={e=>setEmojiSearch(e.target.value)} placeholder="Поиск эмодзи"/><div className="emoji-categories">{["Часто","Смайлы","Жесты","Сердца","Животные","Еда","Путешествия","Предметы","Символы"].map(cat=><button type="button" key={cat} className={emojiCategory===cat?"active":""} onClick={()=>setEmojiCategory(cat)}>{cat}</button>)}</div><div className="emoji-grid">{(emojiSearch?emojiSets["Смайлы"]:emojiSets[emojiCategory]||emojiSets["Часто"]).filter((e)=>!emojiSearch||e.includes(emojiSearch)||emojiSearch.toLowerCase()==="emoji").map((e,i)=><button type="button" key={e+i} onClick={()=>setDraft(d=>d+e)}>{e}</button>)}</div></div>}<>{(replyTo||editingMessageId)&&<div className="composer-context"><div><b>{editingMessageId?"Редактирование сообщения":"Ответ на сообщение"}</b><small>{editingMessageId?messages.find(m=>m.id===editingMessageId)?.body:replyTo?.body}</small></div><button type="button" onClick={()=>{setReplyTo(null);setEditingMessageId(null);setDraft("")}}>×</button></div>}<form className="composer" onSubmit={send}><button type="button" className="icon-btn" onClick={()=>document.getElementById("chat-attachment-input")?.click()} aria-label="Прикрепить файл" disabled={uploadingChatMedia}><Plus/></button><input id="chat-attachment-input" className="hidden-file-input" type="file" accept="image/*,video/*,audio/*,.pdf,.txt,.zip" onChange={e=>{uploadChatMedia(e.target.files?.[0]);e.currentTarget.value="";}}/><input value={draft} onChange={e=>setDraft(e.target.value)} placeholder={editingMessageId?"Изменить сообщение…":"Написать сообщение…"}/><button type="button" className={emojiOpen?"icon-btn emoji-trigger active":"icon-btn emoji-trigger"} onClick={()=>setEmojiOpen(v=>!v)} aria-label="Открыть эмодзи"><Smile/></button><button type="button" className={recording?"icon-btn recording-btn":"icon-btn"} onClick={recording?stopVoiceRecording:startVoiceRecording} aria-label={recording?"Остановить запись":"Записать голосовое"}>{recording?"■":"🎙️"}</button><button className="send-btn" aria-label="Отправить" disabled={uploadingChatMedia}><Send size={18}/></button></form></></></>}
  </section>
  <aside className="info-panel"><div className="info-top"><span className="eyebrow">ВАШ ПРОФИЛЬ</span><button className="icon-btn" onClick={logout}><LogOut/></button></div><div className="profile-card"><div className="profile-avatar">{profile.username.slice(0,1).toUpperCase()}</div><h2>{profile.username} {profile.is_verified&&<BadgeCheck size={17} className="inline-verified"/>}</h2><p className="handle">{session.user.email}</p><span className="profile-badge"><ShieldCheck size={13}/> {profile.role==="admin"?"Администратор":"Midix member"}</span>{profile.is_premium&&<span className="premium-mark"><Crown size={13}/> PREMIUM</span>}{profile.is_verified&&<span className="verified-mark"><BadgeCheck size={13}/> Проверен</span>}</div><div className="info-divider"/><div className="info-section"><div className="section-label">БЫСТРЫЙ ДОСТУП</div><button onClick={()=>setActive("gifts")}><Gift/> Подарки <span>✦</span></button><button onClick={()=>say("Медиафайлы появятся позже")}><ImageIcon/> Медиафайлы <span>—</span></button><button onClick={()=>say("Архив чатов пока не подключён к серверу")}><Archive/> Архив чатов <span>скоро</span></button></div><div className="info-tip"><span>✦</span><b>Midix collectibles</b><p>Цифровые подарки и коллекции будут расширены после настройки сервера.</p></div>{profile.role==="admin"&&<button className="admin-link" onClick={()=>openSection("admin")}><LockKeyhole size={14}/> ADMIN CONSOLE</button>}</aside>
  {toast&&<div className="toast">{toast}</div>}
 </main>;
}