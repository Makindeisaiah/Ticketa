import { useState, useEffect } from 'react';

export type Language = 'en' | 'fr';

export const getStoredLanguage = (): Language => {
  const saved = localStorage.getItem('ticketa_language');
  if (saved === 'fr' || saved === 'en') {
    return saved;
  }
  return 'en';
};

export const setStoredLanguage = (lang: Language) => {
  localStorage.setItem('ticketa_language', lang);
  window.dispatchEvent(new CustomEvent('ticketa-lang-change', { detail: lang }));
};

export const useLanguage = () => {
  const [lang, setLang] = useState<Language>(getStoredLanguage);

  useEffect(() => {
    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<Language>;
      if (customEvent.detail === 'en' || customEvent.detail === 'fr') {
        setLang(customEvent.detail);
      } else {
        setLang(getStoredLanguage());
      }
    };

    window.addEventListener('ticketa-lang-change', handleLangChange);
    return () => {
      window.removeEventListener('ticketa-lang-change', handleLangChange);
    };
  }, []);

  const changeLanguage = (newLang: Language) => {
    setStoredLanguage(newLang);
    setLang(newLang);
  };

  const t = (key: keyof typeof TRANSLATIONS['en']): string => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en'][key] || key;
  };

  return { lang, changeLanguage, t };
};

