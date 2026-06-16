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
    members: 'Membres Activos',
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
    responsible: 'Jogo Responsable',
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
    winRateDesc: 'Bewährte Erfolgsbilanz mit über 10.000 zufriedenstellenden Mitgliedern in 100+ Ländern.',
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
              position: 'absolute', right: isRTL ? 'auto' : 0, left: isRTL ? 0 : 'auto',
              top: '100%', marginTop: '6px',
              background: '#0f1f33', border: '1px solid #243b55',
              borderRadius: '8px', overflow: 'hidden', zIndex: 50,
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)',
              display: 'grid', gridTemplateColumns: 'repeat(2, 120px)'
            }}>
              {Object.entries(translations).map(([key, value]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => { setLang(key as LangKey); setShowLang(false); }}
                  style={{
                    padding: '8px 12px', textAlign: 'left',
                    background: lang === key ? '#1a2740' : 'transparent',
                    border: 'none', color: 'white', fontSize: '12px',
                    cursor: 'pointer', display: 'flex', gap: '6px'
                  }}
                >
                  <span>{value.flag}</span>
                  <span>{value.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER SECTION */}
      <footer style={{
        background: '#060f1e',
        borderTop: '1px solid #1a2740',
        padding: '40px 16px',
        textAlign: 'center'
      }}>
        <div style={{ maxWWidth: '1200px', margin: '0 auto' }}>
          <div style={{ fontWeight: 900, fontSize: '20px', marginBottom: '8px' }}>
            Global<span style={{ color: '#22c55e' }}>Hub</span>
          </div>
          <p style={{ color: '#6b7280', fontSize: '13px', maxWWidth: '500px', margin: '0 auto 24px' }}>
            {t.desc}
          </p>
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '20px',
            marginBottom: '32px', flexWrap: 'wrap'
          }}>
            {[
              { l: t.terms, h: '/terms' },
              { l: t.privacy, h: '/privacy' },
              { l: t.responsible, h: '/responsible-gaming' },
              { l: 'Become a Provider', h: '/become-provider' }
            ].map((link, idx) => (
              <Link
                key={idx}
                href={link.h}
                style={{
                  color: '#9ca3af', fontSize: '13px',
                  textDecoration: 'none', transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = 'white'}
                onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'}
              >
                {link.l}
              </Link>
            ))}
          </div>
          <div style={{ color: '#4b5563', fontSize: '11px' }}>
            © {new Date().getFullYear()} GlobalHub. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}