document.addEventListener("DOMContentLoaded",()=>{
// Inicializa todos os módulos do site
initTracking();
initHeaderScroll();
initScrollReveal();
initFaqAccordion();
initCounters();
initWhatsAppFloating();
initCookieConsent();
});
function initTracking(){
// Parâmetros de UTM que desejamos capturar na URL
const utmParams=["utm_source","utm_medium","utm_campaign","gclid","fbclid"];
const campaignData={};
// Obter parâmetros da URL atual
const urlParams=new URLSearchParams(window.location.search);
// Captura e armazena os parâmetros ativos na sessão
utmParams.forEach(param=>{
const val=urlParams.get(param);
if(val){
sessionStorage.setItem(param,val);
campaignData[param]=val;
}else{
// Recupera do sessionStorage se já existir de uma navegação anterior
const cachedVal=sessionStorage.getItem(param);
if(cachedVal){
campaignData[param]=cachedVal;
}
}
});
// Atualiza dinamicamente todos os links do WhatsApp para incluir os parâmetros de atribuição
updateWhatsAppLinks(campaignData);
// Registra cliques no WhatsApp no dataLayer
const waButtons=document.querySelectorAll(".btn-whatsapp-track");
waButtons.forEach(btn=>{
btn.addEventListener("click",(e)=>{
const location=btn.getAttribute("data-location")|| "unknown";
window.dataLayer=window.dataLayer ||[];
window.dataLayer.push({
event:"whatsapp_click",
location:location
});
});
});
// Registra cliques no link de Telefone no dataLayer
const phoneTrack=document.querySelector(".btn-phone-track");
if(phoneTrack){
phoneTrack.addEventListener("click",()=>{
window.dataLayer=window.dataLayer ||[];
window.dataLayer.push({event:"phone_click"});
});
}
// Registra profundidade de rolagem da página (Scroll Depth)
initScrollDepthTracking();
}
function updateWhatsAppLinks(campaignData){
const waLinks=document.querySelectorAll("a[href*='wa.me']");
// Constrói a string de rastreamento legível para colocar na mensagem do WhatsApp
let trackingString="";
const activeParams=[];
for(const[key,value]of Object.entries(campaignData)){
if(value){
activeParams.push(`${key}=${value}`);
}
}
if(activeParams.length>0){
// Formato para anexar ao texto da mensagem
trackingString=`\n\n[Origem do Lead:${activeParams.join(" | ")}]`;
}
waLinks.forEach(link=>{
try{
const urlObj=new URL(link.href);
// Mensagem base padrão
let messageText="Olá! Gostaria de falar com um especialista sobre a negativa de tratamento de autismo do meu filho.";
// Verifica se o link já tem um parâmetro 'text' configurado
const existingText=urlObj.searchParams.get("text");
if(existingText){
messageText=existingText;
}
// Anexa a string de rastreamento no final da mensagem
const finalMessage=messageText+trackingString;
urlObj.searchParams.set("text",finalMessage);
// Atualiza o href do elemento
link.href=urlObj.toString();
}catch(e){
console.error("Erro ao formatar URL do WhatsApp:",e);
}
});
}
function initScrollDepthTracking(){
const depths=[25,50,75,90];
const triggeredDepths={};
// Inicializa flags de disparos
depths.forEach(d=>triggeredDepths[d]=false);
window.addEventListener("scroll",()=>{
const scrollTop=window.scrollY || document.documentElement.scrollTop;
const scrollHeight=document.documentElement.scrollHeight-document.documentElement.clientHeight;
if(scrollHeight<=0)return;
const scrollPercentage=Math.round((scrollTop/scrollHeight)*100);
depths.forEach(depth=>{
if(scrollPercentage>=depth && !triggeredDepths[depth]){
triggeredDepths[depth]=true;
window.dataLayer=window.dataLayer ||[];
window.dataLayer.push({
event:"scroll_depth",
depth:depth
});
}
});
});
}
function initHeaderScroll(){
const header=document.getElementById("main-header");
if(!header)return;
window.addEventListener("scroll",()=>{
if(window.scrollY>50){
header.classList.add("header-scrolled");
}else{
header.classList.remove("header-scrolled");
}
});
}
function initScrollReveal(){
const revealElements=document.querySelectorAll(".reveal-left,.reveal-right,.reveal-up");
if(revealElements.length===0)return;
// Configura o observador de interseção com margem de ativação de 10% da tela
const observerOptions={
root:null,
rootMargin:"0px",
threshold:0.1
};
const observer=new IntersectionObserver((entries,observer)=>{
entries.forEach(entry=>{
if(entry.isIntersecting){
entry.target.classList.add("reveal-active");
// Uma vez animado, deixa de observar para economizar processamento
observer.unobserve(entry.target);
}
});
},observerOptions);
revealElements.forEach(el=>observer.observe(el));
}
function initFaqAccordion(){
const faqItems=document.querySelectorAll(".faq-item");
faqItems.forEach(item=>{
const trigger=item.querySelector(".faq-trigger");
const content=item.querySelector(".faq-content");
if(!trigger || !content)return;
trigger.addEventListener("click",()=>{
const isActive=item.classList.contains("active");
// Fecha todos os outros itens antes de abrir o atual (estilo sanfona exclusivo)
faqItems.forEach(otherItem=>{
if(otherItem !==item && otherItem.classList.contains("active")){
otherItem.classList.remove("active");
const otherContent=otherItem.querySelector(".faq-content");
const otherTrigger=otherItem.querySelector(".faq-trigger");
if(otherContent)otherContent.style.maxHeight="0";
if(otherTrigger)otherTrigger.setAttribute("aria-expanded","false");
}
});
// Alterna o estado do item atual
if(isActive){
item.classList.remove("active");
content.style.maxHeight="0";
trigger.setAttribute("aria-expanded","false");
}else{
item.classList.add("active");
// Define a altura máxima como o scrollHeight real do conteúdo para suavizar a transição CSS
content.style.maxHeight=content.scrollHeight+"px";
trigger.setAttribute("aria-expanded","true");
// Dispara o evento de abertura no dataLayer
const questionText=trigger.getAttribute("data-question")|| trigger.innerText.trim();
window.dataLayer=window.dataLayer ||[];
window.dataLayer.push({
event:"faq_open",
question:questionText
});
}
});
});
}
function initCounters(){
const statsSection=document.getElementById("prova-social");
const numbers=document.querySelectorAll(".stat-number");
if(!statsSection || numbers.length===0)return;
let animated=false;
// Observer para iniciar a contagem quando a seção estiver visível
const observer=new IntersectionObserver((entries)=>{
entries.forEach(entry=>{
if(entry.isIntersecting && !animated){
animateNumbers();
animated=true;
observer.unobserve(entry.target);
}
});
},{threshold:0.2});
observer.observe(statsSection);
function animateNumbers(){
numbers.forEach(num=>{
const target=parseInt(num.getAttribute("data-target"),10);
const isPercent=num.innerText.includes("%");
const isPlus=num.innerText.includes("+");
let current=0;
const duration=2000;//Tempo de animação em ms
const stepTime=Math.max(Math.floor(duration/target),15);
const timer=setInterval(()=>{
current+=Math.ceil(target/(duration/stepTime));
if(current>=target){
current=target;
clearInterval(timer);
}
// Formata o número final com seu símbolo correspondente, aplicando separador de milhar para números grandes
const formattedCurrent = current >= 1000 ? current.toLocaleString('pt-BR') : current;
if(isPercent){
num.innerText=`${formattedCurrent}%`;
}else if(isPlus){
num.innerText=`${formattedCurrent}+`;
}else if(target===48){//tratamento especial para liminares "48h"
num.innerText=`${formattedCurrent}h`;
}else{
num.innerText=formattedCurrent;
}
},stepTime);
});
}
}
function initWhatsAppFloating(){
const floatingWrapper=document.getElementById("wa-floating-wrapper");
const floatingBtn=document.getElementById("wa-floating-btn");
const chatBubble=document.getElementById("wa-chat-bubble");
const closeBubbleBtn=document.getElementById("btn-close-wa-bubble");
const badge=floatingBtn ? floatingBtn.querySelector(".notification-badge"):null;
if(!floatingWrapper || !floatingBtn || !chatBubble)return;
// Temporizador para exibir o mini-chat após 3 segundos
const timer=setTimeout(()=>{
// Verifica se o usuário já fechou o chat nesta sessão
const bubbleDismissed=sessionStorage.getItem("wa_bubble_dismissed");
if(bubbleDismissed !=="true"){
chatBubble.classList.remove("hidden");
if(badge)badge.classList.remove("hidden");
}
},3000);
// Botão Principal abre o link direto ou alterna o balão caso no desktop
floatingBtn.addEventListener("click",()=>{
// Dispara evento
window.dataLayer=window.dataLayer ||[];
window.dataLayer.push({
event:"whatsapp_click",
location:"floating_button"
});
// Oculta a notificação badge ao interagir
if(badge)badge.classList.add("hidden");
// Alterna a exibição do balão de chat
chatBubble.classList.toggle("hidden");
});
// Botão para fechar o balão de chat sem abrir o WhatsApp
if(closeBubbleBtn){
closeBubbleBtn.addEventListener("click",(e)=>{
e.stopPropagation();//Evita clique no botão pai
chatBubble.classList.add("hidden");
if(badge)badge.classList.add("hidden");
// Salva flag para não reexibir na sessão atual
sessionStorage.setItem("wa_bubble_dismissed","true");
});
}
}
function initCookieConsent(){
const banner=document.getElementById("cookie-banner");
const btnAccept=document.getElementById("btn-cookie-accept");
const btnReject=document.getElementById("btn-cookie-reject");
if(!banner || !btnAccept || !btnReject)return;
// Verifica se já existe resposta do consentimento
const consent=localStorage.getItem("cookie_consent");
if(!consent){
// Se não houver decisão, exibe o banner removendo a classe hidden
banner.classList.remove("hidden");
}
// Ação de Aceitar cookies
btnAccept.addEventListener("click",()=>{
localStorage.setItem("cookie_consent","accepted");
banner.classList.add("hidden");
// Habilita pixels de terceiros se implementados dinamicamente
enableThirdPartyPixels(true);
});
// Ação de Recusar cookies não-essenciais
btnReject.addEventListener("click",()=>{
localStorage.setItem("cookie_consent","rejected");
banner.classList.add("hidden");
enableThirdPartyPixels(false);
});
}
function enableThirdPartyPixels(accepted){
if(accepted){
console.log("LGPD:Cookies e Pixels de terceiros autorizados.");
// Exemplo: Disparar inicialização do Pixel do Facebook se estivesse ativo dinamicamente
// if (typeof fbq === "function") fbq('consent', 'grant');
}else{
console.log("LGPD:Cookies de terceiros recusados pelo usuário.");
// Exemplo: Revogar cookies de Pixel do Facebook se estivesse ativo dinamicamente
// if (typeof fbq === "function") fbq('consent', 'revoke');
}
}