/**
 * ==============================================================================
 * SCRIPT JAVASCRIPT: LANDING PAGE DE FUNIL DE PALESTRA (SERVIDORES DO PARÁ)
 * Cliente: Andrade & Côrtes Advogados Associados
 * Funcionalidades: Contagem Regressiva, Rastreamento de UTMs para WhatsApp,
 * Scroll Reveal, Acordeão de FAQ, Animação de Contadores e Consentimento LGPD.
 * ==============================================================================
 */

// Executa a inicialização de todos os módulos assim que o documento HTML for totalmente carregado
document.addEventListener("DOMContentLoaded", () => {
    // Inicializa a contagem regressiva para a palestra de 14 de Outubro às 20h
    initCountdownTimer();

    // Inicializa o sistema de rastreamento de campanhas (UTMs e dataLayer)
    initTracking();

    // Inicializa o efeito de transparência e blur do cabeçalho durante a rolagem
    initHeaderScroll();

    // Inicializa as animações de surgimento gradual dos elementos (Reveal on Scroll)
    initScrollReveal();

    // Inicializa o funcionamento sanfona interativo da seção de Dúvidas Frequentes (FAQ)
    initFaqAccordion();

    // Inicializa os contadores numéricos animados de autoridade e prova social
    initCounters();

    // Inicializa o banner de consentimento de cookies da LGPD
    initCookieConsent();
});

/**
 * Módulo 1: Contagem Regressiva até a Palestra
 * Calcula os dias, horas, minutos e segundos restantes até o dia 14 de Outubro às 20h00.
 */
function initCountdownTimer() {
    // Elementos do DOM onde os valores da contagem serão exibidos
    const daysEl = document.getElementById("timer-days");
    const hoursEl = document.getElementById("timer-hours");
    const minutesEl = document.getElementById("timer-minutes");
    const secondsEl = document.getElementById("timer-seconds");

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    // Define o ano atual ou próximo ano conforme a data atual
    const now = new Date();
    let eventYear = now.getFullYear();

    // Data alvo: 14 de Outubro às 20:00:00 (Fuso horário de Brasília -03:00)
    let targetDate = new Date(`${eventYear}-10-14T20:00:00-03:00`);

    // Caso a data deste ano já tenha passado por completo, ajusta para o próximo ano
    if (now.getTime() > targetDate.getTime() + (3 * 3600 * 1000)) {
        eventYear += 1;
        targetDate = new Date(`${eventYear}-10-14T20:00:00-03:00`);
    }

    // Função que atualiza o relógio a cada segundo
    function updateClock() {
        const currentTime = new Date().getTime();
        const difference = targetDate.getTime() - currentTime;

        // Se o evento estiver acontecendo ou já tiver chegado ao horário
        if (difference <= 0 && difference > -(3 * 3600 * 1000)) {
            daysEl.innerText = "00";
            hoursEl.innerText = "00";
            minutesEl.innerText = "00";
            secondsEl.innerText = "00";

            const headerLabel = document.querySelector(".countdown-header span");
            if (headerLabel) {
                headerLabel.innerHTML = "🔴 <strong>A PALESTRA ESTÁ AO VIVO AGORA!</strong>";
                headerLabel.style.color = "#EF4444";
            }
            return;
        }

        // Cálculos matemáticos de conversão de milissegundos
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        // Formata os números com zero à esquerda caso sejam menores que 10
        daysEl.innerText = days < 10 ? `0${days}` : days;
        hoursEl.innerText = hours < 10 ? `0${hours}` : hours;
        minutesEl.innerText = minutes < 10 ? `0${minutes}` : minutes;
        secondsEl.innerText = seconds < 10 ? `0${seconds}` : seconds;
    }

    // Executa a primeira atualização imediatamente e define o intervalo para rodar a cada 1 segundo
    updateClock();
    setInterval(updateClock, 1000);
}

