"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  TrendingUp, Zap, Shield, Star,
  ArrowRight, Trophy, Users,
  CheckCircle, Lock, Globe
} from 'lucide-react';

// ─── Translations ──────────────────────────────
const translations = {
  en: {
    name: 'English', flag: '🇬🇧',
    tagline: 'Professional Sports Signals',
    sub: 'For Winners Worldwide',
    desc: 'Expert football analysis and Aviator signals. Trusted by thousands of winners across 100+ countries. Pay daily, win daily.',
    liveSignals: 'Live Signals Available Now',
    footballBtn: 'Football Signals',
    aviatorBtn: 'Aviator Signals',
    howWorks: 'How It Works',
    howSub: 'Start winning in 4 simple steps',
    register: 'Register',
    registerDesc: 'Free account in 30 seconds',
    browse: 'Browse',
    browseDesc: "See today's available signals",
    unlock: 'Unlock',
    unlockDesc: 'Pay with card or mobile money',
    win: 'Win!',
    winDesc: 'Follow signal and collect',
    todaySignals: "Today's Signals",
    todaySub: 'Login and pay to unlock full details',
    unlockAll: 'Unlock All Signals',
    loginUnlock: 'Login to Unlock',
    whyUs: 'Why Choose GlobalHub?',
    whyUsub: 'Trusted by thousands of winners worldwide',
    verifiedTitle: 'Verified Signals',
    verifiedDesc: 'Every signal verified by expert analysts before publishing. Pure data-driven decisions.',
    winRateTitle: '94% Win Rate',
    winRateDesc: 'Proven track record with 10,000+ satisfied members across 100+ countries.',
    supportTitle: '24/7 Live Support',
    supportDesc: 'Our team is always available via WhatsApp, Telegram, and Email.',
    payments: 'Secure Payment Methods Worldwide',
    joinWinners: 'Join 10,000+ Winners',
    joinDesc: 'Start with just one signal today. Pay once, unlock for 24 hours. No subscription needed.',
    getStarted: 'Get Started Free',
    noSub: 'No subscription · Pay daily · Works worldwide',
    accuracy: 'Accuracy Rate',
    members: 'Active Members',
    countries: 'Countries',
    support: 'Live Support',
    pricing: 'Pricing',
    login: 'Log In',
    joinNow: 'Join Now',
    membersOnly: 'Members only',
    signalLocked: 'Signal locked — Members only',
    entryLocked: 'Unlock entry & exit — Members only',
    terms: 'Terms',
    privacy: 'Privacy',
    responsible: 'Responsible Gaming',
  },
  zh: {
    name: '中文', flag: '🇨🇳',
    tagline: '专业体育信号',
    sub: '全球赢家专属',
    desc: '专业足球分析和Aviator信号。被全球100多个国家的数千名赢家信赖。每日付费，每日获胜。',
    liveSignals: '实时信号现已开放',
    footballBtn: '足球信号',
    aviatorBtn: 'Aviator信号',
    howWorks: '如何运作',
    howSub: '4个简单步骤开始获胜',
    register: '注册',
    registerDesc: '30秒免费注册',
    browse: '浏览',
    browseDesc: '查看今日可用信号',
    unlock: '解锁',
    unlockDesc: '用卡片或移动支付',
    win: '获胜！',
    winDesc: '跟随信号并收取收益',
    todaySignals: '今日信号',
    todaySub: '登录并付款以解锁完整详情',
    unlockAll: '解锁所有信号',
    loginUnlock: '登录以解锁',
    whyUs: '为什么选择GlobalHub？',
    whyUsub: '被全球数千名赢家信赖',
    verifiedTitle: '已验证信号',
    verifiedDesc: '每个信号在发布前都经过专家分析师验证。纯数据驱动决策。',
    winRateTitle: '94%胜率',
    winRateDesc: '经过验证的记录，在100多个国家拥有10,000多名满意会员。',
    supportTitle: '24/7在线支持',
    supportDesc: '我们的团队随时通过WhatsApp、Telegram和电子邮件为您服务。',
    payments: '全球安全支付方式',
    joinWinners: '加入10,000+赢家',
    joinDesc: '今天从一个信号开始。一次付款，解锁24小时。无需订阅。',
    getStarted: '免费开始',
    noSub: '无订阅 · 每日付款 · 全球适用',
    accuracy: '准确率',
    members: '活跃会员',
    countries: '国家',
    support: '在线支持',
    pricing: '定价',
    login: '登录',
    joinNow: '立即加入',
    membersOnly: '仅限会员',
    signalLocked: '信号已锁定 — 仅限会员',
    entryLocked: '解锁进入和退出 — 仅限会员',
    terms: '条款',
    privacy: '隐私',
    responsible: '负责任游戏',
  },
  hi: {
    name: 'हिन्दी', flag: '🇮🇳',
    tagline: 'पेशेवर खेल संकेत',
    sub: 'दुनिया भर के विजेताओं के लिए',
    desc: 'विशेषज्ञ फुटबॉल विश्लेषण और Aviator संकेत। 100+ देशों में हजारों विजेताओं द्वारा भरोसा किया गया। रोज़ाना भुगतान करें, रोज़ाना जीतें।',
    liveSignals: 'लाइव सिग्नल अभी उपलब्ध',
    footballBtn: 'फुटबॉल सिग्नल',
    aviatorBtn: 'एविएटर सिग्नल',
    howWorks: 'यह कैसे काम करता है',
    howSub: '4 सरल चरणों में जीतना शुरू करें',
    register: 'रजिस्टर करें',
    registerDesc: '30 सेकंड में मुफ़्त खाता',
    browse: 'ब्राउज़ करें',
    browseDesc: 'आज के उपलब्ध सिग्नल देखें',
    unlock: 'अनलॉक करें',
    unlockDesc: 'कार्ड या मोबाइल मनी से भुगतान करें',
    win: 'जीतें!',
    winDesc: 'सिग्नल का पालन करें और कमाई करें',
    todaySignals: 'आज के सिग्नल',
    todaySub: 'पूरी जानकारी अनलॉक करने के लिए लॉगिन करें',
    unlockAll: 'सभी सिग्नल अनलॉक करें',
    loginUnlock: 'अनलॉक करने के लिए लॉगिन करें',
    whyUs: 'GlobalHub क्यों चुनें?',
    whyUsub: 'दुनिया भर के हजारों विजेताओं द्वारा भरोसा',
    verifiedTitle: 'सत्यापित सिग्नल',
    verifiedDesc: 'प्रत्येक सिग्नल प्रकाशन से पहले विशेषज्ञ विश्लेषकों द्वारा सत्यापित किया जाता है।',
    winRateTitle: '94% जीत दर',
    winRateDesc: '100+ देशों में 10,000+ संतुष्ट सदस्यों के साथ सिद्ध ट्रैक रिकॉर्ड।',
    supportTitle: '24/7 लाइव सपोर्ट',
    supportDesc: 'हमारी टीम हमेशा WhatsApp, Telegram और Email के माध्यम से उपलब्ध है।',
    payments: 'दुनिया भर में सुरक्षित भुगतान',
    joinWinners: '10,000+ विजेताओं से जुड़ें',
    joinDesc: 'आज एक सिग्नल से शुरुआत करें। एक बार भुगतान करें, 24 घंटे के लिए अनलॉक करें।',
    getStarted: 'मुफ़्त शुरू करें',
    noSub: 'कोई सब्सक्रिप्शन नहीं · रोज़ भुगतान · विश्वव्यापी',
    accuracy: 'सटीकता दर',
    members: 'सक्रिय सदस्य',
    countries: 'देश',
    support: 'लाइव सपोर्ट',
    pricing: 'मूल्य',
    login: 'लॉगिन',
    joinNow: 'अभी जुड़ें',
    membersOnly: 'केवल सदस्यों के लिए',
    signalLocked: 'सिग्नल लॉक है — केवल सदस्य',
    entryLocked: 'एंट्री और एग्जिट अनलॉक करें',
    terms: 'नियम',
    privacy: 'गोपनीयता',
    responsible: 'जिम्मेदार गेमिंग',
  },
  es: {
    name: 'Español', flag: '🇪🇸',
    tagline: 'Señales Deportivas Profesionales',
    sub: 'Para Ganadores en Todo el Mundo',
    desc: 'Análisis experto de fútbol y señales de Aviator. Confiado por miles de ganadores en más de 100 países. Paga diario, gana diario.',
    liveSignals: 'Señales en Vivo Disponibles Ahora',
    footballBtn: 'Señales de Fútbol',
    aviatorBtn: 'Señales de Aviator',
    howWorks: 'Cómo Funciona',
    howSub: 'Empieza a ganar en 4 pasos simples',
    register: 'Registrarse',
    registerDesc: 'Cuenta gratis en 30 segundos',
    browse: 'Explorar',
    browseDesc: 'Ver señales disponibles hoy',
    unlock: 'Desbloquear',
    unlockDesc: 'Paga con tarjeta o dinero móvil',
    win: '¡Ganar!',
    winDesc: 'Sigue la señal y cobra',
    todaySignals: 'Señales de Hoy',
    todaySub: 'Inicia sesión y paga para desbloquear',
    unlockAll: 'Desbloquear Todo',
    loginUnlock: 'Iniciar sesión para desbloquear',
    whyUs: '¿Por qué GlobalHub?',
    whyUsub: 'Confiado por miles de ganadores en todo el mundo',
    verifiedTitle: 'Señales Verificadas',
    verifiedDesc: 'Cada señal verificada por analistas expertos antes de publicar.',
    winRateTitle: '94% de Éxito',
    winRateDesc: 'Historial probado con más de 10,000 miembros satisfechos en 100+ países.',
    supportTitle: 'Soporte 24/7',
    supportDesc: 'Nuestro equipo siempre disponible via WhatsApp, Telegram y Email.',
    payments: 'Métodos de Pago Seguros Mundiales',
    joinWinners: 'Únete a 10,000+ Ganadores',
    joinDesc: 'Comienza con una señal hoy. Paga una vez, desbloquea por 24 horas.',
    getStarted: 'Comenzar Gratis',
    noSub: 'Sin suscripción · Pago diario · Disponible mundialmente',
    accuracy: 'Tasa de Precisión',
    members: 'Miembros Activos',
    countries: 'Países',
    support: 'Soporte en Vivo',
    pricing: 'Precios',
    login: 'Iniciar Sesión',
    joinNow: 'Únete Ahora',
    membersOnly: 'Solo miembros',
    signalLocked: 'Señal bloqueada — Solo miembros',
    entryLocked: 'Desbloquear entrada y salida',
    terms: 'Términos',
    privacy: 'Privacidad',
    responsible: 'Juego Responsable',
  },
  fr: {
    name: 'Français', flag: '🇫🇷',
    tagline: 'Signaux Sportifs Professionnels',
    sub: 'Pour les Gagnants du Monde Entier',
    desc: "Analyse experte du football et signaux Aviator. Fiable par des milliers de gagnants dans plus de 100 pays. Payez quotidiennement, gagnez quotidiennement.",
    liveSignals: 'Signaux en Direct Disponibles',
    footballBtn: 'Signaux Football',
    aviatorBtn: 'Signaux Aviator',
    howWorks: 'Comment Ça Marche',
    howSub: 'Commencez à gagner en 4 étapes simples',
    register: "S'inscrire",
    registerDesc: 'Compte gratuit en 30 secondes',
    browse: 'Parcourir',
    browseDesc: "Voir les signaux disponibles aujourd'hui",
    unlock: 'Débloquer',
    unlockDesc: 'Payez par carte ou argent mobile',
    win: 'Gagner!',
    winDesc: 'Suivez le signal et collectez',
    todaySignals: "Signaux d'Aujourd'hui",
    todaySub: 'Connectez-vous et payez pour débloquer',
    unlockAll: 'Tout Débloquer',
    loginUnlock: 'Se connecter pour débloquer',
    whyUs: 'Pourquoi GlobalHub?',
    whyUsub: 'Fiable par des milliers de gagnants mondiaux',
    verifiedTitle: 'Signaux Vérifiés',
    verifiedDesc: 'Chaque signal vérifié par des analystes experts avant publication.',
    winRateTitle: 'Taux de Réussite 94%',
    winRateDesc: 'Bilan prouvé avec plus de 10 000 membres satisfaits dans 100+ pays.',
    supportTitle: 'Support 24/7',
    supportDesc: 'Notre équipe disponible via WhatsApp, Telegram et Email.',
    payments: 'Méthodes de Paiement Sécurisées',
    joinWinners: 'Rejoignez 10 000+ Gagnants',
    joinDesc: 'Commencez avec un signal aujourd\'hui. Payez une fois, débloquez pendant 24 heures.',
    getStarted: 'Commencer Gratuitement',
    noSub: 'Sans abonnement · Paiement quotidien · Mondial',
    accuracy: 'Taux de Précision',
    members: 'Membres Actifs',
    countries: 'Pays',
    support: 'Support en Direct',
    pricing: 'Tarifs',
    login: 'Connexion',
    joinNow: 'Rejoindre',
    membersOnly: 'Membres seulement',
    signalLocked: 'Signal verrouillé — Membres seulement',
    entryLocked: 'Débloquer entrée et sortie',
    terms: 'Conditions',
    privacy: 'Confidentialité',
    responsible: 'Jeu Responsable',
  },
  ar: {
    name: 'العربية', flag: '🇸🇦',
    tagline: 'إشارات رياضية احترافية',
    sub: 'للفائزين في جميع أنحاء العالم',
    desc: 'تحليل خبير لكرة القدم وإشارات أفياتور. موثوق به من قِبل آلاف الفائزين في أكثر من 100 دولة.',
    liveSignals: 'إشارات مباشرة متاحة الآن',
    footballBtn: 'إشارات كرة القدم',
    aviatorBtn: 'إشارات أفياتور',
    howWorks: 'كيف يعمل',
    howSub: 'ابدأ الفوز في 4 خطوات بسيطة',
    register: 'التسجيل',
    registerDesc: 'حساب مجاني في 30 ثانية',
    browse: 'تصفح',
    browseDesc: 'اعرض الإشارات المتاحة اليوم',
    unlock: 'فتح',
    unlockDesc: 'ادفع بالبطاقة أو المحفظة الإلكترونية',
    win: 'اربح!',
    winDesc: 'اتبع الإشارة واجمع أرباحك',
    todaySignals: 'إشارات اليوم',
    todaySub: 'سجل الدخول وادفع لفتح التفاصيل',
    unlockAll: 'فتح جميع الإشارات',
    loginUnlock: 'سجل الدخول للفتح',
    whyUs: 'لماذا GlobalHub؟',
    whyUsub: 'موثوق به من الآلاف في جميع أنحاء العالم',
    verifiedTitle: 'إشارات موثقة',
    verifiedDesc: 'كل إشارة يتحقق منها محللون خبراء قبل النشر.',
    winRateTitle: 'معدل فوز 94٪',
    winRateDesc: 'سجل حافل مع أكثر من 10,000 عضو راضٍ في 100+ دولة.',
    supportTitle: 'دعم 24/7',
    supportDesc: 'فريقنا متاح دائماً عبر WhatsApp وTelegram والبريد الإلكتروني.',
    payments: 'طرق دفع آمنة عالمية',
    joinWinners: 'انضم لأكثر من 10,000 فائز',
    joinDesc: 'ابدأ بإشارة واحدة اليوم. ادفع مرة واحدة، افتح لمدة 24 ساعة.',
    getStarted: 'ابدأ مجاناً',
    noSub: 'بدون اشتراك · دفع يومي · متوفر عالمياً',
    accuracy: 'معدل الدقة',
    members: 'الأعضاء النشطون',
    countries: 'دولة',
    support: 'الدعم المباشر',
    pricing: 'الأسعار',
    login: 'تسجيل الدخول',
    joinNow: 'انضم الآن',
    membersOnly: 'للأعضاء فقط',
    signalLocked: 'الإشارة مقفلة — للأعضاء فقط',
    entryLocked: 'افتح نقاط الدخول والخروج',
    terms: 'الشروط',
    privacy: 'الخصوصية',
    responsible: 'اللعب المسؤول',
  },
  pt: {
    name: 'Português', flag: '🇧🇷',
    tagline: 'Sinais Esportivos Profissionais',
    sub: 'Para Vencedores em Todo o Mundo',
    desc: 'Análise especializada de futebol e sinais Aviator. Confiado por milhares de vencedores em mais de 100 países.',
    liveSignals: 'Sinais ao Vivo Disponíveis',
    footballBtn: 'Sinais de Futebol',
    aviatorBtn: 'Sinais Aviator',
    howWorks: 'Como Funciona',
    howSub: 'Comece a ganhar em 4 passos simples',
    register: 'Registrar',
    registerDesc: 'Conta grátis em 30 segundos',
    browse: 'Explorar',
    browseDesc: 'Ver sinais disponíveis hoje',
    unlock: 'Desbloquear',
    unlockDesc: 'Pague com cartão ou dinheiro móvel',
    win: 'Ganhar!',
    winDesc: 'Siga o sinal e colete',
    todaySignals: 'Sinais de Hoje',
    todaySub: 'Faça login e pague para desbloquear',
    unlockAll: 'Desbloquear Tudo',
    loginUnlock: 'Login para desbloquear',
    whyUs: 'Por que GlobalHub?',
    whyUsub: 'Confiado por milhares de vencedores mundiais',
    verifiedTitle: 'Sinais Verificados',
    verifiedDesc: 'Cada sinal verificado por analistas especialistas antes de publicar.',
    winRateTitle: 'Taxa de Acerto 94%',
    winRateDesc: 'Histórico comprovado com mais de 10.000 membros satisfeitos em 100+ países.',
    supportTitle: 'Suporte 24/7',
    supportDesc: 'Nossa equipe sempre disponível via WhatsApp, Telegram e Email.',
    payments: 'Métodos de Pagamento Seguros',
    joinWinners: 'Junte-se a 10.000+ Vencedores',
    joinDesc: 'Comece com um sinal hoje. Pague uma vez, desbloqueie por 24 horas.',
    getStarted: 'Começar Grátis',
    noSub: 'Sem assinatura · Pagamento diário · Mundial',
    accuracy: 'Taxa de Precisão',
    members: 'Membros Ativos',
    countries: 'Países',
    support: 'Suporte ao Vivo',
    pricing: 'Preços',
    login: 'Entrar',
    joinNow: 'Entrar Agora',
    membersOnly: 'Somente membros',
    signalLocked: 'Sinal bloqueado — Somente membros',
    entryLocked: 'Desbloquear entrada e saída',
    terms: 'Termos',
    privacy: 'Privacidade',
    responsible: 'Jogo Responsável',
  },
  ru: {
    name: 'Русский', flag: '🇷🇺',
    tagline: 'Профессиональные Спортивные Сигналы',
    sub: 'Для Победителей по Всему Миру',
    desc: 'Экспертный анализ футбола и сигналы Aviator. Доверяют тысячи победителей в более чем 100 странах.',
    liveSignals: 'Живые Сигналы Доступны Сейчас',
    footballBtn: 'Футбольные Сигналы',
    aviatorBtn: 'Сигналы Aviator',
    howWorks: 'Как Это Работает',
    howSub: '4 простых шага к победе',
    register: 'Зарегистрироваться',
    registerDesc: 'Бесплатный аккаунт за 30 секунд',
    browse: 'Просмотр',
    browseDesc: 'Смотрите доступные сигналы сегодня',
    unlock: 'Разблокировать',
    unlockDesc: 'Оплатите картой или мобильными деньгами',
    win: 'Выиграть!',
    winDesc: 'Следуйте сигналу и собирайте',
    todaySignals: 'Сигналы Сегодня',
    todaySub: 'Войдите и оплатите для разблокировки',
    unlockAll: 'Разблокировать Всё',
    loginUnlock: 'Войти для разблокировки',
    whyUs: 'Почему GlobalHub?',
    whyUsub: 'Доверяют тысячи победителей по всему миру',
    verifiedTitle: 'Проверенные Сигналы',
    verifiedDesc: 'Каждый сигнал проверяется экспертными аналитиками перед публикацией.',
    winRateTitle: 'Процент Побед 94%',
    winRateDesc: 'Проверенный результат с более чем 10 000 довольных членов в 100+ странах.',
    supportTitle: 'Поддержка 24/7',
    supportDesc: 'Наша команда всегда доступна через WhatsApp, Telegram и Email.',
    payments: 'Безопасные Способы Оплаты по Всему Миру',
    joinWinners: 'Присоединяйтесь к 10 000+ Победителям',
    joinDesc: 'Начните с одного сигнала сегодня. Платите раз, разблокируйте на 24 часа.',
    getStarted: 'Начать Бесплатно',
    noSub: 'Без подписки · Ежедневная оплата · По всему миру',
    accuracy: 'Точность',
    members: 'Активные Члены',
    countries: 'Страны',
    support: 'Живая Поддержка',
    pricing: 'Цены',
    login: 'Войти',
    joinNow: 'Присоединиться',
    membersOnly: 'Только для членов',
    signalLocked: 'Сигнал заблокирован — Только для членов',
    entryLocked: 'Разблокировать точки входа и выхода',
    terms: 'Условия',
    privacy: 'Конфиденциальность',
    responsible: 'Ответственная игра',
  },
  sw: {
    name: 'Kiswahili', flag: '🇰🇪',
    tagline: 'Ishara za Michezo za Kitaalamu',
    sub: 'Kwa Washindi Duniani Kote',
    desc: 'Uchambuzi wa kitaalamu wa mpira na ishara za Aviator. Inayoaminiwa na maelfu ya washindi katika nchi 100+.',
    liveSignals: 'Ishara za Moja kwa Moja Zinapatikana',
    footballBtn: 'Ishara za Mpira',
    aviatorBtn: 'Ishara za Aviator',
    howWorks: 'Jinsi Inavyofanya Kazi',
    howSub: 'Anza kushinda kwa hatua 4 rahisi',
    register: 'Jisajili',
    registerDesc: 'Akaunti ya bure kwa sekunde 30',
    browse: 'Vinjari',
    browseDesc: 'Ona ishara zinazopatikana leo',
    unlock: 'Fungua',
    unlockDesc: 'Lipa kwa kadi au pesa ya simu',
    win: 'Shinda!',
    winDesc: 'Fuata ishara na ukusanye',
    todaySignals: 'Ishara za Leo',
    todaySub: 'Ingia na ulipe kufungua maelezo kamili',
    unlockAll: 'Fungua Ishara Zote',
    loginUnlock: 'Ingia kufungua',
    whyUs: 'Kwa Nini GlobalHub?',
    whyUsub: 'Inayoaminiwa na maelfu ya washindi duniani',
    verifiedTitle: 'Ishara Zilizothibitishwa',
    verifiedDesc: 'Kila ishara inathibitishwa na wachanuzi wataalamu kabla ya kuchapishwa.',
    winRateTitle: 'Kiwango cha Kushinda 94%',
    winRateDesc: 'Rekodi iliyothibitishwa na zaidi ya wanachama 10,000 walioridhika katika nchi 100+.',
    supportTitle: 'Msaada 24/7',
    supportDesc: 'Timu yetu inapatikana kila wakati kupitia WhatsApp, Telegram na Barua pepe.',
    payments: 'Njia Salama za Malipo Duniani Kote',
    joinWinners: 'Jiunge na Washindi 10,000+',
    joinDesc: 'Anza na ishara moja leo. Lipa mara moja, fungua kwa saa 24.',
    getStarted: 'Anza Bure',
    noSub: 'Bila usajili · Malipo ya kila siku · Inafanya kazi duniani',
    accuracy: 'Kiwango cha Usahihi',
    members: 'Wanachama Wanaofanya Kazi',
    countries: 'Nchi',
    support: 'Msaada wa Moja kwa Moja',
    pricing: 'Bei',
    login: 'Ingia',
    joinNow: 'Jiunge Sasa',
    membersOnly: 'Wanachama tu',
    signalLocked: 'Ishara imefungwa — Wanachama tu',
    entryLocked: 'Fungua kuingia na kutoka',
    terms: 'Masharti',
    privacy: 'Faragha',
    responsible: 'Mchezo wa Kuwajibika',
  },
  de: {
    name: 'Deutsch', flag: '🇩🇪',
    tagline: 'Professionelle Sport-Signale',
    sub: 'Für Gewinner Weltweit',
    desc: 'Experten-Fußballanalyse und Aviator-Signale. Vertraut von Tausenden Gewinnern in über 100 Ländern.',
    liveSignals: 'Live-Signale Jetzt Verfügbar',
    footballBtn: 'Fußball-Signale',
    aviatorBtn: 'Aviator-Signale',
    howWorks: 'Wie Es Funktioniert',
    howSub: 'Beginne in 4 einfachen Schritten zu gewinnen',
    register: 'Registrieren',
    registerDesc: 'Kostenloses Konto in 30 Sekunden',
    browse: 'Durchsuchen',
    browseDesc: 'Heute verfügbare Signale ansehen',
    unlock: 'Entsperren',
    unlockDesc: 'Mit Karte oder Mobile Money bezahlen',
    win: 'Gewinnen!',
    winDesc: 'Signal folgen und gewinnen',
    todaySignals: "Heutige Signale",
    todaySub: 'Einloggen und zahlen zum Entsperren',
    unlockAll: 'Alle Signale entsperren',
    loginUnlock: 'Einloggen zum entsperren',
    whyUs: 'Warum GlobalHub?',
    whyUsub: 'Von Tausenden Gewinnern weltweit vertraut',
    verifiedTitle: 'Verifizierte Signale',
    verifiedDesc: 'Jedes Signal von Experten vor der Veröffentlichung überprüft.',
    winRateTitle: '94% Gewinnrate',
    winRateDesc: 'Bewährte Erfolgsbilanz mit über 10.000 zufriedenen Mitgliedern in 100+ Ländern.',
    supportTitle: '24/7 Live-Support',
    supportDesc: 'Unser Team immer über WhatsApp, Telegram und E-Mail erreichbar.',
    payments: 'Sichere Zahlungsmethoden Weltweit',
    joinWinners: '10.000+ Gewinnern beitreten',
    joinDesc: 'Beginne heute mit einem Signal. Einmal zahlen, 24 Stunden entsperrt.',
    getStarted: 'Kostenlos Starten',
    noSub: 'Kein Abo · Tägliche Zahlung · Weltweit verfügbar',
    accuracy: 'Genauigkeitsrate',
    members: 'Aktive Mitglieder',
    countries: 'Länder',
    support: 'Live-Support',
    pricing: 'Preise',
    login: 'Anmelden',
    joinNow: 'Jetzt Beitreten',
    membersOnly: 'Nur Mitglieder',
    signalLocked: 'Signal gesperrt — Nur Mitglieder',
    entryLocked: 'Ein- und Ausstiegspunkte entsperren',
    terms: 'AGB',
    privacy: 'Datenschutz',
    responsible: 'Verantwortungsvolles Spielen',
  },
};

