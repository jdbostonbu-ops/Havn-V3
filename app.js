import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

(() => {
  'use strict';

  const STORAGE_KEY = 'havn:realtime-map:v4';
  const LANG_KEY = 'havn:lang:v1';
  const NOTIF_KEY = 'havn:notif-prefs:v1';

  // ---------- i18n ----------
  // RTL languages
  const RTL_LANGS = new Set(['ar', 'he', 'fa', 'ur', 'ps']);

  // English source-of-truth strings. Every translatable string in the app
  // is keyed here. Non-English language packs override individual keys;
  // anything missing falls back to English automatically.
  const TRANSLATIONS = {
    en: {
      'brand.tagline': 'Help nearby.',
      'chip.all': 'All',
      'chip.food': 'Food',
      'chip.shelter': 'Shelter',
      'chip.healthcare': 'Healthcare',
      'chip.transit': 'Transit',
      'chip.clothing': 'Clothing',
      'chip.showers': 'Showers',
      'chip.warming': 'Warming',
      'chip.cooling': 'Cooling',
      'search.label': 'Search by ZIP code',
      'search.placeholder': 'Search by ZIP code…',
      'search.go': 'Go',
      'alert.defaultTitle': 'Cold Weather Alert',
      'alert.defaultBody': 'Warming centers open nearby. Tap for alerts →',
      'map.heading': 'Live Resource Map',
      'nearby.heading': 'Near you',
      'nearby.viewAll': 'View all',
      'nav.map': 'Map',
      'nav.alerts': 'Alerts',
      'nav.saved': 'Saved',
      'nav.profile': 'Profile',
      'alerts.title': 'Alerts',
      'alerts.sub': 'Emergency, weather, and resource updates',
      'saved.title': 'Saved',
      'saved.sub': 'Your bookmarked places',
      'saved.empty': 'No saved resources yet. Tap the bookmark on any resource to save it for later.',
      'profile.welcome': 'Welcome,',
      'profile.verified': 'Verified user',
      'profile.myPosts': 'My Posts',
      'profile.savedPlaces': 'Saved Places',
      'profile.notifications': 'Notification Settings',
      'profile.emergency': 'Emergency Mode',
      'profile.language': 'Language',
      'profile.help': 'Help & Support',
      'profile.about': 'About HAVN',
      'profile.logout': 'Log Out',
      'modal.myPosts.title': 'My Posts',
      'modal.myPosts.empty': 'You haven\u2019t posted any resources yet. Tap the green + button on the map to share a resource you know about.',
      'modal.notifications.title': 'Notification Settings',
      'modal.notifications.desc': 'Choose which alerts you want to receive. Settings are saved on this device.',
      'modal.notifications.weather': 'Weather alerts',
      'modal.notifications.weatherDesc': 'Cold, heat, and severe weather warnings',
      'modal.notifications.resources': 'New resources nearby',
      'modal.notifications.resourcesDesc': 'When new shelters, meals, or services open',
      'modal.notifications.emergency': 'Emergency alerts',
      'modal.notifications.emergencyDesc': 'Critical safety alerts in your area',
      'modal.help.title': 'Help & Support',
      'modal.help.gettingStarted': 'Getting started',
      'modal.help.usingMap': 'Search a ZIP code, tap a chip to filter, and tap any pin or card to see details and directions.',
      'modal.help.posting': 'Posting resources',
      'modal.help.postingBody': 'If you know about a shelter, free meal, or warming center, tap the green + on the map to add it. New posts go live for everyone in seconds.',
      'modal.help.contact': 'Contact',
      'modal.help.contactBody': 'For urgent help, please call 211 (US). For app questions, email support@havn.example.',
      'modal.about.title': 'About HAVN',
      'modal.about.mission': 'Our mission',
      'modal.about.missionBody': 'HAVN is a community coordination platform that helps people quickly find food, shelter, healthcare, transit, clothing, warming, cooling, and hygiene services nearby \u2014 in real time.',
      'modal.about.how': 'How it works',
      'modal.about.howBody': 'Anyone can post a verified resource. Trusted providers and community members keep the map current, and weather and emergency alerts surface the most urgent needs.',
      'modal.about.privacy': 'Privacy',
      'modal.about.privacyBody': 'HAVN does not require an account to browse. Posts and saved places live on your device unless you choose to sync.',
      'modal.about.version': 'Version 3.0 \u2014 prototype build.'
    },
    es: {
      'brand.tagline': 'Ayuda cerca.',
      'chip.all': 'Todos', 'chip.food': 'Comida', 'chip.shelter': 'Refugio',
      'chip.healthcare': 'Salud', 'chip.transit': 'Transporte', 'chip.clothing': 'Ropa',
      'chip.showers': 'Duchas', 'chip.warming': 'Calefacción', 'chip.cooling': 'Climatización',
      'search.label': 'Buscar por código postal',
      'search.placeholder': 'Buscar por código postal…',
      'search.go': 'Ir',
      'alert.defaultTitle': 'Alerta de frío extremo',
      'alert.defaultBody': 'Centros de calefacción abiertos cerca. Toque para ver alertas →',
      'map.heading': 'Mapa de recursos en vivo',
      'nearby.heading': 'Cerca de ti', 'nearby.viewAll': 'Ver todo',
      'nav.map': 'Mapa', 'nav.alerts': 'Alertas', 'nav.saved': 'Guardado', 'nav.profile': 'Perfil',
      'alerts.title': 'Alertas', 'alerts.sub': 'Actualizaciones de emergencia, clima y recursos',
      'saved.title': 'Guardado', 'saved.sub': 'Tus lugares marcados',
      'saved.empty': 'Aún no tienes recursos guardados. Toca el marcador en cualquier recurso para guardarlo.',
      'profile.welcome': 'Bienvenido,', 'profile.verified': 'Usuario verificado',
      'profile.myPosts': 'Mis publicaciones', 'profile.savedPlaces': 'Lugares guardados',
      'profile.notifications': 'Notificaciones', 'profile.emergency': 'Modo de emergencia',
      'profile.language': 'Idioma', 'profile.help': 'Ayuda y soporte',
      'profile.about': 'Acerca de HAVN', 'profile.logout': 'Cerrar sesión',
      'modal.myPosts.title': 'Mis publicaciones',
      'modal.myPosts.empty': 'Aún no has publicado ningún recurso. Toca el botón verde + en el mapa para compartir un recurso que conozcas.',
      'modal.notifications.title': 'Configuración de notificaciones',
      'modal.notifications.desc': 'Elige qué alertas quieres recibir. La configuración se guarda en este dispositivo.',
      'modal.notifications.weather': 'Alertas meteorológicas',
      'modal.notifications.weatherDesc': 'Frío, calor y advertencias de clima severo',
      'modal.notifications.resources': 'Nuevos recursos cercanos',
      'modal.notifications.resourcesDesc': 'Cuando abren nuevos refugios, comidas o servicios',
      'modal.notifications.emergency': 'Alertas de emergencia',
      'modal.notifications.emergencyDesc': 'Alertas críticas de seguridad en tu área',
      'modal.help.title': 'Ayuda y soporte',
      'modal.help.gettingStarted': 'Primeros pasos',
      'modal.help.usingMap': 'Busca un código postal, toca una categoría para filtrar, y toca cualquier marcador para ver detalles y direcciones.',
      'modal.help.posting': 'Publicar recursos',
      'modal.help.postingBody': 'Si conoces un refugio, comida gratis o centro de calefacción, toca el + verde en el mapa para agregarlo.',
      'modal.help.contact': 'Contacto',
      'modal.help.contactBody': 'Para ayuda urgente, llama al 211 (EE.UU.). Para preguntas sobre la app, escribe a support@havn.example.',
      'modal.about.title': 'Acerca de HAVN',
      'modal.about.mission': 'Nuestra misión',
      'modal.about.missionBody': 'HAVN es una plataforma de coordinación comunitaria que ayuda a las personas a encontrar rápidamente recursos cercanos en tiempo real.',
      'modal.about.how': 'Cómo funciona',
      'modal.about.howBody': 'Cualquiera puede publicar un recurso verificado. Proveedores de confianza y miembros de la comunidad mantienen el mapa actualizado.',
      'modal.about.privacy': 'Privacidad',
      'modal.about.privacyBody': 'HAVN no requiere una cuenta para navegar. Las publicaciones se guardan en tu dispositivo.',
      'modal.about.version': 'Versión 3.0 — prototipo.'
    },
    fr: {
      'brand.tagline': 'Aide à proximité.',
      'chip.all': 'Tous', 'chip.food': 'Nourriture', 'chip.shelter': 'Abri',
      'chip.healthcare': 'Santé', 'chip.transit': 'Transport', 'chip.clothing': 'Vêtements',
      'chip.showers': 'Douches', 'chip.warming': 'Chauffage', 'chip.cooling': 'Climatisation',
      'search.label': 'Rechercher par code postal',
      'search.placeholder': 'Rechercher par code postal…',
      'search.go': 'OK',
      'alert.defaultTitle': 'Alerte de grand froid',
      'alert.defaultBody': 'Centres de chauffage ouverts à proximité. Touchez pour voir les alertes →',
      'map.heading': 'Carte des ressources en direct',
      'nearby.heading': 'Près de vous', 'nearby.viewAll': 'Voir tout',
      'nav.map': 'Carte', 'nav.alerts': 'Alertes', 'nav.saved': 'Enregistrés', 'nav.profile': 'Profil',
      'profile.welcome': 'Bienvenue,', 'profile.verified': 'Utilisateur vérifié',
      'profile.myPosts': 'Mes publications', 'profile.savedPlaces': 'Lieux enregistrés',
      'profile.notifications': 'Notifications', 'profile.emergency': 'Mode urgence',
      'profile.language': 'Langue', 'profile.help': 'Aide et support',
      'profile.about': 'À propos de HAVN', 'profile.logout': 'Déconnexion'
    },
    de: {
      'brand.tagline': 'Hilfe in der Nähe.',
      'chip.all': 'Alle', 'chip.food': 'Essen', 'chip.shelter': 'Unterkunft',
      'chip.healthcare': 'Gesundheit', 'chip.transit': 'Verkehr', 'chip.clothing': 'Kleidung',
      'chip.showers': 'Duschen', 'chip.warming': 'Wärmestube', 'chip.cooling': 'Kühlung',
      'search.placeholder': 'Suche nach PLZ…', 'search.go': 'Los',
      'map.heading': 'Live-Ressourcenkarte',
      'nearby.heading': 'In deiner Nähe', 'nearby.viewAll': 'Alle anzeigen',
      'nav.map': 'Karte', 'nav.alerts': 'Warnungen', 'nav.saved': 'Gespeichert', 'nav.profile': 'Profil',
      'profile.welcome': 'Willkommen,', 'profile.verified': 'Verifizierter Benutzer',
      'profile.myPosts': 'Meine Beiträge', 'profile.savedPlaces': 'Gespeicherte Orte',
      'profile.notifications': 'Benachrichtigungen', 'profile.emergency': 'Notfallmodus',
      'profile.language': 'Sprache', 'profile.help': 'Hilfe & Support',
      'profile.about': 'Über HAVN', 'profile.logout': 'Abmelden'
    },
    pt: {
      'brand.tagline': 'Ajuda por perto.',
      'chip.all': 'Todos', 'chip.food': 'Comida', 'chip.shelter': 'Abrigo',
      'chip.healthcare': 'Saúde', 'chip.transit': 'Transporte', 'chip.clothing': 'Roupas',
      'chip.showers': 'Banhos', 'chip.warming': 'Aquecimento', 'chip.cooling': 'Climatização',
      'search.placeholder': 'Buscar por CEP…', 'search.go': 'Ir',
      'map.heading': 'Mapa de recursos ao vivo',
      'nearby.heading': 'Perto de você', 'nearby.viewAll': 'Ver tudo',
      'nav.map': 'Mapa', 'nav.alerts': 'Alertas', 'nav.saved': 'Salvos', 'nav.profile': 'Perfil',
      'profile.welcome': 'Bem-vindo,', 'profile.verified': 'Usuário verificado',
      'profile.myPosts': 'Minhas publicações', 'profile.savedPlaces': 'Lugares salvos',
      'profile.notifications': 'Notificações', 'profile.emergency': 'Modo de emergência',
      'profile.language': 'Idioma', 'profile.help': 'Ajuda e suporte',
      'profile.about': 'Sobre o HAVN', 'profile.logout': 'Sair'
    },
    zh: {
      'brand.tagline': '附近的帮助。',
      'chip.all': '全部', 'chip.food': '食物', 'chip.shelter': '住所',
      'chip.healthcare': '医疗', 'chip.transit': '交通', 'chip.clothing': '衣物',
      'chip.showers': '淋浴', 'chip.warming': '取暖', 'chip.cooling': '降温',
      'search.placeholder': '按邮编搜索…', 'search.go': '搜索',
      'map.heading': '实时资源地图',
      'nearby.heading': '附近', 'nearby.viewAll': '查看全部',
      'nav.map': '地图', 'nav.alerts': '警报', 'nav.saved': '已保存', 'nav.profile': '我的',
      'profile.welcome': '欢迎,', 'profile.verified': '已验证用户',
      'profile.myPosts': '我的发布', 'profile.savedPlaces': '已保存地点',
      'profile.notifications': '通知设置', 'profile.emergency': '紧急模式',
      'profile.language': '语言', 'profile.help': '帮助与支持',
      'profile.about': '关于 HAVN', 'profile.logout': '退出登录'
    },
    ja: {
      'brand.tagline': '近くの助け。',
      'chip.all': 'すべて', 'chip.food': '食事', 'chip.shelter': '宿泊',
      'chip.healthcare': '医療', 'chip.transit': '交通', 'chip.clothing': '衣類',
      'chip.showers': 'シャワー', 'chip.warming': '暖房', 'chip.cooling': '冷房',
      'search.placeholder': '郵便番号で検索…', 'search.go': '検索',
      'map.heading': 'ライブリソースマップ',
      'nearby.heading': '近くの場所', 'nearby.viewAll': 'すべて表示',
      'nav.map': 'マップ', 'nav.alerts': 'アラート', 'nav.saved': '保存済み', 'nav.profile': 'プロフィール',
      'profile.welcome': 'ようこそ、', 'profile.verified': '認証済みユーザー',
      'profile.myPosts': '自分の投稿', 'profile.savedPlaces': '保存した場所',
      'profile.notifications': '通知設定', 'profile.emergency': '緊急モード',
      'profile.language': '言語', 'profile.help': 'ヘルプとサポート',
      'profile.about': 'HAVN について', 'profile.logout': 'ログアウト'
    },
    ko: {
      'brand.tagline': '가까운 도움.',
      'chip.all': '전체', 'chip.food': '음식', 'chip.shelter': '쉼터',
      'chip.healthcare': '의료', 'chip.transit': '교통', 'chip.clothing': '의류',
      'chip.showers': '샤워', 'chip.warming': '난방', 'chip.cooling': '냉방',
      'search.placeholder': '우편번호로 검색…', 'search.go': '검색',
      'map.heading': '실시간 자원 지도',
      'nearby.heading': '내 주변', 'nearby.viewAll': '모두 보기',
      'nav.map': '지도', 'nav.alerts': '알림', 'nav.saved': '저장됨', 'nav.profile': '프로필',
      'profile.welcome': '환영합니다,', 'profile.verified': '인증된 사용자',
      'profile.myPosts': '내 게시물', 'profile.savedPlaces': '저장된 장소',
      'profile.notifications': '알림 설정', 'profile.emergency': '비상 모드',
      'profile.language': '언어', 'profile.help': '도움말 및 지원',
      'profile.about': 'HAVN 소개', 'profile.logout': '로그아웃'
    },
    ar: {
      'brand.tagline': 'مساعدة قريبة.',
      'chip.all': 'الكل', 'chip.food': 'طعام', 'chip.shelter': 'مأوى',
      'chip.healthcare': 'رعاية صحية', 'chip.transit': 'نقل', 'chip.clothing': 'ملابس',
      'chip.showers': 'استحمام', 'chip.warming': 'تدفئة', 'chip.cooling': 'تبريد',
      'search.placeholder': 'البحث بالرمز البريدي…', 'search.go': 'بحث',
      'map.heading': 'خريطة الموارد المباشرة',
      'nearby.heading': 'بالقرب منك', 'nearby.viewAll': 'عرض الكل',
      'nav.map': 'خريطة', 'nav.alerts': 'تنبيهات', 'nav.saved': 'محفوظ', 'nav.profile': 'الملف',
      'profile.welcome': 'مرحباً،', 'profile.verified': 'مستخدم موثّق',
      'profile.myPosts': 'منشوراتي', 'profile.savedPlaces': 'الأماكن المحفوظة',
      'profile.notifications': 'إعدادات الإشعارات', 'profile.emergency': 'وضع الطوارئ',
      'profile.language': 'اللغة', 'profile.help': 'المساعدة والدعم',
      'profile.about': 'حول HAVN', 'profile.logout': 'تسجيل الخروج'
    },
    ru: {
      'brand.tagline': 'Помощь рядом.',
      'chip.all': 'Все', 'chip.food': 'Еда', 'chip.shelter': 'Приют',
      'chip.healthcare': 'Медицина', 'chip.transit': 'Транспорт', 'chip.clothing': 'Одежда',
      'chip.showers': 'Душ', 'chip.warming': 'Обогрев', 'chip.cooling': 'Охлаждение',
      'search.placeholder': 'Поиск по индексу…', 'search.go': 'Найти',
      'map.heading': 'Карта ресурсов в реальном времени',
      'nearby.heading': 'Рядом с вами', 'nearby.viewAll': 'Показать все',
      'nav.map': 'Карта', 'nav.alerts': 'Оповещения', 'nav.saved': 'Сохранено', 'nav.profile': 'Профиль',
      'profile.welcome': 'Добро пожаловать,', 'profile.verified': 'Проверенный пользователь',
      'profile.myPosts': 'Мои публикации', 'profile.savedPlaces': 'Сохранённые места',
      'profile.notifications': 'Настройки уведомлений', 'profile.emergency': 'Режим ЧС',
      'profile.language': 'Язык', 'profile.help': 'Помощь и поддержка',
      'profile.about': 'О HAVN', 'profile.logout': 'Выйти'
    },
    vi: {
      'brand.tagline': 'Trợ giúp gần đây.',
      'chip.all': 'Tất cả', 'chip.food': 'Thực phẩm', 'chip.shelter': 'Nơi trú ẩn',
      'chip.healthcare': 'Y tế', 'chip.transit': 'Giao thông', 'chip.clothing': 'Quần áo',
      'chip.showers': 'Tắm', 'chip.warming': 'Sưởi ấm', 'chip.cooling': 'Làm mát',
      'search.placeholder': 'Tìm theo mã ZIP…', 'search.go': 'Tìm',
      'map.heading': 'Bản đồ tài nguyên trực tiếp',
      'nearby.heading': 'Gần bạn', 'nearby.viewAll': 'Xem tất cả',
      'nav.map': 'Bản đồ', 'nav.alerts': 'Cảnh báo', 'nav.saved': 'Đã lưu', 'nav.profile': 'Hồ sơ',
      'profile.welcome': 'Chào mừng,', 'profile.verified': 'Người dùng đã xác minh',
      'profile.myPosts': 'Bài đăng của tôi', 'profile.savedPlaces': 'Địa điểm đã lưu',
      'profile.notifications': 'Cài đặt thông báo', 'profile.emergency': 'Chế độ khẩn cấp',
      'profile.language': 'Ngôn ngữ', 'profile.help': 'Trợ giúp và hỗ trợ',
      'profile.about': 'Giới thiệu HAVN', 'profile.logout': 'Đăng xuất'
    },
    fil: {
      'brand.tagline': 'Tulong na malapit.',
      'chip.all': 'Lahat', 'chip.food': 'Pagkain', 'chip.shelter': 'Silungan',
      'chip.healthcare': 'Pangkalusugan', 'chip.transit': 'Transportasyon', 'chip.clothing': 'Damit',
      'chip.showers': 'Paliligo', 'chip.warming': 'Pampainit', 'chip.cooling': 'Pampalamig',
      'search.placeholder': 'Hanapin sa ZIP code…', 'search.go': 'Hanap',
      'nearby.heading': 'Malapit sa iyo', 'nearby.viewAll': 'Tingnan lahat',
      'nav.map': 'Mapa', 'nav.alerts': 'Mga alerto', 'nav.saved': 'Naka-save', 'nav.profile': 'Profile',
      'profile.welcome': 'Maligayang pagdating,', 'profile.verified': 'Beripikadong user',
      'profile.myPosts': 'Aking mga post', 'profile.savedPlaces': 'Mga naka-save na lugar',
      'profile.notifications': 'Mga setting ng notipikasyon', 'profile.emergency': 'Emergency mode',
      'profile.language': 'Wika', 'profile.help': 'Tulong at suporta',
      'profile.about': 'Tungkol sa HAVN', 'profile.logout': 'Mag-log out'
    },
    ht: {
      'brand.tagline': 'Èd ki tou pre.',
      'chip.all': 'Tout', 'chip.food': 'Manje', 'chip.shelter': 'Abri',
      'chip.healthcare': 'Swen sante', 'chip.transit': 'Transpò', 'chip.clothing': 'Rad',
      'chip.showers': 'Douch', 'chip.warming': 'Chofaj', 'chip.cooling': 'Klimatize',
      'search.placeholder': 'Chèche pa kòd ZIP…', 'search.go': 'Ale',
      'nearby.heading': 'Tou pre w', 'nearby.viewAll': 'Wè tout',
      'nav.map': 'Kat', 'nav.alerts': 'Alèt', 'nav.saved': 'Sove', 'nav.profile': 'Pwofil',
      'profile.welcome': 'Byenveni,', 'profile.verified': 'Itilizatè verifye',
      'profile.myPosts': 'Pòs mwen yo', 'profile.savedPlaces': 'Plas ki sove yo',
      'profile.notifications': 'Paramèt notifikasyon', 'profile.emergency': 'Mòd ijans',
      'profile.language': 'Lang', 'profile.help': 'Èd ak sipò',
      'profile.about': 'Konsènan HAVN', 'profile.logout': 'Dekonekte'
    }
  };

  const t = (key) => {
    const lang = (typeof window !== 'undefined' && window.__havnLang) || 'en';
    const pack = TRANSLATIONS[lang] || {};
    if (pack[key]) return pack[key];
    return TRANSLATIONS.en[key] || key;
  };

  const applyTranslations = () => {
    document.querySelectorAll('[data-i18n]').forEach((node) => {
      const key = node.getAttribute('data-i18n');
      const attr = node.getAttribute('data-i18n-attr');
      const value = t(key);
      if (attr) {
        node.setAttribute(attr, value);
      } else {
        node.textContent = value;
      }
    });
  };

  const setLanguage = (lang) => {
    window.__havnLang = lang;
    try { localStorage.setItem(LANG_KEY, lang); } catch (_) { /* ignore */ }
    const dir = RTL_LANGS.has(lang) ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', dir);
    applyTranslations();
  };

  // Load saved language before anything else renders
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved) window.__havnLang = saved;
  } catch (_) { /* ignore */ }


  const firebaseConfig = {
    apiKey: 'PASTE_FIREBASE_API_KEY',
    authDomain: 'PASTE_FIREBASE_AUTH_DOMAIN',
    projectId: 'PASTE_FIREBASE_PROJECT_ID',
    storageBucket: 'PASTE_FIREBASE_STORAGE_BUCKET',
    messagingSenderId: 'PASTE_FIREBASE_MESSAGING_SENDER_ID',
    appId: 'PASTE_FIREBASE_APP_ID'
  };

  const categoryEmoji = {
    Food: '🍲', Shelter: '🛏', Healthcare: '➕', Transit: '🚌',
    Clothing: '🧥', Warming: '🔥', Cooling: '❄️', Showers: '🚿'
  };
  const categoryClass = {
    Food: 'marker-food', Shelter: 'marker-shelter', Healthcare: 'marker-healthcare',
    Transit: 'marker-transit', Clothing: 'marker-clothing', Warming: 'marker-warming',
    Cooling: 'marker-cooling', Showers: 'marker-showers'
  };

  // ZIP fallback covers the cities documented in README:
  // - User-requested anchor cities (NYC, LA, Las Vegas)
  // - States the user called out (FL, MD, HI, DC)
  // - Top-10 per-capita worst states (per HUD 2024 AHAR)
  // - Plus the original CT/NE corridor for backwards compatibility
  const zipFallback = {
    // — Original CT / Northeast corridor —
    '06510': { label: 'New Haven, CT',     lat: 41.3083, lng: -72.9279 },
    '06103': { label: 'Hartford, CT',      lat: 41.7658, lng: -72.6734 },
    '02108': { label: 'Boston, MA',        lat: 42.3588, lng: -71.0707 },
    '19103': { label: 'Philadelphia, PA',  lat: 39.9527, lng: -75.1740 },

    // — User-requested anchor cities —
    '10001': { label: 'New York, NY',      lat: 40.7506, lng: -73.9972 },
    '90001': { label: 'Los Angeles, CA',   lat: 34.0224, lng: -118.2851 },
    '89101': { label: 'Las Vegas, NV',     lat: 36.1716, lng: -115.1391 },

    // — User-called-out high-rate states —
    '33101': { label: 'Miami, FL',         lat: 25.7751, lng: -80.1947 },
    '21201': { label: 'Baltimore, MD',     lat: 39.2904, lng: -76.6122 },
    '96813': { label: 'Honolulu, HI',      lat: 21.3099, lng: -157.8581 },
    '20001': { label: 'Washington, DC',    lat: 38.9101, lng: -77.0147 },

    // — Top-10 per-capita worst states (HUD AHAR 2024) —
    '97201': { label: 'Portland, OR',      lat: 45.5152, lng: -122.6784 },
    '98101': { label: 'Seattle, WA',       lat: 47.6062, lng: -122.3321 },
    '85001': { label: 'Phoenix, AZ',       lat: 33.4484, lng: -112.0740 },
    '80202': { label: 'Denver, CO',        lat: 39.7392, lng: -104.9903 },
    '05401': { label: 'Burlington, VT',    lat: 44.4759, lng: -73.2121 }
  };

  // Resources pre-seeded across the anchor cities. Each city has 1–2 pins
  // demonstrating different categories and statuses so the map looks
  // meaningful when you ZIP-search into any of them.
  const initialResources = [
    // --- New York, NY (10001) ---
    { id: 'res-nyc-1', provider_id: 'prov-nyc-1', category: 'Shelter', city: '10001',
      title: 'Bowery Mission Shelter',
      description: 'Emergency overnight beds for adults. Check-in 5–9 PM.',
      latitude: 40.7224, longitude: -73.9931, status: 'OPEN',
      start_time: '17:00', end_time: '09:00',
      distance: 'Manhattan', transit: 'Subway: 2nd Ave (F)', verified: true },
    { id: 'res-nyc-2', provider_id: 'prov-nyc-2', category: 'Food', city: '10001',
      title: 'Holy Apostles Soup Kitchen',
      description: 'Hot lunch served Mon–Fri. No questions asked.',
      latitude: 40.7466, longitude: -74.0010, status: 'OPEN',
      start_time: '10:30', end_time: '12:30',
      distance: 'Chelsea', transit: 'Subway: 23rd St (1)', verified: true },
    { id: 'res-nyc-3', provider_id: 'prov-nyc-3', category: 'Showers', city: '10001',
      title: 'The Bowery Residents\u2019 Hot Showers',
      description: 'Free hot showers, hygiene kits, and towels. Walk-in.',
      latitude: 40.7256, longitude: -73.9923, status: 'OPEN',
      start_time: '08:00', end_time: '16:00',
      distance: 'Lower East Side', transit: 'Subway: 2nd Ave (F)', verified: true },

    // --- Los Angeles, CA (90001) ---
    { id: 'res-la-1', provider_id: 'prov-la-1', category: 'Shelter', city: '90001',
      title: 'Union Rescue Mission',
      description: 'Skid Row shelter for individuals and families.',
      latitude: 34.0445, longitude: -118.2470, status: 'FULL',
      start_time: '00:00', end_time: '23:59',
      distance: 'Downtown LA', transit: 'Metro: Pershing Sq', verified: true },
    { id: 'res-la-2', provider_id: 'prov-la-2', category: 'Healthcare', city: '90001',
      title: 'JWCH Center for Community Health',
      description: 'Free walk-in clinic. Bring photo ID if available.',
      latitude: 34.0440, longitude: -118.2530, status: 'OPEN',
      start_time: '08:00', end_time: '17:00',
      distance: 'Skid Row', transit: 'Metro: 7th/Metro', verified: true },
    { id: 'res-la-3', provider_id: 'prov-la-3', category: 'Showers', city: '90001',
      title: 'LavaMaeˣ Mobile Shower',
      description: 'Mobile shower trailer. Hygiene kits and clean towels.',
      latitude: 34.0418, longitude: -118.2510, status: 'OPEN',
      start_time: '09:00', end_time: '14:00',
      distance: 'Skid Row', transit: 'Metro: Pershing Sq', verified: true },

    // --- Las Vegas, NV (89101) ---
    { id: 'res-lv-1', provider_id: 'prov-lv-1', category: 'Cooling', city: '89101',
      title: 'Catholic Charities Cooling Station',
      description: 'Daily cooling shelter. Water, AC, restrooms.',
      latitude: 36.1758, longitude: -115.1380, status: 'OPEN',
      start_time: '09:00', end_time: '17:00',
      distance: 'Downtown', transit: 'RTC: Bonneville TC', verified: true },
    { id: 'res-lv-2', provider_id: 'prov-lv-2', category: 'Food', city: '89101',
      title: 'Las Vegas Rescue Mission',
      description: 'Three meals daily, open to anyone in need.',
      latitude: 36.1660, longitude: -115.1465, status: 'OPEN',
      start_time: '07:00', end_time: '19:00',
      distance: 'Owens Ave', transit: 'RTC: Las Vegas Blvd', verified: true },
    { id: 'res-lv-3', provider_id: 'prov-lv-3', category: 'Showers', city: '89101',
      title: 'Courtyard Homeless Resource Showers',
      description: 'Outdoor shower facility with hygiene supplies.',
      latitude: 36.1721, longitude: -115.1410, status: 'OPEN',
      start_time: '07:00', end_time: '18:00',
      distance: 'Downtown', transit: 'RTC: Bonneville TC', verified: true },

    // --- Miami, FL (33101) ---
    { id: 'res-mia-1', provider_id: 'prov-mia-1', category: 'Shelter', city: '33101',
      title: 'Camillus House',
      description: 'Comprehensive shelter and recovery services.',
      latitude: 25.7846, longitude: -80.1980, status: 'OPEN',
      start_time: '00:00', end_time: '23:59',
      distance: 'NW Miami', transit: 'Metrorail: Government Ctr', verified: true },
    { id: 'res-mia-2', provider_id: 'prov-mia-2', category: 'Cooling', city: '33101',
      title: 'Miami-Dade Cooling Center',
      description: 'Activated during heat advisories. AC and water.',
      latitude: 25.7740, longitude: -80.1937, status: 'OPEN',
      start_time: '10:00', end_time: '18:00',
      distance: 'Downtown', transit: 'Metromover: Government Ctr', verified: true },
    { id: 'res-mia-3', provider_id: 'prov-mia-3', category: 'Showers', city: '33101',
      title: 'Chapman Partnership Hygiene Center',
      description: 'Showers, laundry, and personal care available daily.',
      latitude: 25.7820, longitude: -80.1950, status: 'OPEN',
      start_time: '08:00', end_time: '16:00',
      distance: 'NW Miami', transit: 'Metrorail: Government Ctr', verified: true },

    // --- Baltimore, MD (21201) ---
    { id: 'res-balt-1', provider_id: 'prov-balt-1', category: 'Shelter', city: '21201',
      title: 'Helping Up Mission',
      description: 'Long-term shelter and recovery for men and women.',
      latitude: 39.2899, longitude: -76.6019, status: 'LOW SUPPLY',
      start_time: '00:00', end_time: '23:59',
      distance: 'Jonestown', transit: 'MTA: Shot Tower', verified: true },
    { id: 'res-balt-2', provider_id: 'prov-balt-2', category: 'Food', city: '21201',
      title: 'Our Daily Bread Employment Ctr',
      description: 'Free meals Mon–Sat plus job placement support.',
      latitude: 39.2950, longitude: -76.6130, status: 'OPEN',
      start_time: '10:00', end_time: '13:00',
      distance: 'Mount Vernon', transit: 'MTA: Charles Center', verified: true },
    { id: 'res-balt-3', provider_id: 'prov-balt-3', category: 'Showers', city: '21201',
      title: 'Manna House Hygiene Services',
      description: 'Morning showers, coffee, and hygiene kits.',
      latitude: 39.3010, longitude: -76.6100, status: 'OPEN',
      start_time: '07:00', end_time: '11:00',
      distance: 'Greenmount', transit: 'MTA: Penn Station', verified: true },

    // --- Honolulu, HI (96813) — highest per-capita rate nationally ---
    { id: 'res-hon-1', provider_id: 'prov-hon-1', category: 'Shelter', city: '96813',
      title: 'Institute for Human Services',
      description: 'Largest shelter on Oʻahu. Adults and families.',
      latitude: 21.3170, longitude: -157.8650, status: 'OPEN',
      start_time: '16:00', end_time: '08:00',
      distance: 'Iwilei', transit: 'TheBus: Dillingham Blvd', verified: true },
    { id: 'res-hon-2', provider_id: 'prov-hon-2', category: 'Healthcare', city: '96813',
      title: 'Waikīkī Health — Care-A-Van',
      description: 'Mobile clinic. Walk-in, sliding scale.',
      latitude: 21.2960, longitude: -157.8504, status: 'OPEN',
      start_time: '09:00', end_time: '16:00',
      distance: 'Waikīkī', transit: 'TheBus: Kuhio Ave', verified: true },
    { id: 'res-hon-3', provider_id: 'prov-hon-3', category: 'Showers', city: '96813',
      title: 'Punawai Rest Stop Hygiene Ctr',
      description: 'Showers, restrooms, laundry. Daily.',
      latitude: 21.3140, longitude: -157.8620, status: 'OPEN',
      start_time: '07:00', end_time: '15:00',
      distance: 'Iwilei', transit: 'TheBus: Dillingham Blvd', verified: true },

    // --- Washington, DC (20001) ---
    { id: 'res-dc-1', provider_id: 'prov-dc-1', category: 'Shelter', city: '20001',
      title: 'Central Union Mission',
      description: 'Emergency shelter for men. Intake 5 PM nightly.',
      latitude: 38.9085, longitude: -77.0220, status: 'OPEN',
      start_time: '17:00', end_time: '08:00',
      distance: 'Shaw', transit: 'Metro: Mt Vernon Sq', verified: true },
    { id: 'res-dc-2', provider_id: 'prov-dc-2', category: 'Warming', city: '20001',
      title: 'DC Hypothermia Bus Route',
      description: 'Mobile warming during hypothermia alert. Free rides.',
      latitude: 38.9100, longitude: -77.0150, status: 'OPEN',
      start_time: '19:00', end_time: '07:00',
      distance: 'Citywide', transit: 'Pickup on call', verified: true },
    { id: 'res-dc-3', provider_id: 'prov-dc-3', category: 'Showers', city: '20001',
      title: 'Father McKenna Center Showers',
      description: 'Morning showers and hospitality for men.',
      latitude: 38.9070, longitude: -77.0080, status: 'OPEN',
      start_time: '07:30', end_time: '11:30',
      distance: 'NoMa', transit: 'Metro: Union Station', verified: true },

    // --- Seattle, WA (98101) ---
    { id: 'res-sea-1', provider_id: 'prov-sea-1', category: 'Shelter', city: '98101',
      title: 'DESC Main Shelter',
      description: 'Adult shelter and crisis services downtown.',
      latitude: 47.6035, longitude: -122.3284, status: 'OPEN',
      start_time: '00:00', end_time: '23:59',
      distance: 'Downtown', transit: 'Link: Pioneer Sq', verified: true },
    { id: 'res-sea-2', provider_id: 'prov-sea-2', category: 'Showers', city: '98101',
      title: 'Urban Rest Stop Hygiene Ctr',
      description: 'Free showers, restrooms, laundry. Seven days a week.',
      latitude: 47.6128, longitude: -122.3380, status: 'OPEN',
      start_time: '05:30', end_time: '21:30',
      distance: 'Belltown', transit: 'Link: Westlake', verified: true },

    // --- Portland, OR (97201) ---
    { id: 'res-pdx-1', provider_id: 'prov-pdx-1', category: 'Food', city: '97201',
      title: 'Blanchet House',
      description: 'Free meals three times daily, no ID required.',
      latitude: 45.5240, longitude: -122.6760, status: 'OPEN',
      start_time: '06:30', end_time: '18:30',
      distance: 'Old Town', transit: 'MAX: Skidmore Fountain', verified: true },
    { id: 'res-pdx-2', provider_id: 'prov-pdx-2', category: 'Showers', city: '97201',
      title: 'Portland Rescue Mission Showers',
      description: 'Hot showers and hygiene kits available daily.',
      latitude: 45.5226, longitude: -122.6745, status: 'OPEN',
      start_time: '07:00', end_time: '15:00',
      distance: 'Old Town', transit: 'MAX: Skidmore Fountain', verified: true },

    // --- Phoenix, AZ (85001) ---
    { id: 'res-phx-1', provider_id: 'prov-phx-1', category: 'Cooling', city: '85001',
      title: 'Justa Center Cooling Refuge',
      description: 'Day cooling center for seniors 55+.',
      latitude: 33.4500, longitude: -112.0780, status: 'OPEN',
      start_time: '07:00', end_time: '16:00',
      distance: 'Downtown', transit: 'Valley Metro: 3rd Ave', verified: true },
    { id: 'res-phx-2', provider_id: 'prov-phx-2', category: 'Showers', city: '85001',
      title: 'CASS Hygiene Shower Center',
      description: 'Free showers, restrooms, and laundry on the human services campus.',
      latitude: 33.4475, longitude: -112.0810, status: 'OPEN',
      start_time: '06:00', end_time: '14:00',
      distance: 'Downtown', transit: 'Valley Metro: 12th Ave', verified: true },

    // --- Denver, CO (80202) ---
    { id: 'res-den-1', provider_id: 'prov-den-1', category: 'Warming', city: '80202',
      title: 'Denver Rescue Mission Warming',
      description: 'Activated overnight when temps drop below 20°F.',
      latitude: 39.7560, longitude: -104.9970, status: 'OPEN',
      start_time: '19:00', end_time: '07:00',
      distance: 'Five Points', transit: 'RTD: 38th & Blake', verified: true },
    { id: 'res-den-2', provider_id: 'prov-den-2', category: 'Showers', city: '80202',
      title: 'St. Francis Center Showers',
      description: 'Daytime hygiene services with shower and laundry access.',
      latitude: 39.7505, longitude: -104.9920, status: 'OPEN',
      start_time: '06:00', end_time: '14:00',
      distance: 'Five Points', transit: 'RTD: 38th & Blake', verified: true },

    // --- Burlington, VT (05401) ---
    { id: 'res-btv-1', provider_id: 'prov-btv-1', category: 'Shelter', city: '05401',
      title: 'COTS Daystation',
      description: 'Daytime warming and case management.',
      latitude: 44.4762, longitude: -73.2118, status: 'OPEN',
      start_time: '08:00', end_time: '17:00',
      distance: 'Downtown', transit: 'GMT: Cherry St', verified: true },
    { id: 'res-btv-2', provider_id: 'prov-btv-2', category: 'Showers', city: '05401',
      title: 'Burlington Hygiene Hub',
      description: 'Drop-in showers, restrooms, and clean clothes.',
      latitude: 44.4780, longitude: -73.2105, status: 'OPEN',
      start_time: '09:00', end_time: '15:00',
      distance: 'Downtown', transit: 'GMT: Cherry St', verified: true },

    // --- Boston, MA (02108) ---
    { id: 'res-bos-1', provider_id: 'prov-bos-1', category: 'Shelter', city: '02108',
      title: 'Pine Street Inn',
      description: "New England's largest shelter for adults.",
      latitude: 42.3450, longitude: -71.0680, status: 'OPEN',
      start_time: '00:00', end_time: '23:59',
      distance: 'South End', transit: 'MBTA: Back Bay', verified: true },
    { id: 'res-bos-2', provider_id: 'prov-bos-2', category: 'Showers', city: '02108',
      title: 'St. Francis House Hygiene',
      description: 'Daily showers, laundry, and clothing assistance.',
      latitude: 42.3517, longitude: -71.0640, status: 'OPEN',
      start_time: '07:00', end_time: '14:00',
      distance: 'Downtown', transit: 'MBTA: Boylston', verified: true },

    // --- Philadelphia, PA (19103) ---
    { id: 'res-phl-1', provider_id: 'prov-phl-1', category: 'Food', city: '19103',
      title: 'Sunday Breakfast Rescue Mission',
      description: 'Daily meals and overnight shelter for men.',
      latitude: 39.9560, longitude: -75.1530, status: 'OPEN',
      start_time: '06:00', end_time: '20:00',
      distance: 'Center City', transit: 'SEPTA: 8th St', verified: true },
    { id: 'res-phl-2', provider_id: 'prov-phl-2', category: 'Showers', city: '19103',
      title: 'Prevention Point Hygiene',
      description: 'Showers, harm reduction, and wound care.',
      latitude: 39.9712, longitude: -75.1370, status: 'OPEN',
      start_time: '09:00', end_time: '16:00',
      distance: 'Kensington', transit: 'SEPTA: Somerset', verified: true },

    // --- Hartford, CT (06103) ---
    { id: 'res-hfd-1', provider_id: 'prov-hfd-1', category: 'Shelter', city: '06103',
      title: 'ImmaCare Inc.',
      description: 'Year-round emergency shelter and support services.',
      latitude: 41.7680, longitude: -72.6810, status: 'OPEN',
      start_time: '00:00', end_time: '23:59',
      distance: 'Asylum Hill', transit: 'CTtransit: Asylum/Sigourney', verified: true },
    { id: 'res-hfd-2', provider_id: 'prov-hfd-2', category: 'Showers', city: '06103',
      title: 'Open Hearth Hygiene Center',
      description: 'Showers and clothing for men in transition.',
      latitude: 41.7625, longitude: -72.6680, status: 'OPEN',
      start_time: '07:00', end_time: '15:00',
      distance: 'Sheldon-Charter Oak', transit: 'CTtransit: Sheldon', verified: true },

    // --- New Haven, CT (06510) ---
    { id: 'res-nhv-1', provider_id: 'prov-nhv-1', category: 'Shelter', city: '06510',
      title: 'Columbus House',
      description: 'Year-round emergency shelter and outreach.',
      latitude: 41.3085, longitude: -72.9210, status: 'OPEN',
      start_time: '00:00', end_time: '23:59',
      distance: 'Downtown', transit: 'CTtransit: Union Station', verified: true },
    { id: 'res-nhv-2', provider_id: 'prov-nhv-2', category: 'Showers', city: '06510',
      title: 'Downtown Evening Soup Kitchen Showers',
      description: 'Showers, meals, and case management.',
      latitude: 41.3093, longitude: -72.9280, status: 'OPEN',
      start_time: '17:00', end_time: '20:00',
      distance: 'Downtown', transit: 'CTtransit: Chapel St', verified: true }
  ];

  const initialAlerts = [
    { id: 'alert-001', severity: 'High',
      title: 'Extreme Cold Warning',
      desc: 'Warming centers activated nationwide. Dress in layers and seek indoor shelter.',
      geo_region: 'Northeast & Mountain West', time: '2 hours ago' },
    { id: 'alert-002', severity: 'High',
      title: 'Heat Emergency — Phoenix Metro',
      desc: 'Cooling centers open extended hours. Hydration stations along light rail.',
      geo_region: 'Phoenix, AZ', time: '45 minutes ago' },
    { id: 'alert-003', severity: 'Medium',
      title: 'New Shelter Beds Available',
      desc: 'Camillus House (Miami) opened 24 additional beds tonight.',
      geo_region: 'Miami, FL', time: '20 minutes ago' },
    { id: 'alert-004', severity: 'Medium',
      title: 'Free Meals Until 10 PM',
      desc: 'Holy Apostles Soup Kitchen extending dinner service tonight.',
      geo_region: 'New York, NY', time: '32 minutes ago' }
  ];

  // ---------- DOM helpers ----------
  const createDom = () => {
    const get = (selector, root) => (root || document).querySelector(selector);
    const getAll = (selector, root) => Array.from((root || document).querySelectorAll(selector));
    const make = (tag, className) => {
      let node = document.createElement(tag);
      if (className) node.className = className;
      return node;
    };
    const setText = (node, value) => { node.textContent = value == null ? '' : String(value); };
    return { get, getAll, make, setText };
  };
  const dom = createDom();

  // ---------- Firebase client (no-op until config pasted) ----------
  const createFirebaseClient = () => {
    let db = null;
    let enabled = false;
    const hasConfig = () =>
      firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith('PASTE_') &&
      firebaseConfig.projectId && !firebaseConfig.projectId.startsWith('PASTE_');
    const init = () => {
      if (!hasConfig()) return false;
      try {
        db = getFirestore(initializeApp(firebaseConfig));
        enabled = true;
        return true;
      } catch (error) {
        console.warn('Firebase disabled:', error);
        return false;
      }
    };
    const listenResources = (callback) => {
      if (!enabled || !db) return () => {};
      return onSnapshot(collection(db, 'resources'), (snapshot) => {
        let items = [];
        snapshot.forEach((doc) => {
          let data = doc.data();
          items.push({
            id: doc.id,
            provider_id: data.provider_id || 'firebase-provider',
            category: data.category || 'Food',
            title: data.title || 'Untitled Resource',
            description: data.description || '',
            latitude: Number(data.latitude),
            longitude: Number(data.longitude),
            status: data.status || 'OPEN',
            start_time: data.start_time || '',
            end_time: data.end_time || '',
            distance: data.distance || 'Nearby',
            transit: data.transit || 'Transit info unavailable',
            verified: Boolean(data.verified)
          });
        });
        callback(items.filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude)));
      });
    };
    const addResource = async (resource) => {
      if (!enabled || !db) return false;
      await addDoc(collection(db, 'resources'), { ...resource, created_at: serverTimestamp() });
      return true;
    };
    return { init, listenResources, addResource, isEnabled: () => enabled };
  };

  // ---------- Store (localStorage-backed) ----------
  const createStore = () => {
    let state = {
      resources: initialResources.slice(),
      alerts: initialAlerts.slice(),
      saved: [],
      filter: 'All',
      currentZip: '10001',
      mapCenter: { lat: 40.7506, lng: -73.9972, label: 'New York, NY' },
      emergency: false
    };
    try {
      let raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        let parsed = JSON.parse(raw);
        if (Array.isArray(parsed.saved)) state.saved = parsed.saved;
        if (Array.isArray(parsed.resources) && parsed.resources.length) state.resources = parsed.resources;
        if (parsed.mapCenter) state.mapCenter = parsed.mapCenter;
        if (typeof parsed.currentZip === 'string') state.currentZip = parsed.currentZip;
        if (typeof parsed.emergency === 'boolean') state.emergency = parsed.emergency;
      }
    } catch (_) { /* corrupted storage — keep defaults */ }

    const persist = () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          saved: state.saved,
          resources: state.resources,
          mapCenter: state.mapCenter,
          currentZip: state.currentZip,
          emergency: state.emergency
        }));
      } catch (_) { /* quota / privacy mode */ }
    };

    return {
      get: () => state,
      setResources: (resources) => { state.resources = resources; persist(); },
      addResource: (resource) => { state.resources.unshift(resource); persist(); },
      setFilter: (filter) => { state.filter = filter; },
      setCenter: (center) => { state.mapCenter = center; persist(); },
      setCurrentZip: (zip) => { state.currentZip = zip; persist(); },
      toggleSaved: (id) => {
        let index = state.saved.indexOf(id);
        if (index === -1) state.saved.push(id); else state.saved.splice(index, 1);
        persist();
        return state.saved.includes(id);
      },
      isSaved: (id) => state.saved.includes(id),
      setEmergency: (value) => { state.emergency = value; persist(); }
    };
  };

  const store = createStore();
  const firebaseClient = createFirebaseClient();

  // ---------- Map controller (Leaflet + OSM) ----------
  const createMapController = () => {
    let map = null;
    let layer = null;
    const init = () => {
      let center = store.get().mapCenter;
      map = L.map('resource-map', { zoomControl: true, attributionControl: true })
        .setView([center.lat, center.lng], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      layer = L.layerGroup().addTo(map);
    };
    const markerIcon = (resource) => L.divIcon({
      className: '',
      html: '<div class="havn-marker ' + (categoryClass[resource.category] || 'marker-food') +
            '"><span>' + (categoryEmoji[resource.category] || '📍') + '</span></div>',
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -38]
    });
    const render = (resources, onMarkerClick) => {
      if (!layer) return;
      try {
        layer.clearLayers();
        resources.forEach((resource) => {
          let marker = L.marker([resource.latitude, resource.longitude], {
            icon: markerIcon(resource),
            title: resource.title
          });
          marker.on('click', () => onMarkerClick(resource));
          marker.addTo(layer);
        });
      } catch (_) { /* Leaflet not available — degrade silently */ }
    };
    const flyTo = (lat, lng) => { if (map) map.flyTo([lat, lng], 12, { duration: 0.8 }); };
    const invalidateSize = () => { if (map) setTimeout(() => map.invalidateSize(), 100); };
    return { init, render, flyTo, invalidateSize };
  };

  const mapController = createMapController();
  let activeResource = null;
  let toastTimer = null;

  // ---------- Rendering ----------
  const visibleResources = () => {
    let state = store.get();
    // Filter first by the active ZIP so the demo cards only show
    // resources for the city the user is viewing. User-posted pins
    // (which don't carry a `city` tag) always pass through.
    let inCity = state.resources.filter((resource) =>
      !resource.city || resource.city === state.currentZip);
    if (state.filter === 'All') return inCity;
    return inCity.filter((resource) => resource.category === state.filter);
  };

  const toast = (message) => {
    let node = dom.get('#toast');
    dom.setText(node, message);
    node.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { node.hidden = true; }, 2400);
  };

  const renderStatus = () => {
    dom.setText(dom.get('#sync-status'), firebaseClient.isEnabled() ? 'Live Firebase' : 'Mock pins');
    dom.setText(dom.get('#map-location-label'), 'Showing ' + store.get().mapCenter.label);
  };

  const buildResourceCard = (resource) => {
    let li = dom.make('li');
    let card = dom.make('button', 'near-card');
    card.type = 'button';
    card.setAttribute('aria-label',
      resource.title + ', ' + resource.category + ', ' + resource.status);
    card.addEventListener('click', () => openDetail(resource));

    let icon = dom.make('span', 'near-card__icon');
    icon.style.background = 'var(--c-' + resource.category.toLowerCase() + ')';
    dom.setText(icon, categoryEmoji[resource.category] || '📍');

    let body = dom.make('div');
    let title = dom.make('p', 'near-card__title');
    dom.setText(title, resource.title);
    let meta = dom.make('p', 'near-card__meta');
    let distance = dom.make('span');
    dom.setText(distance, resource.distance || 'Nearby');
    let status = dom.make('span',
      'status-pill status-pill--' + resource.status.replace(/\s+/g, ''));
    dom.setText(status, resource.status);
    meta.append(distance, status);
    body.append(title, meta);

    let arrow = dom.make('span', 'near-card__chev');
    dom.setText(arrow, '›');
    card.append(icon, body, arrow);
    li.appendChild(card);
    return li;
  };

  const renderResources = () => {
    let resources = visibleResources();
    let host = dom.get('#near-list');
    host.replaceChildren();
    // Show only up to 4 featured resources in the "Near you" rail; the map shows them all
    resources.slice(0, 4).forEach((resource) => host.appendChild(buildResourceCard(resource)));
    mapController.render(resources, openDetail);
    if (!resources.length) {
      let li = dom.make('li');
      let empty = dom.make('p', 'saved-empty');
      dom.setText(empty, 'No resources match this filter.');
      li.appendChild(empty);
      host.appendChild(li);
    }
  };

  const renderAlerts = () => {
    let host = dom.get('#alerts-list');
    host.replaceChildren();
    store.get().alerts.slice()
      .sort((a, b) => a.severity === 'High' ? -1 : b.severity === 'High' ? 1 : 0)
      .forEach((alert) => {
        let li = dom.make('li');
        let card = dom.make('article',
          'alert-card' + (alert.severity === 'High' ? ' alert-card--emergency' : ''));
        let icon = dom.make('span', 'alert-card__icon');
        dom.setText(icon, alert.severity === 'High' ? '⚠' : 'ℹ');
        let body = dom.make('div');
        let title = dom.make('p', 'alert-card__title');
        dom.setText(title, alert.title);
        let desc = dom.make('p', 'alert-card__desc');
        dom.setText(desc, alert.desc);
        let time = dom.make('p', 'alert-card__time');
        dom.setText(time, alert.geo_region + ' · ' + alert.time);
        body.append(title, desc, time);
        card.append(icon, body);
        li.appendChild(card);
        host.appendChild(li);
      });
  };

  const renderSaved = () => {
    let host = dom.get('#saved-list');
    let empty = dom.get('#saved-empty');
    let resources = store.get().resources.filter(
      (resource) => store.get().saved.includes(resource.id));
    host.replaceChildren();
    empty.hidden = resources.length > 0;
    resources.forEach((resource) => host.appendChild(buildResourceCard(resource)));
  };

  const renderAll = () => {
    renderStatus();
    renderResources();
    renderAlerts();
    renderSaved();
  };

  // ---------- Detail / overlays ----------
  function openDetail(resource) {
    activeResource = resource;
    dom.setText(dom.get('#detail-title'), resource.title);
    dom.setText(dom.get('#detail-verified'),
      resource.verified ? '✓ Verified provider' : 'Pending verification');

    let meta = dom.get('#detail-meta');
    meta.replaceChildren();
    [resource.category, resource.distance, resource.transit].forEach((item) => {
      if (!item) return;
      let li = dom.make('li');
      dom.setText(li, item);
      meta.appendChild(li);
    });

    let status = dom.get('#detail-status');
    status.className = 'status-pill status-pill--' + resource.status.replace(/\s+/g, '');
    dom.setText(status, resource.status);
    dom.setText(dom.get('#detail-hours'),
      'Today ' + resource.start_time + ' – ' + resource.end_time);
    dom.setText(dom.get('#detail-desc'), resource.description);
    dom.setText(dom.get('#btn-save-label'),
      store.isSaved(resource.id) ? 'Saved' : 'Save');
    dom.get('#overlay-detail').hidden = false;
  }

  const closeDetail = () => {
    activeResource = null;
    dom.get('#overlay-detail').hidden = true;
  };

  const openPost = () => { dom.get('#overlay-post').hidden = false; };
  const closePost = () => {
    dom.get('#post-form').reset();
    dom.setText(dom.get('#post-hint'), '');
    dom.get('#overlay-post').hidden = true;
  };

  const showScreen = (name) => {
    let screens = {
      map: 'screen-map', alerts: 'screen-alerts',
      saved: 'screen-saved', profile: 'screen-profile'
    };
    Object.entries(screens).forEach(([key, id]) => {
      dom.get('#' + id).hidden = (key !== name);
    });
    dom.getAll('.bottom-nav__btn').forEach((button) => {
      let active = button.dataset.nav === name;
      button.classList.toggle('bottom-nav__btn--active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    if (name === 'map') mapController.invalidateSize();
    if (name === 'saved') renderSaved();
  };

  // ---------- ZIP search ----------
  const getZipLocation = async (zip) => {
    if (zipFallback[zip]) return zipFallback[zip];
    let response = await fetch('https://api.zippopotam.us/us/' + encodeURIComponent(zip));
    if (!response.ok) throw new Error('ZIP not found');
    let data = await response.json();
    let place = data.places && data.places[0];
    if (!place) throw new Error('ZIP not found');
    return {
      label: place['place name'] + ', ' + place['state abbreviation'],
      lat: Number(place.latitude),
      lng: Number(place.longitude)
    };
  };

  const handleZipSearch = async (event) => {
    event.preventDefault();
    let input = dom.get('#zip-input');
    let feedback = dom.get('#zip-feedback');
    let zip = input.value.trim();
    if (!/^\d{5}$/.test(zip)) {
      dom.setText(feedback, 'Enter a valid 5-digit ZIP code.');
      return;
    }
    dom.setText(feedback, 'Searching ZIP code…');
    try {
      let location = await getZipLocation(zip);
      store.setCenter(location);
      store.setCurrentZip(zip);
      mapController.flyTo(location.lat, location.lng);
      renderResources();
      renderStatus();
      // Refresh the weather banner for the new location.
      // The user has explicitly searched a ZIP, so prefer that center
      // over their device GPS for the alert call.
      try {
        let url = 'https://api.open-meteo.com/v1/forecast' +
          '?latitude=' + location.lat + '&longitude=' + location.lng +
          '&current=temperature_2m,weather_code&temperature_unit=celsius';
        let r = await fetch(url);
        if (r.ok) {
          let data = await r.json();
          renderAlertBanner(deriveAlertFromWeather(data.current));
        }
      } catch (_) { /* keep existing banner */ }
      let count = visibleResources().length;
      if (count) {
        dom.setText(feedback,
          'Showing ' + count + ' resource' + (count === 1 ? '' : 's') +
          ' near ' + location.label + '.');
      } else {
        dom.setText(feedback,
          'Map centered on ' + location.label + '. No mock pins seeded for this ZIP yet.');
      }
    } catch (_) {
      dom.setText(feedback,
        'ZIP not found. Try: 10001 (NYC), 90001 (LA), 89101 (Las Vegas), ' +
        '33101 (Miami), 21201 (Baltimore), 96813 (Honolulu), 20001 (DC).');
    }
  };

  // ---------- Post flow ----------
  const handlePublish = async (event) => {
    event.preventDefault();
    let form = event.currentTarget;
    let selected = form.querySelector('input[name="category"]:checked');
    let category = selected ? selected.value : '';
    let title = dom.get('#post-title-input').value.trim();
    let start = dom.get('#post-start').value;
    let end = dom.get('#post-end').value;
    let notes = dom.get('#post-notes').value.trim();
    if (!category || !title) {
      dom.setText(dom.get('#post-hint'), 'Choose a category and add a title.');
      return;
    }
    let center = store.get().mapCenter;
    let resource = {
      id: 'local-' + Date.now(),
      provider_id: 'self-posted',
      category, title,
      description: notes || 'Community resource posted nearby.',
      latitude: center.lat + ((Math.random() - 0.5) * 0.025),
      longitude: center.lng + ((Math.random() - 0.5) * 0.025),
      status: 'OPEN',
      start_time: start, end_time: end,
      distance: 'Nearby', transit: 'Transit details pending',
      verified: false
    };
    dom.setText(dom.get('#post-hint'), 'Publishing…');
    try {
      let pushed = await firebaseClient.addResource(resource);
      if (!pushed) {
        store.addResource(resource);
        renderAll();
      }
      closePost();
      toast(pushed ? 'Posted to Firebase live map' : 'Posted as local mock pin');
    } catch (_) {
      store.addResource(resource);
      renderAll();
      closePost();
      toast('Firebase unavailable — saved as local mock pin');
    }
  };

  // ---------- Notification preferences ----------
  const defaultNotifPrefs = { weather: true, resources: true, emergency: true };
  const getNotifPrefs = () => {
    try {
      let raw = localStorage.getItem(NOTIF_KEY);
      if (!raw) return { ...defaultNotifPrefs };
      let parsed = JSON.parse(raw);
      return { ...defaultNotifPrefs, ...parsed };
    } catch (_) { return { ...defaultNotifPrefs }; }
  };
  const setNotifPref = (key, value) => {
    let prefs = getNotifPrefs();
    prefs[key] = value;
    try { localStorage.setItem(NOTIF_KEY, JSON.stringify(prefs)); } catch (_) { /* ignore */ }
  };

  // ---------- Weather alerts (Open-Meteo, derived from current conditions) ----------
  // Open-Meteo does not return official government warnings; we derive
  // a banner from current temperature and WMO weather codes. For real
  // US government alerts, swap in api.weather.gov/alerts/active.
  const wmoSevereCodes = new Set([
    65,  // heavy rain
    75,  // heavy snowfall
    82,  // violent rain showers
    86,  // heavy snow showers
    95,  // thunderstorm
    96,  // thunderstorm with slight hail
    99   // thunderstorm with heavy hail
  ]);
  const wmoSevereLabel = {
    65: 'Heavy Rain', 75: 'Heavy Snow', 82: 'Violent Rain Showers',
    86: 'Heavy Snow Showers', 95: 'Thunderstorm',
    96: 'Thunderstorm with Hail', 99: 'Severe Thunderstorm with Hail'
  };

  const getLocationForWeather = () => new Promise((resolve) => {
    let fallback = () => {
      let c = store.get().mapCenter;
      resolve({ lat: c.lat, lng: c.lng, source: 'map' });
    };
    if (!navigator.geolocation) { fallback(); return; }
    let settled = false;
    let timer = setTimeout(() => { if (!settled) { settled = true; fallback(); } }, 4000);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, source: 'gps' });
      },
      () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        fallback();
      },
      { timeout: 4000, maximumAge: 300000 }
    );
  });

  const deriveAlertFromWeather = (current) => {
    if (!current) return null;
    let code = Number(current.weather_code);
    let tempF = (Number(current.temperature_2m) * 9 / 5) + 32;
    // Severe weather code wins first
    if (wmoSevereCodes.has(code)) {
      return {
        title: wmoSevereLabel[code] + ' Alert',
        body: 'Severe weather reported nearby. Tap for shelters and warming centers →',
        kind: 'severe'
      };
    }
    if (tempF <= 32) {
      return {
        title: 'Cold Weather Alert',
        body: 'Current temperature ' + Math.round(tempF) + '°F. Warming centers open nearby. Tap for alerts →',
        kind: 'cold'
      };
    }
    if (tempF >= 95) {
      return {
        title: 'Heat Advisory',
        body: 'Current temperature ' + Math.round(tempF) + '°F. Cooling centers open nearby. Tap for alerts →',
        kind: 'heat'
      };
    }
    return null;
  };

  const renderAlertBanner = (alert) => {
    let title = dom.get('#alert-banner-title');
    let body = dom.get('#alert-banner-body');
    let banner = dom.get('#alert-banner');
    if (!title || !body || !banner) return;
    if (alert) {
      title.textContent = alert.title;
      body.textContent = alert.body;
      title.removeAttribute('data-i18n');
      body.removeAttribute('data-i18n');
      banner.hidden = false;
    } else {
      // No active alert — hide banner entirely
      banner.hidden = true;
    }
  };

  const fetchAndRenderWeatherAlert = async () => {
    let prefs = getNotifPrefs();
    if (!prefs.weather && !prefs.emergency) {
      renderAlertBanner(null);
      return;
    }
    try {
      let loc = await getLocationForWeather();
      let url = 'https://api.open-meteo.com/v1/forecast' +
        '?latitude=' + loc.lat + '&longitude=' + loc.lng +
        '&current=temperature_2m,weather_code' +
        '&temperature_unit=celsius';
      let response = await fetch(url);
      if (!response.ok) throw new Error('Weather fetch failed');
      let data = await response.json();
      let alert = deriveAlertFromWeather(data.current);
      renderAlertBanner(alert);
    } catch (error) {
      console.warn('Weather alert unavailable:', error);
      // Leave the default i18n-translated banner in place
    }
  };

  // ---------- Info modal (My Posts, Notifications, Help, About) ----------
  const openInfoModal = (kind) => {
    let titleNode = dom.get('#info-title');
    let bodyNode = dom.get('#info-body');
    if (!titleNode || !bodyNode) return;

    bodyNode.replaceChildren();

    if (kind === 'my-posts') {
      titleNode.textContent = t('modal.myPosts.title');
      let myPosts = store.get().resources.filter((r) => r.provider_id === 'self-posted');
      if (!myPosts.length) {
        let p = dom.make('p', 'info-card__empty');
        dom.setText(p, t('modal.myPosts.empty'));
        bodyNode.appendChild(p);
      } else {
        myPosts.forEach((post) => {
          let item = dom.make('div', 'my-post-item');
          let title = dom.make('p', 'my-post-item__title');
          dom.setText(title, post.title);
          let meta = dom.make('p', 'my-post-item__meta');
          dom.setText(meta, post.category + ' \u00b7 ' + (post.distance || 'Nearby') +
            ' \u00b7 ' + post.status);
          item.append(title, meta);
          bodyNode.appendChild(item);
        });
      }
    } else if (kind === 'notifications') {
      titleNode.textContent = t('modal.notifications.title');
      let desc = dom.make('p');
      dom.setText(desc, t('modal.notifications.desc'));
      bodyNode.appendChild(desc);
      let prefs = getNotifPrefs();
      let rows = [
        { key: 'weather', title: t('modal.notifications.weather'), desc: t('modal.notifications.weatherDesc') },
        { key: 'resources', title: t('modal.notifications.resources'), desc: t('modal.notifications.resourcesDesc') },
        { key: 'emergency', title: t('modal.notifications.emergency'), desc: t('modal.notifications.emergencyDesc') }
      ];
      rows.forEach((row) => {
        let wrapper = dom.make('div', 'notif-row');
        let text = dom.make('div', 'notif-row__text');
        let title = dom.make('div', 'notif-row__title');
        dom.setText(title, row.title);
        let sub = dom.make('div', 'notif-row__desc');
        dom.setText(sub, row.desc);
        text.append(title, sub);
        let toggleWrap = dom.make('label', 'toggle');
        let input = dom.make('input');
        input.type = 'checkbox';
        input.checked = !!prefs[row.key];
        input.addEventListener('change', (e) => {
          setNotifPref(row.key, e.target.checked);
          if (row.key === 'weather' || row.key === 'emergency') {
            fetchAndRenderWeatherAlert();
          }
        });
        let track = dom.make('span', 'toggle__track');
        let thumb = dom.make('span', 'toggle__thumb');
        track.appendChild(thumb);
        toggleWrap.append(input, track);
        wrapper.append(text, toggleWrap);
        bodyNode.appendChild(wrapper);
      });
    } else if (kind === 'help') {
      titleNode.textContent = t('modal.help.title');
      let sections = [
        { h: 'modal.help.gettingStarted', p: 'modal.help.usingMap' },
        { h: 'modal.help.posting', p: 'modal.help.postingBody' },
        { h: 'modal.help.contact', p: 'modal.help.contactBody' }
      ];
      sections.forEach((s, idx) => {
        let h = dom.make('h3');
        dom.setText(h, t(s.h));
        if (idx === 0) h.style.marginTop = '0';
        let p = dom.make('p');
        dom.setText(p, t(s.p));
        bodyNode.append(h, p);
      });
    } else if (kind === 'about') {
      titleNode.textContent = t('modal.about.title');
      let sections = [
        { h: 'modal.about.mission', p: 'modal.about.missionBody' },
        { h: 'modal.about.how', p: 'modal.about.howBody' },
        { h: 'modal.about.privacy', p: 'modal.about.privacyBody' }
      ];
      sections.forEach((s, idx) => {
        let h = dom.make('h3');
        dom.setText(h, t(s.h));
        if (idx === 0) h.style.marginTop = '0';
        let p = dom.make('p');
        dom.setText(p, t(s.p));
        bodyNode.append(h, p);
      });
      let version = dom.make('p');
      version.style.marginTop = '20px';
      version.style.fontSize = '12px';
      version.style.color = 'var(--muted)';
      dom.setText(version, t('modal.about.version'));
      bodyNode.appendChild(version);
    }

    dom.get('#overlay-info').hidden = false;
  };

  const closeInfoModal = () => { dom.get('#overlay-info').hidden = true; };

  const seedFirestore = async () => {
    if (!firebaseClient.isEnabled()) return;
    let seeded = localStorage.getItem('havn:seeded-firestore-v3');
    if (seeded) return;
    try {
      for (let resource of initialResources) await firebaseClient.addResource(resource);
      localStorage.setItem('havn:seeded-firestore-v3', 'true');
    } catch (_) { /* ignore */ }
  };

  // ---------- Event wiring ----------
  const initEvents = () => {
    dom.getAll('.chip').forEach((button) => {
      button.addEventListener('click', () => {
        dom.getAll('.chip').forEach((chip) => {
          chip.classList.remove('chip--active');
          chip.setAttribute('aria-pressed', 'false');
        });
        button.classList.add('chip--active');
        button.setAttribute('aria-pressed', 'true');
        store.setFilter(button.dataset.filter);
        renderResources();
      });
    });

    dom.getAll('.bottom-nav__btn').forEach((button) =>
      button.addEventListener('click', () => showScreen(button.dataset.nav))
    );

    dom.get('#btn-bell').addEventListener('click', () => showScreen('alerts'));
    dom.get('#alert-banner').addEventListener('click', () => showScreen('alerts'));
    dom.get('#zip-form').addEventListener('submit', handleZipSearch);
    dom.get('#btn-fab').addEventListener('click', openPost);
    dom.get('#btn-post-close').addEventListener('click', closePost);
    dom.get('#post-backdrop').addEventListener('click', closePost);
    dom.get('#post-form').addEventListener('submit', handlePublish);
    dom.get('#btn-detail-close').addEventListener('click', closeDetail);
    dom.get('#detail-backdrop').addEventListener('click', closeDetail);

    dom.get('#btn-save').addEventListener('click', () => {
      if (!activeResource) return;
      let saved = store.toggleSaved(activeResource.id);
      dom.setText(dom.get('#btn-save-label'), saved ? 'Saved' : 'Save');
      renderSaved();
      toast(saved ? 'Saved to your places' : 'Removed from saved');
    });

    dom.get('#btn-directions').addEventListener('click', () => {
      if (!activeResource) return;
      let url = 'https://www.google.com/maps/dir/?api=1&destination=' +
                encodeURIComponent(activeResource.latitude + ',' + activeResource.longitude);
      window.open(url, '_blank', 'noopener');
    });

    dom.get('#btn-share').addEventListener('click', () => {
      if (!activeResource) return;
      let text = activeResource.title + ' — ' + (activeResource.distance || 'nearby');
      if (navigator.share) {
        navigator.share({ title: 'HAVN', text }).catch(() => toast('Share canceled'));
      } else {
        toast('Share link ready');
      }
    });

    dom.get('#toggle-emergency').addEventListener('change', (event) => {
      let on = event.target.checked;
      store.setEmergency(on);
      dom.get('#app').dataset.emergency = on ? 'on' : 'off';
      toast(on ? 'Emergency mode active' : 'Emergency mode off');
    });

    // Profile menu rows
    let bindRowOpen = (id, handler) => {
      let node = dom.get(id);
      if (!node) return;
      node.addEventListener('click', handler);
      node.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); }
      });
    };
    bindRowOpen('#row-my-posts', () => openInfoModal('my-posts'));
    bindRowOpen('#row-saved-places', () => showScreen('saved'));
    bindRowOpen('#row-notifications', () => openInfoModal('notifications'));
    bindRowOpen('#row-help', () => openInfoModal('help'));
    bindRowOpen('#row-about', () => openInfoModal('about'));

    // Info modal close
    dom.get('#btn-info-close').addEventListener('click', closeInfoModal);
    dom.get('#info-backdrop').addEventListener('click', closeInfoModal);

    // Language select
    let langSelect = dom.get('#lang-select');
    if (langSelect) {
      // Sync the dropdown to whatever is saved
      langSelect.value = (window.__havnLang || 'en');
      langSelect.addEventListener('change', (e) => {
        setLanguage(e.target.value);
        // Re-render dynamic strings (status pill text, etc.)
        renderStatus();
      });
    }

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (!dom.get('#overlay-detail').hidden) closeDetail();
        if (!dom.get('#overlay-post').hidden) closePost();
        if (!dom.get('#overlay-info').hidden) closeInfoModal();
      }
    });
  };

  // ---------- Init ----------
  const init = async () => {
    // Apply saved language (or English default) before anything else paints.
    // setLanguage also sets <html lang> and dir for RTL languages.
    setLanguage(window.__havnLang || 'en');

    // Map init can fail in offline / blocked-CDN environments;
    // the rest of the UI must still render either way.
    try {
      mapController.init();
    } catch (error) {
      console.warn('Map unavailable:', error);
    }
    initEvents();
    if (store.get().emergency) {
      dom.get('#app').dataset.emergency = 'on';
      dom.get('#toggle-emergency').checked = true;
    }
    let firebaseReady = firebaseClient.init();
    if (firebaseReady) {
      await seedFirestore();
      firebaseClient.listenResources((items) => {
        if (items.length) {
          store.setResources(items);
          renderAll();
        }
      });
    }
    renderAll();

    // Fire-and-forget: replace the static cold-weather banner with a
    // real one derived from Open-Meteo current conditions for the user's
    // location (geolocation, falling back to the current map center).
    fetchAndRenderWeatherAlert();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();