/**
 * Módulo 2: Rastreamento de UTMs e Parâmetros de Marketing
 * Captura parâmetros de anúncio (Google Ads, Facebook Ads, etc.) da URL
 * e repassa para os botões do WhatsApp e camada de dados dataLayer.
 */
function initTracking() {
    // Parâmetros de campanha que devem ser capturados e persistidos
    const utmParams = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"];
    const campaignData = {};

    // Obtém os parâmetros presentes na barra de endereço atual
    const urlParams = new URLSearchParams(window.location.search);

    // Salva ou recupera os parâmetros na sessão de navegação do usuário
    utmParams.forEach(param => {
        const val = urlParams.get(param);
        if (val) {
            sessionStorage.setItem(param, val);
            campaignData[param] = val;
        } else {
            const cachedVal = sessionStorage.getItem(param);
            if (cachedVal) {
                campaignData[param] = cachedVal;
            }
        }
    });

    // Atualiza todos os links do WhatsApp na página
    updateWhatsAppLinks(campaignData);

    // Registra evento de clique no botão do Grupo VIP do WhatsApp no dataLayer
    const waButtons = document.querySelectorAll(".btn-whatsapp-vip, .btn-whatsapp-track");
    waButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const location = btn.getAttribute("data-location") || "desconhecido";
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: "whatsapp_vip_group_click",
                click_location: location,
                campaign: campaignData
            });
        });
    });

    // Monitora a profundidade de rolagem (Scroll Depth) para mensurar engajamento
    initScrollDepthTracking();
}

/**
 * Atualiza os links de WhatsApp para anexar identificação de tráfego caso seja link wa.me
 */
function updateWhatsAppLinks(campaignData) {
    const waLinks = document.querySelectorAll("a[href*='wa.me']");

    // Constrói texto com parâmetros de rastreamento
    const activeParams = [];
    for (const [key, value] of Object.entries(campaignData)) {
        if (value) {
            activeParams.push(`${key}=${value}`);
        }
    }

    let trackingString = "";
    if (activeParams.length > 0) {
        trackingString = `\n\n[Origem: ${activeParams.join(" | ")}]`;
    }

    waLinks.forEach(link => {
        try {
            const urlObj = new URL(link.href);
            let messageText = "Olá! Gostaria de participar da Palestra sobre Direitos dos Servidores Públicos do Pará e entrar no Grupo VIP.";
            const existingText = urlObj.searchParams.get("text");
            if (existingText) {
                messageText = existingText;
            }
            urlObj.searchParams.set("text", messageText + trackingString);
            link.href = urlObj.toString();
        } catch (e) {
            console.error("Erro ao formatar URL do WhatsApp:", e);
        }
    });
}

/**
 * Monitora o percentual de rolagem da página (25%, 50%, 75% e 90%)
 */
function initScrollDepthTracking() {
    const depths = [25, 50, 75, 90];
    const triggeredDepths = {};
    depths.forEach(d => triggeredDepths[d] = false);

    window.addEventListener("scroll", () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        if (scrollHeight <= 0) return;

        const scrollPercentage = Math.round((scrollTop / scrollHeight) * 100);

        depths.forEach(depth => {
            if (scrollPercentage >= depth && !triggeredDepths[depth]) {
                triggeredDepths[depth] = true;
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    event: "scroll_depth",
                    depth: depth
                });
            }
        });
    });
}

/**
 * Módulo 3: Cabeçalho Fixo Inteligente
 * Adiciona classe com efeito de desfoque e sombra escura quando a página é rolada.
 */
function initHeaderScroll() {
    const header = document.getElementById("main-header");
    if (!header) return;

    window.addEventListener("scroll", () => {
        if (window.scrollY > 40) {
            header.classList.add("header-scrolled");
        } else {
            header.classList.remove("header-scrolled");
        }
    });
}