type LangKey = keyof typeof translations;

// ─── Live Football Card ────────────────────────
function FootballCard({ t }: { t: typeof translations.en }) {
  const [odds, setOdds] = useState([2.45, 3.20, 2.80]);
  const [flash, setFlash] = useState(-1);

  useEffect(() => {
    const interval = setInterval(() => {
      const i = Math.floor(Math.random() * 3);
      const d = (Math.random() - 0.5) * 0.2;
      setOdds(p => p.map((o, j) =>
        j === i ? parseFloat(Math.max(1.1, o + d).toFixed(2)) : o
      ));
      setFlash(i);
      setTimeout(() => setFlash(-1), 600);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      background: 'linear-gradient(135deg,#1a2740,#0f1f33)',
      border: '1px solid #243b55', borderRadius: '16px',
      overflow: 'hidden'
    }}>
      <div style={{
        background: '#0f1f33', padding: '10px 16px',
        display: 'flex', justifyContent: 'space-between',
        borderBottom: '1px solid #1a2740'
      }}>
        <span style={{
          color: '#4ade80', fontSize: '11px', fontWeight: 700
        }}>
          ⚽ Premier League
        </span>
        <span style={{
          color: '#4ade80', fontSize: '11px', fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: '5px'
        }}>
          <span style={{
            width: '7px', height: '7px',
            background: '#4ade80', borderRadius: '50%'
          }} />
          LIVE
        </span>
      </div>
      <div style={{ padding: '18px 16px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '14px'
        }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontWeight: 900, color: 'white' }}>
              Arsenal
            </div>
            <div style={{ color: '#6b7280', fontSize: '10px' }}>
              HOME
            </div>
          </div>
          <div style={{ color: '#374151', fontWeight: 700 }}>
            VS
          </div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontWeight: 900, color: 'white' }}>
              Chelsea
            </div>
            <div style={{ color: '#6b7280', fontSize: '10px' }}>
              AWAY
            </div>
          </div>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          gap: '8px', marginBottom: '12px'
        }}>
          {['1', 'X', '2'].map((label, i) => (
            <div key={label} style={{
              background: flash === i
                ? 'rgba(74,222,128,0.15)' : '#0a1628',
              border: flash === i
                ? '1px solid #4ade80' : '1px solid #1a2740',
              borderRadius: '10px', padding: '10px 8px',
              textAlign: 'center',
              transform: flash === i ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.3s'
            }}>
              <div style={{
                color: '#6b7280', fontSize: '10px', marginBottom: '5px'
              }}>
                {label}
              </div>
              <div style={{
                fontWeight: 900, fontFamily: 'monospace',
                fontSize: '16px',
                color: flash === i ? '#4ade80' : 'white',
              }}>
                {odds[i]}
              </div>
            </div>
          ))}
        </div>
        <div style={{
          background: '#0a1628', border: '1px solid #1a2740',
          borderRadius: '10px', padding: '10px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '6px'
        }}>
          <Lock size={11} color="#eab308" />
          <span style={{
            color: '#eab308', fontSize: '11px', fontWeight: 700
          }}>
            {t.signalLocked}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Aviator Card ──────────────────────────────