export const TRANSLATIONS = {
  en: {
    // Header & Navigation
    organizerPortal: 'Organizer Portal',
    dashboard: 'Dashboard',
    events: 'Events',
    analytics: 'Analytics',
    ticketSales: 'Ticket Sales',
    usersCustomers: 'Users & Customers',
    checkIns: 'Check-Ins',
    refundRequests: 'Refund Requests',
    settings: 'Settings',
    logOut: 'Log Out',
    searchPlaceholder: 'Search events, orders, tickets...',
    dispatchLogs: 'Dispatch Logs',
    wristbandPrinter: 'Wristband Printer',
    createNewEvent: 'Create New Event',
    createEvent: 'Create Event',

    // Overview Tab
    welcome: 'Welcome',
    welcomeSub: 'Here are your current event stats and performance overview.',
    simulateOrder: 'Simulate Order',
    totalRevenue: 'TOTAL REVENUE',
    totalTicketSold: 'TOTAL TICKET SOLD',
    upcomingEvents: 'UPCOMING EVENTS',
    totalCheckIns: 'TOTAL CHECK-INS',
    revenuePerformance: 'Revenue Performance',
    trackEarnings: 'Track total earnings timeline across all events',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    recentOrdersSales: 'Recent Orders & Ticket Sales',
    viewAllSales: 'View All Sales',
    quickActions: 'Quick Actions',
    eventTitle: 'EVENT TITLE',
    customer: 'CUSTOMER',
    tickets: 'TICKETS',
    totalAmount: 'TOTAL AMOUNT',
    dateStatus: 'DATE & STATUS',
    scanTickets: 'Scan Tickets',
    manualCheckIn: 'Manual Check-In',
    noOrdersYet: 'No orders recorded yet. Use "Simulate Order" above to generate demo sales!',

    // Login & Onboarding
    signIn: 'Sign In',
    createAccount: 'Create Account',
    signInTitle: 'Sign in to your Organizer Portal',
    signInDesc: 'Manage events, track ticket sales, and view real-time gate attendance metrics.',
    emailAddress: 'Email Address',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    signInBtn: 'Sign In to Dashboard',
    dontHaveAccount: "Don't have an organizer account?",
    registerAsHost: 'Register as Host',
    alreadyHaveAccount: 'Already have an account?',
    logIn: 'Log in',

    // Validation Errors
    enterFullName: 'Please enter your full name.',
    enterValidEmail: 'Please enter a valid email address.',
    passwordMinLength: 'Password must be at least 6 characters long.',
    passwordsDoNotMatch: 'Passwords do not match. Please check and try again.',
    enterOrgName: 'Please enter your Organization / Brand Name.',
    selectBankError: 'Please select a bank.',
    enterValidAccountNum: 'Please enter a valid account number.',

    // Onboarding Steps
    step1Title: 'Create Your Organizer Account',
    step1Desc: 'Set up your organizer account to start selling tickets and managing events.',
    fullName: 'Full Name',
    continue: 'Continue',
    back: 'Back',

    step2Title: 'Tell us about your organization',
    step2Desc: 'Help us understand who you are to offer the best event management experience.',
    organizationName: 'Organization Name',
    organizerType: 'Category / Type',
    eventAgency: 'Event Agency',
    individualHost: 'Individual Host',
    corporateBrand: 'Corporate Brand',
    concertPromoter: 'Concert & Festival Promoter',
    techSummitHost: 'Tech & Summit Host',
    country: 'Country',
    phoneNumber: 'Phone Number',

    step3Title: "Set Up How You'll Get Paid",
    step3Desc: 'Add your payout details to receive ticket sales earnings safely.',
    payoutOptionNow: 'Set Up Payout Now',
    payoutOptionNowDesc: 'Connect your bank account or mobile wallet to receive earnings.',
    addBankAccount: 'Add Bank Account / Wallet',
    skipForNow: 'Skip for Now',
    skipForNowDesc: 'Set up payout later in the dashboard settings.',

    setupPayoutAccount: 'Set up your payout account',
    setupPayoutDesc: "This is where we'll send your ticket sales revenue",
    countryAndCurrency: 'Country & Currency',
    bankAccountDetails: 'Bank Account Details',
    selectBank: 'Select Bank',
    accountNumber: 'Account Number',
    accountName: 'Account Name',
    verifying: 'Verifying...',
    verifiedAccount: 'Verified Account',
    holderTypeCheck: 'Account Holder Type & Legitimacy Check',
    individual: 'Individual',
    businessOrg: 'Business / Organization',
    businessName: 'Business Name',
    taxIdPlaceholder: 'CAC / Tax ID / RCCM (e.g. ND65478477664)',
    encryptedBankNotice: 'Your bank details are encrypted and securely stored.',
    saveBankAccount: 'Save bank account',

    step4Title: 'Your organizer account is ready',
    step4Desc: 'You can now start organizing events, selling tickets, and managing payouts on your dashboard.',
    hostVerificationCompleted: 'Host Verification Completed',
    payoutStatus: 'Payout Status',
    bankAccountLinked: 'Bank Account Linked',
    pendingConfig: 'Pending (Configure in Settings)',
    goToDashboard: 'Go to Dashboard',

    // Events Tab
    eventsManagement: 'Events Management',
    eventsSub: 'Create, edit, and monitor all your live and upcoming events.',
    searchEvents: 'Search events by title or venue...',
    allEvents: 'All Events',
    published: 'Published',
    draft: 'Draft',
    salesRevenue: 'Sales Revenue',
    ticketsSold: 'Tickets Sold',
    actions: 'Actions',
    editEvent: 'Edit Event',
    deleteEvent: 'Delete Event',
    viewRevenue: 'View Revenue',
    noEventsFound: 'No events found.',

    // Settings Tab
    generalSettings: 'General Settings',
    payoutBankConfig: 'Payout & Bank Account Configuration',
    notificationPreferences: 'Notification Preferences',
    teamMembers: 'Team Members',
    securityAccess: 'Security & Access',
    saveChanges: 'Save Changes',
  },
  fr: {
    // Header & Navigation
    organizerPortal: 'Portail Organisateur',
    dashboard: 'Tableau de bord',
    events: 'Événements',
    analytics: 'Analytiques',
    ticketSales: 'Ventes de Billets',
    usersCustomers: 'Utilisateurs & Clients',
    checkIns: 'Contrôles d\'accès',
    refundRequests: 'Demandes de Remboursement',
    settings: 'Paramètres',
    logOut: 'Déconnexion',
    searchPlaceholder: 'Rechercher des événements, commandes, billets...',
    dispatchLogs: 'Journaux d\'envoi',
    wristbandPrinter: 'Imprimante de Bracelets',
    createNewEvent: 'Créer un Nouvel Événement',
    createEvent: 'Créer un Événement',

    // Overview Tab
    welcome: 'Bienvenue',
    welcomeSub: 'Voici vos statistiques d\'événements actuelles et un aperçu des performances.',
    simulateOrder: 'Simuler une Commande',
    totalRevenue: 'REVENU TOTAL',
    totalTicketSold: 'BILLETS VENDUS',
    upcomingEvents: 'ÉVÉNEMENTS À VENIR',
    totalCheckIns: 'ENTRÉES VALIDÉES',
    revenuePerformance: 'Performance des Revenus',
    trackEarnings: 'Suivez l\'évolution de vos gains sur tous les événements',
    daily: 'Jour',
    weekly: 'Semaine',
    monthly: 'Mois',
    recentOrdersSales: 'Commandes et Ventes de Billets Récentes',
    viewAllSales: 'Voir Toutes les Ventes',
    quickActions: 'Actions Rapides',
    eventTitle: 'TITRE DE L\'ÉVÉNEMENT',
    customer: 'CLIENT',
    tickets: 'BILLETS',
    totalAmount: 'MONTANT TOTAL',
    dateStatus: 'DATE & STATUT',
    scanTickets: 'Scanner des Billets',
    manualCheckIn: 'Validation Manuelle',
    noOrdersYet: 'Aucune commande enregistrée. Utilisez "Simuler une Commande" ci-dessus pour tester !',

    // Login & Onboarding
    signIn: 'Se Connecter',
    createAccount: 'Créer un Compte',
    signInTitle: 'Connectez-vous à votre Portail Organisateur',
    signInDesc: 'Gérez vos événements, suivez vos ventes et observez les entrées en temps réel.',
    emailAddress: 'Adresse E-mail',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    rememberMe: 'Se souvenir de moi',
    forgotPassword: 'Mot de passe oublié ?',
    signInBtn: 'Accéder au Tableau de Bord',
    dontHaveAccount: 'Vous n\'avez pas de compte organisateur ?',
    registerAsHost: 'S\'inscrire comme Organisateur',
    alreadyHaveAccount: 'Vous avez déjà un compte ?',
    logIn: 'Se connecter',

    // Validation Errors
    enterFullName: 'Veuillez saisir votre nom complet.',
    enterValidEmail: 'Veuillez saisir une adresse e-mail valide.',
    passwordMinLength: 'Le mot de passe doit contenir au moins 6 caractères.',
    passwordsDoNotMatch: 'Les mots de passe ne correspondent pas.',
    enterOrgName: 'Veuillez saisir le nom de votre organisation.',
    selectBankError: 'Veuillez sélectionner une banque ou Mobile Money.',
    enterValidAccountNum: 'Veuillez saisir un numéro de compte valide.',

    // Onboarding Steps
    step1Title: 'Créer votre compte Organisateur',
    step1Desc: 'Configurez votre compte organisateur pour commencer à vendre des billets.',
    fullName: 'Nom Complet',
    continue: 'Continuer',
    back: 'Retour',

    step2Title: 'Parlez-nous de votre organisation',
    step2Desc: 'Aidez-nous à mieux vous connaître pour vous offrir la meilleure expérience.',
    organizationName: 'Nom de l\'organisation',
    organizerType: 'Catégorie / Type',
    eventAgency: 'Agence événementielle',
    individualHost: 'Hôte individuel',
    corporateBrand: 'Entreprise / Marque',
    concertPromoter: 'Promoteur de Concerts & Festivals',
    techSummitHost: 'Organisateur de sommets tech',
    country: 'Pays',
    phoneNumber: 'Numéro de téléphone',

    step3Title: 'Configurez votre mode de paiement',
    step3Desc: 'Ajoutez vos coordonnées pour recevoir vos revenus de billetterie en toute sécurité.',
    payoutOptionNow: 'Configurer le versement maintenant',
    payoutOptionNowDesc: 'Connectez votre compte bancaire ou Mobile Money pour recevoir vos gains.',
    addBankAccount: 'Ajouter un compte / Wallet',
    skipForNow: 'Passer pour l\'instant',
    skipForNowDesc: 'Vous pourrez configurer votre compte de paiement plus tard.',

    setupPayoutAccount: 'Configurez votre compte de versement',
    setupPayoutDesc: 'C\'est ici que nous vous enverrons les recettes de vos ventes de billets',
    countryAndCurrency: 'Pays & Devise',
    bankAccountDetails: 'Coordonnées bancaires & Mobile Money',
    selectBank: 'Sélectionner la Banque / Mobile Money',
    accountNumber: 'Numéro de compte',
    accountName: 'Nom du titulaire du compte',
    verifying: 'Vérification...',
    verifiedAccount: 'Compte Vérifié',
    holderTypeCheck: 'Type de titulaire & Contrôle de légitimité',
    individual: 'Individuel',
    businessOrg: 'Entreprise / Organisation',
    businessName: 'Nom de l\'entreprise',
    taxIdPlaceholder: 'Numéro RCCM / Fiscal (ex. CI-ABJ-2026-B)',
    encryptedBankNotice: 'Vos coordonnées bancaires sont cryptées et sécurisées.',
    saveBankAccount: 'Enregistrer le compte',

    step4Title: 'Votre compte organisateur est prêt !',
    step4Desc: 'Vous pouvez maintenant créer des événements, vendre des billets et gérer vos versements.',
    hostVerificationCompleted: 'Vérification de l\'organisateur terminée',
    payoutStatus: 'Statut du versement',
    bankAccountLinked: 'Compte bancaire lié',
    pendingConfig: 'En attente (à configurer dans les paramètres)',
    goToDashboard: 'Accéder au Tableau de Bord',

    // Events Tab
    eventsManagement: 'Gestion des Événements',
    eventsSub: 'Créez, modifiez et suivez tous vos événements en direct et à venir.',
    searchEvents: 'Rechercher des événements par titre ou lieu...',
    allEvents: 'Tous les Événements',
    published: 'Publié',
    draft: 'Brouillon',
    salesRevenue: 'Revenus des Ventes',
    ticketsSold: 'Billets Vendus',
    actions: 'Actions',
    editEvent: 'Modifier l\'Événement',
    deleteEvent: 'Supprimer l\'Événement',
    viewRevenue: 'Voir le Revenu',
    noEventsFound: 'Aucun événement trouvé.',

    // Settings Tab
    generalSettings: 'Paramètres Généraux',
    payoutBankConfig: 'Configuration des Versements & Comptes',
    notificationPreferences: 'Préférences de Notifications',
    teamMembers: 'Membres de l\'Équipe',
    securityAccess: 'Sécurité & Accès',
    saveChanges: 'Enregistrer les Modifications',
  }
};