/**
 * Módulo 4: Animações de Entrada (Reveal on Scroll)
 * Exibe os elementos gradualmente à medida que entram na área de visualização do navegador.
 */
function initScrollReveal() {
    const revealElements = document.querySelectorAll(".reveal-left, .reveal-right, .reveal-up");
    if (revealElements.length === 0) return;

    const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.12
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("reveal-active");
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => observer.observe(el));
}

/**
 * Módulo 5: Acordeão de Perguntas Frequentes (FAQ)
 * Abre e fecha as respostas permitindo que apenas uma dúvida fique expandida por vez.
 */
function initFaqAccordion() {
    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach(item => {
        const trigger = item.querySelector(".faq-trigger");
        const content = item.querySelector(".faq-content");
        if (!trigger || !content) return;

        trigger.addEventListener("click", () => {
            const isActive = item.classList.contains("active");

            // Fecha todos os outros itens antes de abrir o clicado
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains("active")) {
                    otherItem.classList.remove("active");
                    const otherContent = otherItem.querySelector(".faq-content");
                    const otherTrigger = otherItem.querySelector(".faq-trigger");
                    if (otherContent) otherContent.style.maxHeight = "0";
                    if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
                }
            });

            // Alterna o estado do item clicado
            if (isActive) {
                item.classList.remove("active");
                content.style.maxHeight = "0";
                trigger.setAttribute("aria-expanded", "false");
            } else {
                item.classList.add("active");
                content.style.maxHeight = content.scrollHeight + "px";
                trigger.setAttribute("aria-expanded", "true");

                // Envia evento de interação do FAQ para o dataLayer
                const questionText = trigger.querySelector("span") ? trigger.querySelector("span").innerText.trim() : "";
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    event: "faq_interacted",
                    faq_question: questionText
                });
            }
        });
    });
}

/**
 * Módulo 6: Contadores Numéricos Animados
 * Realiza uma contagem gradual dos números de atendimentos e anos de experiência.
 */
function initCounters() {
    const statsSection = document.getElementById("prova-social");
    const numbers = document.querySelectorAll(".stat-number");
    if (!statsSection || numbers.length === 0) return;

    let animated = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                animateNumbers();
                animated = true;
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.25 });

    observer.observe(statsSection);

    function animateNumbers() {
        numbers.forEach(num => {
            const target = parseInt(num.getAttribute("data-target"), 10);
            const isPercent = num.innerText.includes("%");
            const isPlus = num.innerText.includes("+");
            let current = 0;
            const duration = 2000;
            const stepTime = Math.max(Math.floor(duration / target), 15);

            const timer = setInterval(() => {
                current += Math.ceil(target / (duration / stepTime));
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }

                const formattedCurrent = current >= 1000 ? current.toLocaleString('pt-BR') : current;
                if (isPercent) {
                    num.innerText = `${formattedCurrent}%`;
                } else if (isPlus) {
                    num.innerText = `${formattedCurrent}+`;
                } else {
                    num.innerText = formattedCurrent;
                }
            }, stepTime);
        });
    }
}

/**
 * Módulo 7: Banner de Consentimento de Cookies da LGPD
 * Permite ao usuário aceitar ou recusar cookies de navegação e armazena a preferência localmente.
 */
function initCookieConsent() {
    const banner = document.getElementById("cookie-banner");
    const btnAccept = document.getElementById("btn-cookie-accept");
    const btnReject = document.getElementById("btn-cookie-reject");

    if (!banner || !btnAccept || !btnReject) return;

    const consent = localStorage.getItem("cookie_consent_evento");
    if (!consent) {
        banner.classList.remove("hidden");
    }

    btnAccept.addEventListener("click", () => {
        localStorage.setItem("cookie_consent_evento", "accepted");
        banner.classList.add("hidden");
    });

    btnReject.addEventListener("click", () => {
        localStorage.setItem("cookie_consent_evento", "rejected");
        banner.classList.add("hidden");
    });
}