function AviatorCard({ t }: { t: typeof translations.en }) {
  const [mult, setMult] = useState(1.00);
  const [phase, setPhase] = useState('waiting');

  useEffect(() => {
    let current = 1.00;
    let flyInterval: ReturnType<typeof setInterval>;
    let timer: ReturnType<typeof setTimeout>;

    const start = () => {
      const target = parseFloat(
        (Math.random() * 5 + 2).toFixed(2)
      );
      current = 1.00;
      setMult(1.00);
      setPhase('flying');
      flyInterval = setInterval(() => {
        current = parseFloat((current + 0.09).toFixed(2));
        setMult(current);
        if (current >= target) {
          clearInterval(flyInterval);
          setPhase('crashed');
          timer = setTimeout(() => {
            setPhase('waiting');
            start();
          }, 2500);
        }
      }, 100);
    };

    timer = setTimeout(start, 1500);
    return () => { clearInterval(flyInterval); clearTimeout(timer); };
  }, []);

  return (
    <div style={{
      background: 'linear-gradient(135deg,#1a2740,#0f1f33)',
      border: '1px solid #243b55', borderRadius: '16px',
      overflow: 'hidden'
    }}>
      <div style={{
        background: '#0f1f33', padding: '10px 16px',
        display: 'flex', justifyContent: 'space-between',
        borderBottom: '1px solid #1a2740'
      }}>
        <span style={{
          color: '#f87171', fontSize: '11px', fontWeight: 700
        }}>
          ✈️ Aviator Signal
        </span>
        <span style={{
          background: 'rgba(239,68,68,0.15)',
          color: '#f87171', fontSize: '11px', fontWeight: 700,
          padding: '2px 8px', borderRadius: '20px'
        }}>
          🔥 HOT
        </span>
      </div>
      <div style={{ padding: '16px' }}>
        <div style={{
          background: '#0a1628', border: '1px solid #1a2740',
          borderRadius: '12px', height: '90px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', marginBottom: '14px',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{
            fontSize: '42px', fontWeight: 900,
            fontFamily: 'monospace',
            color: phase === 'crashed' ? '#f87171'
              : phase === 'flying' ? '#4ade80' : '#374151',
            transition: 'color 0.3s',
            zIndex: 1, position: 'relative'
          }}>
            {mult.toFixed(2)}x
          </div>
          {phase === 'crashed' && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(239,68,68,0.08)',
              display: 'flex', alignItems: 'flex-end',
              justifyContent: 'center', paddingBottom: '6px'
            }}>
              <span style={{
                color: '#f87171', fontSize: '10px',
                fontWeight: 700, textTransform: 'uppercase'
              }}>
                Flew Away
              </span>
            </div>
          )}
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '8px', marginBottom: '10px'
        }}>
          {[
            { label: 'Entry Point', color: '#4ade80' },
            { label: 'Exit Point', color: '#f87171' },
          ].map(item => (
            <div key={item.label} style={{
              background: '#0a1628', border: '1px solid #1a2740',
              borderRadius: '10px', padding: '12px',
              textAlign: 'center'
            }}>
              <div style={{
                color: '#6b7280', fontSize: '10px',
                marginBottom: '5px'
              }}>
                {item.label}
              </div>
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '4px'
              }}>
                <Lock size={10} color="#4b5563" />
                <span style={{
                  fontFamily: 'monospace', fontWeight: 900,
                  fontSize: '16px', color: '#374151'
                }}>
                  ??.??x
                </span>
              </div>
            </div>
          ))}
        </div>
        <div style={{
          background: '#0a1628', border: '1px solid #1a2740',
          borderRadius: '10px', padding: '10px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '6px'
        }}>
          <Lock size={11} color="#eab308" />
          <span style={{
            color: '#eab308', fontSize: '11px', fontWeight: 700
          }}>
            {t.entryLocked}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────
export default function Home() {
  const [lang, setLang] = useState<LangKey>('en');
  const [showLang, setShowLang] = useState(false);
  const t = translations[lang];
  const isRTL = lang === 'ar';

  // Auto-detect language
  useEffect(() => {
    const browserLang = navigator.language.slice(0, 2);
    const map: Record<string, LangKey> = {
      zh: 'zh', hi: 'hi', es: 'es', fr: 'fr',
      ar: 'ar', pt: 'pt', ru: 'ru', sw: 'sw', de: 'de'
    };
    if (map[browserLang]) setLang(map[browserLang]);
  }, []);

  const globalCountries = [
    '🇺🇸 USA', '🇬🇧 UK', '🇧🇷 Brazil',
    '🇮🇳 India', '🇳🇬 Nigeria', '🇯🇵 Japan',
    '🇩🇪 Germany', '🇦🇺 Australia', '🇰🇪 Kenya',
    '🇨🇳 China', '🇿🇦 S.Africa', '🌍 +100 more'
  ];

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{
      minHeight: '100vh', background: '#0a1628',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>

      {/* TOP BAR */}
      <div style={{
        background: '#060f1e',
        borderBottom: '1px solid #1a2740',
        padding: '8px 16px',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '16px', flexWrap: 'wrap'
        }}>
          <span style={{
            color: '#6b7280', fontSize: '11px',
            display: 'flex', alignItems: 'center', gap: '5px'
          }}>
            <span style={{
              width: '6px', height: '6px',
              background: '#22c55e', borderRadius: '50%'
            }} />
            Available in 100+ countries
          </span>
          <span style={{ color: '#6b7280', fontSize: '11px' }}>
            💳 Card · Mobile Money · USSD
          </span>
        </div>

        {/* Language Selector */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowLang(!showLang)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: '#0f1f33',
              border: '1px solid #1a2740',
              borderRadius: '8px', padding: '5px 12px',
              color: 'white', fontSize: '12px',
              fontWeight: 700, cursor: 'pointer',
              touchAction: 'manipulation'
            }}
          >
            <Globe size={12} />
            {translations[lang].flag} {translations[lang].name}
            <span style={{ color: '#6b7280' }}>▾</span>
          </button>

          {showLang && (
            <div style={{
              position: 'absolute', top: '100%',
              right: 0, marginTop: '4px',
              background: '#0f1f33',
              border: '1px solid #1a2740',
              borderRadius: '12px', padding: '6px',
              zIndex: 1000, minWidth: '160px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
            }}>
              {(Object.keys(translations) as LangKey[]).map(
                key => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setLang(key);
                    setShowLang(false);
                  }}
                  style={{
                    display: 'flex', alignItems: 'center',
                    gap: '8px', width: '100%',
                    padding: '8px 10px', borderRadius: '8px',
                    border: 'none', background: lang === key
                      ? 'rgba(34,197,94,0.15)' : 'transparent',
                    color: lang === key ? '#22c55e' : '#9ca3af',
                    fontSize: '13px', fontWeight: 600,
                    cursor: 'pointer', textAlign: 'left',
                    touchAction: 'manipulation'
                  }}
                >
                  {translations[key].flag}{' '}
                  {translations[key].name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* NAVBAR */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(10,22,40,0.97)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #1a2740',
        padding: '0 16px'
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', height: '60px'
        }}>
          <Link href="/" style={{
            display: 'flex', alignItems: 'center',
            gap: '10px', textDecoration: 'none'
          }}>
            <div style={{
              width: '36px', height: '36px',
              background: '#22c55e', borderRadius: '10px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(34,197,94,0.3)'
            }}>
              <Trophy size={18} color="black" />
            </div>
            <span style={{
              fontWeight: 900, fontSize: '20px',
              letterSpacing: '-0.5px', color: 'white'
            }}>
              GLOBAL<span style={{ color: '#22c55e' }}>HUB</span>
            </span>
          </Link>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px'
          }}>
            {[
              { label: `⚽ ${t.footballBtn.split(' ')[0]}`, href: '/football' },
              { label: `✈️ Aviator`, href: '/aviator' },
              { label: `💰 ${t.pricing}`, href: '/pricing' },
            ].map(item => (
              <Link key={item.href} href={item.href} style={{
                padding: '7px 12px', fontSize: '13px',
                fontWeight: 600, color: '#9ca3af',
                textDecoration: 'none', borderRadius: '8px',
                display: 'none'
              }}
                className="desktop-nav">
                {item.label}
              </Link>
            ))}
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <Link href="/login" style={{
              fontSize: '13px', fontWeight: 700,
              color: '#9ca3af', textDecoration: 'none',
              padding: '8px 12px'
            }}>
              {t.login}
            </Link>
            <Link href="/register" style={{
              background: '#22c55e', color: 'black',
              fontWeight: 900, padding: '9px 20px',
              borderRadius: '10px', fontSize: '13px',
              textDecoration: 'none',
              boxShadow: '0 4px 15px rgba(34,197,94,0.25)'
            }}>
              {t.joinNow}
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        background: 'linear-gradient(180deg,#0f1f33 0%,#0a1628 100%)',
        padding: '60px 16px'
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '40px'
        }}>
          <div style={{ maxWidth: '620px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center',
              gap: '8px',
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.25)',
              borderRadius: '20px', padding: '7px 16px',
              marginBottom: '24px'
            }}>
              <span style={{
                width: '7px', height: '7px',
                background: '#22c55e', borderRadius: '50%'
              }} />
              <span style={{
                color: '#22c55e', fontSize: '11px',
                fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}>
                {t.liveSignals}
              </span>
            </div>

            <h1 style={{
              fontWeight: 900, lineHeight: 1.1,
              marginBottom: '20px', letterSpacing: '-1px'
            }}>
              <span style={{
                fontSize: 'clamp(36px, 6vw, 64px)',
                display: 'block'
              }}>
                {t.tagline}
              </span>
              <span style={{
                fontSize: 'clamp(18px, 3vw, 28px)',
                display: 'block', color: '#22c55e',
                marginTop: '8px', fontWeight: 700
              }}>
                {t.sub}
              </span>
            </h1>

            <p style={{
              color: '#9ca3af', fontSize: '16px',
              lineHeight: 1.7, marginBottom: '28px',
              maxWidth: '520px'
            }}>
              {t.desc}
            </p>

            {/* Global countries */}
            <div style={{
              display: 'flex', flexWrap: 'wrap',
              gap: '8px', marginBottom: '32px'
            }}>
              {globalCountries.map(c => (
                <span key={c} style={{
                  background: '#1a2740',
                  border: '1px solid #243b55',
                  color: '#d1d5db', fontSize: '11px',
                  padding: '5px 10px', borderRadius: '20px'
                }}>
                  {c}
                </span>
              ))}
            </div>

            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '12px'
            }}>
              <Link href="/football" style={{
                display: 'inline-flex', alignItems: 'center',
                gap: '8px', background: '#22c55e', color: 'black',
                padding: '14px 28px', borderRadius: '12px',
                fontWeight: 900, fontSize: '15px',
                textDecoration: 'none',
                boxShadow: '0 8px 25px rgba(34,197,94,0.3)'
              }}>
                <TrendingUp size={18} />
                {t.footballBtn}
              </Link>
              <Link href="/aviator" style={{
                display: 'inline-flex', alignItems: 'center',
                gap: '8px', background: '#ef4444', color: 'white',
                padding: '14px 28px', borderRadius: '12px',
                fontWeight: 900, fontSize: '15px',
                textDecoration: 'none',
                boxShadow: '0 8px 25px rgba(239,68,68,0.3)'
              }}>
                <Zap size={18} />
                {t.aviatorBtn}
              </Link>
            </div>
          </div>

          {/* Cards */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            gap: '16px', maxWidth: '420px', width: '100%'
          }}>
            <FootballCard t={t} />
            <AviatorCard t={t} />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{
        background: '#0f1f33',
        borderTop: '1px solid #1a2740',
        borderBottom: '1px solid #1a2740',
        padding: '32px 16px'
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(2,1fr)',
          gap: '24px', textAlign: 'center'
        }}>
          {[
            { v: '94%', l: t.accuracy, c: '#22c55e' },
            { v: '10,000+', l: t.members, c: '#60a5fa' },
            { v: '100+', l: t.countries, c: '#fbbf24' },
            { v: '24/7', l: t.support, c: '#a78bfa' },
          ].map(s => (
            <div key={s.l}>
              <div style={{
                fontSize: 'clamp(26px, 5vw, 40px)',
                fontWeight: 900, fontFamily: 'monospace',
                color: s.c
              }}>
                {s.v}
              </div>
              <div style={{
                color: '#6b7280', fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em', marginTop: '6px'
              }}>
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '64px 16px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            textAlign: 'center', marginBottom: '48px'
          }}>
            <h2 style={{
              fontSize: 'clamp(22px, 4vw, 36px)',
              fontWeight: 900, textTransform: 'uppercase',
              letterSpacing: '-0.5px', marginBottom: '10px'
            }}>
              {t.howWorks}
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '15px' }}>
              {t.howSub}
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2,1fr)',
            gap: '16px'
          }}>
            {[
              { n: '1', e: '👤', title: t.register, desc: t.registerDesc, c: 'rgba(34,197,94,0.1)', b: 'rgba(34,197,94,0.25)' },
              { n: '2', e: '🔍', title: t.browse, desc: t.browseDesc, c: 'rgba(96,165,250,0.1)', b: 'rgba(96,165,250,0.25)' },
              { n: '3', e: '💳', title: t.unlock, desc: t.unlockDesc, c: 'rgba(251,191,36,0.1)', b: 'rgba(251,191,36,0.25)' },
              { n: '4', e: '🏆', title: t.win, desc: t.winDesc, c: 'rgba(167,139,250,0.1)', b: 'rgba(167,139,250,0.25)' },
            ].map(item => (
              <div key={item.n} style={{
                background: item.c,
                border: `1px solid ${item.b}`,
                borderRadius: '16px', padding: '24px 20px',
                textAlign: 'center', position: 'relative'
              }}>
                <div style={{
                  position: 'absolute', top: '-14px',
                  left: '50%', transform: 'translateX(-50%)',
                  width: '28px', height: '28px',
                  background: '#0a1628',
                  border: `2px solid ${item.b}`,
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white', fontSize: '12px', fontWeight: 900
                }}>
                  {item.n}
                </div>
                <div style={{ fontSize: '34px', marginBottom: '10px', marginTop: '8px' }}>
                  {item.e}
                </div>
                <div style={{ fontWeight: 900, fontSize: '14px', textTransform: 'uppercase', marginBottom: '6px' }}>
                  {item.title}
                </div>
                <div style={{ color: '#9ca3af', fontSize: '13px' }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SIGNALS PREVIEW */}
      <section style={{
        background: '#0f1f33', padding: '64px 16px'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            display: 'flex', flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '16px', marginBottom: '32px'
          }}>
            <div>
              <h2 style={{
                fontSize: 'clamp(22px,4vw,32px)',
                fontWeight: 900, textTransform: 'uppercase',
                letterSpacing: '-0.5px', marginBottom: '6px'
              }}>
                {t.todaySignals}
              </h2>
              <p style={{ color: '#9ca3af', fontSize: '14px' }}>
                {t.todaySub}
              </p>
            </div>
            <Link href="/register" style={{
              display: 'inline-flex', alignItems: 'center',
              gap: '7px', background: '#22c55e', color: 'black',
              fontWeight: 900, padding: '11px 20px',
              borderRadius: '10px', fontSize: '13px',
              textDecoration: 'none'
            }}>
              {t.unlockAll}
              <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{
            display: 'flex', flexDirection: 'column', gap: '12px'
          }}>
            {[
              { league: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', time: '15:00' },
              { league: 'La Liga', flag: '🇪🇸', time: '18:00' },
              { league: 'Bundesliga', flag: '🇩🇪', time: '19:30' },
              { league: 'Serie A', flag: '🇮🇹', time: '20:45' },
            ].map((item, i) => (
              <div key={i} style={{
                background: '#0a1628',
                border: '1px solid #1a2740',
                borderRadius: '14px', overflow: 'hidden'
              }}>
                <div style={{
                  background: '#060f1e', padding: '10px 16px',
                  display: 'flex', justifyContent: 'space-between',
                  borderBottom: '1px solid #1a2740'
                }}>
                  <span style={{
                    color: '#4ade80', fontSize: '12px', fontWeight: 700
                  }}>
                    {item.flag} {item.league}
                  </span>
                  <span style={{
                    color: '#6b7280', fontSize: '12px',
                    fontFamily: 'monospace'
                  }}>
                    {item.time}
                  </span>
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '8px',
                    marginBottom: '12px'
                  }}>
                    <Lock size={13} color="#374151" />
                    <span style={{
                      color: '#374151', fontSize: '13px',
                      fontWeight: 700
                    }}>
                      {t.loginUnlock}
                    </span>
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '8px', marginBottom: '10px'
                  }}>
                    {['1', 'X', '2'].map(label => (
                      <div key={label} style={{
                        background: '#0f1f33',
                        border: '1px solid #1a2740',
                        borderRadius: '10px', padding: '8px',
                        textAlign: 'center'
                      }}>
                        <p style={{
                          color: '#374151', fontSize: '10px',
                          marginBottom: '5px'
                        }}>
                          {label}
                        </p>
                        <div style={{
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center', gap: '3px'
                        }}>
                          <Lock size={9} color="#374151" />
                          <span style={{
                            color: '#374151', fontFamily: 'monospace',
                            fontWeight: 900, fontSize: '13px'
                          }}>
                            ?.??
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link href="/register" style={{
                    display: 'block', textAlign: 'center',
                    background: 'rgba(34,197,94,0.08)',
                    border: '1px solid rgba(34,197,94,0.25)',
                    color: '#22c55e', padding: '11px',
                    borderRadius: '10px', fontSize: '12px',
                    fontWeight: 700, textDecoration: 'none',
                    textTransform: 'uppercase'
                  }}>
                    🔓 {t.unlockAll}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section style={{ padding: '64px 16px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{
              fontSize: 'clamp(22px,4vw,32px)',
              fontWeight: 900, textTransform: 'uppercase',
              letterSpacing: '-0.5px', marginBottom: '10px'
            }}>
              {t.whyUs}
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>
              {t.whyUsub}
            </p>
          </div>
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '14px'
          }}>
            {[
              { icon: Shield, color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.2)', title: t.verifiedTitle, desc: t.verifiedDesc },
              { icon: Star, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)', title: t.winRateTitle, desc: t.winRateDesc },
              { icon: Users, color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)', title: t.supportTitle, desc: t.supportDesc },
            ].map(({ icon: Icon, color, bg, border, title, desc }) => (
              <div key={title} style={{
                background: bg, border: `1px solid ${border}`,
                borderRadius: '16px', padding: '20px',
                display: 'flex', alignItems: 'flex-start', gap: '16px'
              }}>
                <div style={{
                  background: bg, border: `1px solid ${border}`,
                  borderRadius: '12px', padding: '12px', flexShrink: 0
                }}>
                  <Icon size={22} color={color} />
                </div>
                <div>
                  <div style={{
                    fontWeight: 900, fontSize: '15px',
                    textTransform: 'uppercase', marginBottom: '6px'
                  }}>
                    {title}
                  </div>
                  <div style={{
                    color: '#9ca3af', fontSize: '14px', lineHeight: 1.6
                  }}>
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PAYMENT METHODS */}
      <section style={{
        background: '#0f1f33',
        borderTop: '1px solid #1a2740',
        borderBottom: '1px solid #1a2740',
        padding: '40px 16px'
      }}>
        <div style={{
          maxWidth: '900px', margin: '0 auto', textAlign: 'center'
        }}>
          <p style={{
            color: '#6b7280', fontSize: '11px',
            textTransform: 'uppercase', letterSpacing: '0.1em',
            fontWeight: 700, marginBottom: '20px'
          }}>
            {t.payments}
          </p>
          <div style={{
            display: 'flex', flexWrap: 'wrap',
            justifyContent: 'center', gap: '10px'
          }}>
            {[
              '📱 M-Pesa', '💳 Visa', '💳 Mastercard',
              '🏦 Bank Transfer', '📲 Mobile Money',
              '💰 USSD', '🌐 International Cards'
            ].map(m => (
              <span key={m} style={{
                background: '#0a1628', border: '1px solid #1a2740',
                color: '#d1d5db', fontSize: '13px',
                padding: '9px 16px', borderRadius: '10px'
              }}>
                {m}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 16px' }}>
        <div style={{
          maxWidth: '600px', margin: '0 auto', textAlign: 'center'
        }}>
          <div style={{
            width: '64px', height: '64px',
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: '18px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 24px'
          }}>
            <Trophy size={30} color="#22c55e" />
          </div>
          <h2 style={{
            fontSize: 'clamp(26px,5vw,42px)',
            fontWeight: 900, letterSpacing: '-1px',
            textTransform: 'uppercase', marginBottom: '16px'
          }}>
            {t.joinWinners}
          </h2>
          <p style={{
            color: '#9ca3af', fontSize: '16px',
            lineHeight: 1.7, marginBottom: '32px'
          }}>
            {t.joinDesc}
          </p>
          <Link href="/register" style={{
            display: 'inline-flex', alignItems: 'center',
            gap: '10px', background: '#22c55e', color: 'black',
            padding: '16px 40px', borderRadius: '14px',
            fontWeight: 900, fontSize: '17px',
            textDecoration: 'none',
            boxShadow: '0 10px 30px rgba(34,197,94,0.3)'
          }}>
            {t.getStarted}
            <ArrowRight size={20} />
          </Link>
          <p style={{
            color: '#374151', fontSize: '12px', marginTop: '16px'
          }}>
            {t.noSub}
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        background: '#060f1e',
        borderTop: '1px solid #1a2740',
        padding: '48px 16px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2,1fr)',
            gap: '32px', marginBottom: '40px'
          }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <Link href="/" style={{
                display: 'inline-flex', alignItems: 'center',
                gap: '10px', textDecoration: 'none',
                marginBottom: '12px'
              }}>
                <div style={{
                  width: '32px', height: '32px',
                  background: '#22c55e', borderRadius: '8px',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Trophy size={14} color="black" />
                </div>
                <span style={{
                  fontWeight: 900, fontSize: '18px', color: 'white'
                }}>
                  GLOBAL<span style={{ color: '#22c55e' }}>HUB</span>
                </span>
              </Link>
              <p style={{
                color: '#6b7280', fontSize: '13px',
                lineHeight: 1.6, maxWidth: '300px'
              }}>
                Professional sports signals for winners worldwide.
                Available in 100+ countries.
              </p>
            </div>

            {[
              {
                title: 'Signals',
                links: [
                  { l: `⚽ ${t.footballBtn}`, h: '/football' },
                  { l: '✈️ Aviator', h: '/aviator' },
                  { l: `💰 ${t.pricing}`, h: '/pricing' },
                ]
              },
              {
                title: 'Account',
                links: [
                  { l: t.login, h: '/login' },
                  { l: t.joinNow, h: '/register' },
                  { l: 'My Account', h: '/account' },
                ]
              },
            ].map(section => (
              <div key={section.title}>
                <p style={{
                  fontWeight: 700, fontSize: '11px',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  color: '#6b7280', marginBottom: '16px'
                }}>
                  {section.title}
                </p>
                {section.links.map(link => (
                  <Link key={link.l} href={link.h} style={{
                    display: 'block', color: '#6b7280',
                    fontSize: '14px', textDecoration: 'none',
                    marginBottom: '10px'
                  }}>
                    {link.l}
                  </Link>
                ))}
              </div>
            ))}
          </div>

          <div style={{
            borderTop: '1px solid #1a2740', paddingTop: '24px',
            display: 'flex', flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center', gap: '16px'
          }}>
            <p style={{ color: '#374151', fontSize: '12px' }}>
              © 2026 GlobalHub. All rights reserved. Worldwide.
            </p>
            <div style={{ display: 'flex', gap: '20px' }}>
              {[
                { l: t.terms, h: '/terms' },
                { l: t.privacy, h: '/privacy' },
                { l: t.responsible, h: '/responsible-gaming' },
                { l: 'FAQ', h: '/faq' },
                { l: 'support', h: '/support' },
              ].map(item => (
                <Link key={item.l} href={item.h} style={{
                  color: '#374151', fontSize: '12px',
                  textDecoration: 'none'
                }}>
                  {item.l}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}