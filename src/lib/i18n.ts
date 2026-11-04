export const locales = ["en", "fr", "ar"] as const;
export type Locale = (typeof locales)[number];

export type CategoryCopy = { title: string; description: string };
export type QuestionCopy = { question: string; answer: string };

export type Copy = {
  dir: "ltr" | "rtl";
  nav: {
    home: string;
    latest: string;
    author: string;
    about: string;
    contact: string;
    ebooks: string;
    shop: string;
    marketplace: string;
    faq: string;
  };
  footer: {
    privacy: string;
    terms: string;
    author: string;
    contact: string;
    faq: string;
    marketplace: string;
    tagline: string;
    copyright: string;
  };
  a11y: {
    chooseLanguage: string;
    home: string;
    mainNav: string;
    footerNav: string;
    search: string;
    amazon: string;
    linkedIn: string;
    youTube: string;
    admin: string;
    backToTop: string;
    previousPage: string;
    nextPage: string;
  };
  home: {
    searchLabel: string;
    searchPlaceholder: string;
    close: string;
    scrollToPosts: string;
    latestPosts: string;
    noPosts: string;
    loadError: string;
    authorKicker: string;
    authorLead: string;
    authorStory: string;
    authorTagline: string;
    meetAuthor: string;
    authorArtQuote: string;
    authorArtAccent: string;
    pixelLabel: string;
    pixelQuote: string;
    exploreHeading: string;
    categories: { journal: CategoryCopy; ebooks: CategoryCopy; shop: CategoryCopy; marketplace: CategoryCopy };
  };
  about: { metaTitle: string; eyebrow: string; title: string; intro: string; povLabel: string; povText: string; journalLabel: string; journalText: string };
  contact: {
    metaTitle: string;
    metaDescription: string;
    eyebrow: string;
    title: string;
    enquiries: string;
    follow: string;
    instagram: string;
    sent: {
      title: string;
      body: string;
      home: string;
      another: string;
    };
    form: {
      label: string;
      name: string;
      email: string;
      subject: string;
      optional: string;
      message: string;
      placeholder: string;
      send: string;
      sending: string;
      success: string;
      error: string;
      required: string;
      editor: {
        toolbar: string;
        bold: string;
        italic: string;
        underline: string;
        bulleted: string;
        numbered: string;
        clear: string;
      };
    };
  };
  faq: { metaTitle: string; metaDescription: string; eyebrow: string; title: string; questions: QuestionCopy[] };
  privacy: { metaTitle: string; eyebrow: string; title: string; intro: string; sectionTitle: string; sectionBody: string; backHome: string };
  terms: { metaTitle: string; eyebrow: string; title: string; intro: string; sectionTitle: string; sectionBody: string; backHome: string };
  marketplace: { metaTitle: string; eyebrow: string; title: string; body: string; cta: string };
  shop: { metaTitle: string; title: string; comingSoon: string };
  ebooks: {
    metaTitle: string;
    title: string;
    comingSoon: string;
    eyebrow: string;
    intro: string;
    viewOnAmazon: string;
    newRelease: string;
    ebook: string;
    paperback: string;
    ebookAndPrint: string;
    ages: string;
    amazonNote: string;
  };
  book: { backToLibrary: string; details: string; format: string; ages: string; series: string };
  reviews: {
    heading: string;
    intro: string;
    writeReview: string;
    yourRating: string;
    ratingHint: string;
    name: string;
    namePlaceholder: string;
    headline: string;
    headlinePlaceholder: string;
    body: string;
    bodyPlaceholder: string;
    submit: string;
    submitting: string;
    success: string;
    error: string;
    none: string;
    loading: string;
    unavailable: string;
    basedOn: string;
    outOfFive: string;
    authorResponse: string;
  };
  author: { metaTitle: string; kicker: string; name: string; lead: string; paragraphs: string[]; signature: string; cta: string };
  post: { allPosts: string; aboutAuthor: string; authorBio: string; contents: string };
  comments: {
    heading: string; leave: string; yourName: string; namePlaceholder: string; yourComment: string; commentPlaceholder: string;
    submit: string; reviewed: string; empty: string; loading: string; sending: string; saved: string; unavailable: string; saveError: string;
    editor: { toolbar: string; bold: string; italic: string; underline: string; bulleted: string; numbered: string; clear: string };
  };
  notFound: { title: string; body: string; cta: string };
  cookie: { title: string; body: string; settings: string; accept: string };
};

export const messages: Record<Locale, Copy> = {
  en: {
    dir: "ltr",
    nav: { home: "Home", latest: "Latest Posts", author: "Author", about: "About", contact: "Contact", ebooks: "Ebooks", shop: "Shop", marketplace: "Marketplace", faq: "FAQ" },
    footer: {
      privacy: "PRIVACY POLICY",
      terms: "TERMS OF USE",
      author: "AUTHOR",
      contact: "CONTACT",
      faq: "FAQ",
      marketplace: "MARKETPLACE",
      tagline: "Read it. Watch it. Make it part of your day.",
      copyright: "© 2026 DAILY ESSENTIAL™ LLC.",
    },
    a11y: {
      chooseLanguage: "Choose language",
      home: "Daily Essential home",
      mainNav: "Main navigation",
      footerNav: "Footer navigation",
      search: "Search posts",
      amazon: "Visit D. Buckky Moral on Amazon",
      linkedIn: "Daily Essential on LinkedIn",
      youTube: "Daily Essential on YouTube",
      admin: "Admin access",
      backToTop: "Back to top",
      previousPage: "Previous page",
      nextPage: "Next page",
    },
    home: {
      searchLabel: "Search posts",
      searchPlaceholder: "Search posts",
      close: "Close",
      scrollToPosts: "Scroll to posts",
      latestPosts: "Latest posts",
      noPosts: "No published posts found.",
      loadError: "We could not load the latest posts. Please try again shortly.",
      authorKicker: "DenitahStellar",
      authorLead: "Imaginative worlds, memorable characters, and adventures for readers of every age.",
      authorStory: "Through imaginative worlds, memorable characters, and engaging adventures, D. Buckky Moral creates books that inspire curiosity, encourage exploration, and bring readers closer to the magic of reading.",
      authorTagline: "Every story begins with imagination.",
      meetAuthor: "Meet the author",
      authorArtQuote: "Learning today builds a brighter tomorrow!",
      authorArtAccent: "brighter",
      pixelLabel: "PIXEL / 01",
      pixelQuote: "Find your point of view.",
      exploreHeading: "Find the part of Daily Essential that fits your day.",
      categories: {
        journal: { title: "Journal", description: "Fresh notes for daily life." },
        ebooks: { title: "Ebooks", description: "Guides worth keeping close." },
        shop: { title: "Shop", description: "Useful objects, thoughtfully chosen." },
        marketplace: { title: "Marketplace", description: "Discover what is next." },
      },
    },
    about: {
      metaTitle: "About",
      eyebrow: "ABOUT DAILY ESSENTIAL",
      title: "Better everyday moments begin with attention.",
      intro: "Daily Essential is a quiet journal for useful ideas, considered objects, and the routines that help make ordinary days feel a little more intentional.",
      povLabel: "OUR POINT OF VIEW",
      povText: "Keep what matters. Make room for the rest.",
      journalLabel: "OUR JOURNAL",
      journalText: "Stories for the home, the day, and everything in between.",
    },
    contact: {
      metaTitle: "Contact",
      metaDescription: "Contact Daily Essential to ask a question, share feedback, or discuss a collaboration. Send a message and we reply within two working days.",
      eyebrow: "CONTACT",
      title: "Let’s make something useful.",
      enquiries: "GENERAL ENQUIRIES",
      follow: "FOLLOW ALONG",
      instagram: "Instagram",
      sent: {
        title: "Message sent.",
        body: "Thank you — your message has been delivered. We reply within two working days.",
        home: "BACK TO HOME",
        another: "SEND ANOTHER MESSAGE",
      },
      form: {
        label: "SEND A MESSAGE",
        name: "Your name",
        email: "Email address",
        subject: "Subject",
        optional: "optional",
        message: "Message",
        placeholder: "Write your message…",
        send: "SEND MESSAGE",
        sending: "SENDING…",
        success: "Thanks — your message is on its way. We reply within two working days.",
        error: "We could not send your message. Please try again in a moment.",
        required: "Please add your name, email address and message.",
        editor: { toolbar: "Formatting", bold: "Bold", italic: "Italic", underline: "Underline", bulleted: "Bulleted list", numbered: "Numbered list", clear: "Clear formatting" },
      },
    },
    faq: {
      metaTitle: "FAQ",
      metaDescription: "Answers to common questions about Daily Essential: what the journal is, how to share feedback, and when the marketplace opens.",
      eyebrow: "HELP",
      title: "Frequently asked questions",
      questions: [
        { question: "What is Daily Essential?", answer: "A journal of useful ideas, thoughtful objects, and everyday routines." },
        { question: "Can I share feedback?", answer: "Yes. Visit the Contact page and send us a note." },
        { question: "Is the Marketplace available now?", answer: "It is being prepared. Join us as it develops." },
      ],
    },
    privacy: {
      metaTitle: "Privacy Policy",
      eyebrow: "LEGAL",
      title: "Privacy Policy",
      intro: "We respect your privacy. This website only collects information you choose to share, such as your name and comment, to provide the requested experience.",
      sectionTitle: "Information you share",
      sectionBody: "When you contact us or post a comment, you may provide your name and message. We do not sell personal information.",
      backHome: "HOME",
    },
    terms: {
      metaTitle: "Terms of Use",
      eyebrow: "LEGAL",
      title: "Terms of Use",
      intro: "By using Daily Essential, you agree to use this site responsibly and respect its content, community, and intellectual property.",
      sectionTitle: "Content and availability",
      sectionBody: "We may update, change, or remove content to keep the journal useful and current. Content is provided for general information only.",
      backHome: "HOME",
    },
    marketplace: {
      metaTitle: "Marketplace",
      eyebrow: "MARKETPLACE",
      title: "Useful things, coming soon.",
      body: "A considered selection of everyday objects will live here soon. Until then, follow the journal for new notes and ideas.",
      cta: "READ THE JOURNAL",
    },
    shop: { metaTitle: "Shop", title: "Shop", comingSoon: "Coming soon..." },
    ebooks: {
      metaTitle: "Ebooks",
      title: "Ebooks",
      comingSoon: "Coming soon...",
      eyebrow: "THE LIBRARY",
      intro: "Illustrated adventures for young readers, published on Amazon Kindle and in paperback — every title opens securely in the Amazon store.",
      viewOnAmazon: "VIEW ON AMAZON",
      newRelease: "NEW RELEASE",
      ebook: "eBook",
      paperback: "Paperback",
      ebookAndPrint: "eBook & Paperback",
      ages: "Ages",
      amazonNote: "Purchases, samples and reviews are handled by Amazon.",
    },
    book: {
      backToLibrary: "ALL BOOKS",
      details: "Book details",
      format: "Format",
      ages: "Ages",
      series: "Series",
    },
    reviews: {
      heading: "Reader reviews",
      intro: "Share what you thought of this book. Reviews appear here once they have been approved.",
      writeReview: "Write a review",
      yourRating: "Your rating",
      ratingHint: "Choose a rating from 1 to 5 stars.",
      name: "Your name",
      namePlaceholder: "The name shown with your review",
      headline: "Review title",
      headlinePlaceholder: "Sum up your review in a few words",
      body: "Your review",
      bodyPlaceholder: "What did you think of the story, the pictures and the characters?",
      submit: "SUBMIT REVIEW",
      submitting: "Submitting…",
      success: "Thank you — your review will appear once it has been approved.",
      error: "We could not save your review. Please try again.",
      none: "No reviews yet. Be the first to review this book.",
      loading: "Loading reviews…",
      unavailable: "Reviews are unavailable right now.",
      basedOn: "Based on {count} reviews",
      outOfFive: "out of 5",
      authorResponse: "Response from the author",
    },
    author: {
      metaTitle: "D. Buckky Moral, Author",
      kicker: "Independent author & storyteller",
      name: "D. Buckky Moral",
      lead: "Creating imaginative worlds, memorable characters, and adventures that bring readers closer to the magic of reading.",
      paragraphs: [
        "D. Buckky Moral is an independent author and storyteller passionate about imagination, creativity, and the art of storytelling.",
        "Through imaginative worlds, memorable characters, and engaging adventures, D. Buckky Moral creates books that inspire curiosity, encourage exploration, and bring readers closer to the magic of reading.",
        "From captivating children’s stories to creative adventures and educational experiences, each publication is designed to offer something meaningful, entertaining, and memorable.",
        "With a passion for original ideas and creative expression, D. Buckky Moral continues to explore new stories and possibilities, inviting readers of all ages to discover something extraordinary on every page.",
      ],
      signature: "Every story begins with imagination.",
      cta: "EXPLORE THE JOURNAL",
    },
    post: {
      allPosts: "ALL POSTS",
      aboutAuthor: "ABOUT THE AUTHOR",
      authorBio: "Independent author and storyteller creating imaginative worlds for readers of all ages.",
      contents: "Contents",
    },
    comments: {
      heading: "COMMENTS", leave: "Leave a comment", yourName: "YOUR NAME", namePlaceholder: "e.g. Ada Lovelace",
      yourComment: "YOUR COMMENT", commentPlaceholder: "Share your thoughts, questions or a code tip…", submit: "POST COMMENT",
      reviewed: "Comments are reviewed before they appear.", empty: "No comments yet. Be the first to join the conversation.",
      loading: "Loading comments…", sending: "Sending…", saved: "Thanks — your comment is awaiting approval.",
      unavailable: "Comments are unavailable right now.", saveError: "Unable to save comment.",
      editor: { toolbar: "Formatting", bold: "Bold", italic: "Italic", underline: "Underline", bulleted: "Bulleted list", numbered: "Numbered list", clear: "Clear formatting" },
    },
    notFound: { title: "This page has wandered off.", body: "The link may be out of date, or the post has not been published yet.", cta: "GO TO THE JOURNAL" },
    cookie: {
      title: "Your Privacy Settings",
      body: "By visiting our website or using Daily Essential Services, you agree to the use of cookies and similar tracking technologies to improve the experience and functionality of our services, deliver personalised content, and understand how the site is used. You can change your preferences at any time.",
      settings: "View Privacy Settings",
      accept: "Got it",
    },
  },

  fr: {
    dir: "ltr",
    nav: { home: "Accueil", latest: "Derniers articles", author: "Auteur", about: "À propos", contact: "Contact", ebooks: "Livres numériques", shop: "Boutique", marketplace: "Marché", faq: "FAQ" },
    footer: {
      privacy: "POLITIQUE DE CONFIDENTIALITÉ",
      terms: "CONDITIONS D’UTILISATION",
      author: "AUTEUR",
      contact: "CONTACT",
      faq: "FAQ",
      marketplace: "MARCHÉ",
      tagline: "Lire. Regarder. En faire partie chaque jour.",
      copyright: "© 2026 DAILY ESSENTIAL™ LLC.",
    },
    a11y: {
      chooseLanguage: "Choisir la langue",
      home: "Accueil Daily Essential",
      mainNav: "Navigation principale",
      footerNav: "Navigation de pied de page",
      search: "Rechercher des articles",
      amazon: "Voir D. Buckky Moral sur Amazon",
      linkedIn: "Daily Essential sur LinkedIn",
      youTube: "Daily Essential sur YouTube",
      admin: "Accès administrateur",
      backToTop: "Revenir en haut",
      previousPage: "Page précédente",
      nextPage: "Page suivante",
    },
    home: {
      searchLabel: "Rechercher des articles",
      searchPlaceholder: "Rechercher des articles",
      close: "Fermer",
      scrollToPosts: "Voir les articles",
      latestPosts: "Derniers articles",
      noPosts: "Aucun article publié trouvé.",
      loadError: "Nous n’avons pas pu charger les derniers articles. Veuillez réessayer dans un instant.",
      authorKicker: "Auteur et conteur indépendant",
      authorLead: "Des mondes imaginatifs, des personnages mémorables et des aventures pour les lecteurs de tout âge.",
      authorStory: "À travers des mondes imaginatifs, des personnages mémorables et des aventures captivantes, D. Buckky Moral écrit des livres qui éveillent la curiosité, encouragent l'exploration et rapprochent les lecteurs de la magie de la lecture.",
      authorTagline: "Chaque histoire commence par l'imagination.",
      meetAuthor: "Rencontrer l’auteur",
      authorArtQuote: "Apprendre aujourd’hui prépare un avenir plus lumineux !",
      authorArtAccent: "plus lumineux",
      pixelLabel: "PIXEL / 01",
      pixelQuote: "Trouvez votre point de vue.",
      exploreHeading: "Trouvez la partie de Daily Essential qui correspond à votre journée.",
      categories: {
        journal: { title: "Journal", description: "Des notes nouvelles pour le quotidien." },
        ebooks: { title: "Livres numériques", description: "Des guides à garder près de soi." },
        shop: { title: "Boutique", description: "Des objets utiles, choisis avec soin." },
        marketplace: { title: "Marché", description: "Découvrir la suite." },
      },
    },
    about: {
      metaTitle: "À propos",
      eyebrow: "À PROPOS DE DAILY ESSENTIAL",
      title: "Les bons moments du quotidien commencent par l’attention.",
      intro: "Daily Essential est un journal discret consacré aux idées utiles, aux objets réfléchis et aux routines qui rendent les journées ordinaires un peu plus intentionnelles.",
      povLabel: "NOTRE POINT DE VUE",
      povText: "Gardez ce qui compte. Faites de la place pour le reste.",
      journalLabel: "NOTRE JOURNAL",
      journalText: "Des histoires pour la maison, la journée et tout ce qui se trouve entre les deux.",
    },
    contact: {
      metaTitle: "Contact",
      metaDescription: "Contactez Daily Essential pour poser une question, partager un avis ou discuter d’une collaboration. Nous répondons sous deux jours ouvrés.",
      eyebrow: "CONTACT",
      title: "Créons quelque chose d’utile.",
      enquiries: "DEMANDES GÉNÉRALES",
      follow: "SUIVEZ-NOUS",
      instagram: "Instagram",
      sent: {
        title: "Message envoyé.",
        body: "Merci — votre message a bien été transmis. Nous répondons sous deux jours ouvrés.",
        home: "RETOUR À L’ACCUEIL",
        another: "ENVOYER UN AUTRE MESSAGE",
      },
      form: {
        label: "ENVOYER UN MESSAGE",
        name: "Votre nom",
        email: "Adresse e-mail",
        subject: "Objet",
        optional: "facultatif",
        message: "Message",
        placeholder: "Écrivez votre message…",
        send: "ENVOYER LE MESSAGE",
        sending: "ENVOI…",
        success: "Merci — votre message est en route. Nous répondons sous deux jours ouvrés.",
        error: "Nous n’avons pas pu envoyer votre message. Veuillez réessayer dans un instant.",
        required: "Veuillez indiquer votre nom, votre adresse e-mail et votre message.",
        editor: { toolbar: "Mise en forme", bold: "Gras", italic: "Italique", underline: "Souligné", bulleted: "Liste à puces", numbered: "Liste numérotée", clear: "Effacer la mise en forme" },
      },
    },
    faq: {
      metaTitle: "FAQ",
      metaDescription: "Réponses aux questions fréquentes sur Daily Essential : la nature du journal, le partage d’avis et l’ouverture du marché.",
      eyebrow: "AIDE",
      title: "Questions fréquentes",
      questions: [
        { question: "Qu’est-ce que Daily Essential ?", answer: "Un journal d’idées utiles, d’objets réfléchis et de routines quotidiennes." },
        { question: "Puis-je partager un avis ?", answer: "Oui. Rendez-vous sur la page Contact et écrivez-nous." },
        { question: "Le Marché est-il disponible maintenant ?", answer: "Il est en préparation. Rejoignez-nous pendant qu’il se développe." },
      ],
    },
    privacy: {
      metaTitle: "Politique de confidentialité",
      eyebrow: "MENTIONS LÉGALES",
      title: "Politique de confidentialité",
      intro: "Nous respectons votre vie privée. Ce site ne collecte que les informations que vous choisissez de partager, comme votre nom et votre commentaire, afin de fournir l’expérience demandée.",
      sectionTitle: "Les informations que vous partagez",
      sectionBody: "Lorsque vous nous contactez ou publiez un commentaire, vous pouvez fournir votre nom et votre message. Nous ne vendons pas les informations personnelles.",
      backHome: "ACCUEIL",
    },
    terms: {
      metaTitle: "Conditions d’utilisation",
      eyebrow: "MENTIONS LÉGALES",
      title: "Conditions d’utilisation",
      intro: "En utilisant Daily Essential, vous acceptez d’utiliser ce site de manière responsable et de respecter son contenu, sa communauté et sa propriété intellectuelle.",
      sectionTitle: "Contenu et disponibilité",
      sectionBody: "Nous pouvons mettre à jour, modifier ou supprimer du contenu afin que le journal reste utile et actuel. Le contenu est fourni à titre d’information générale uniquement.",
      backHome: "ACCUEIL",
    },
    marketplace: {
      metaTitle: "Marché",
      eyebrow: "MARCHÉ",
      title: "Des choses utiles, bientôt.",
      body: "Une sélection réfléchie d’objets du quotidien verra bientôt le jour ici. En attendant, suivez le journal pour de nouvelles notes et idées.",
      cta: "LIRE LE JOURNAL",
    },
    shop: { metaTitle: "Boutique", title: "Boutique", comingSoon: "Bientôt disponible..." },
    ebooks: {
      metaTitle: "Livres numériques",
      title: "Livres numériques",
      comingSoon: "Bientôt disponible...",
      eyebrow: "LA BIBLIOTHÈQUE",
      intro: "Des aventures illustrées pour les jeunes lecteurs, publiées sur Amazon Kindle et en édition papier — chaque titre s’ouvre en toute sécurité dans la boutique Amazon.",
      viewOnAmazon: "VOIR SUR AMAZON",
      newRelease: "NOUVEAUTÉ",
      ebook: "eBook",
      paperback: "Broché",
      ebookAndPrint: "eBook & Broché",
      ages: "Âges",
      amazonNote: "Les achats, extraits et avis sont gérés par Amazon.",
    },
    book: {
      backToLibrary: "TOUS LES LIVRES",
      details: "Détails du livre",
      format: "Format",
      ages: "Âges",
      series: "Série",
    },
    reviews: {
      heading: "Avis des lecteurs",
      intro: "Partagez votre avis sur ce livre. Les avis apparaissent ici après validation.",
      writeReview: "Écrire un avis",
      yourRating: "Votre note",
      ratingHint: "Choisissez une note de 1 à 5 étoiles.",
      name: "Votre nom",
      namePlaceholder: "Le nom affiché avec votre avis",
      headline: "Titre de l’avis",
      headlinePlaceholder: "Résumez votre avis en quelques mots",
      body: "Votre avis",
      bodyPlaceholder: "Qu’avez-vous pensé de l’histoire, des illustrations et des personnages ?",
      submit: "ENVOYER L’AVIS",
      submitting: "Envoi…",
      success: "Merci — votre avis apparaîtra après validation.",
      error: "Impossible d’enregistrer votre avis. Veuillez réessayer.",
      none: "Aucun avis pour le moment. Soyez le premier à donner votre avis sur ce livre.",
      loading: "Chargement des avis…",
      unavailable: "Les avis sont indisponibles pour le moment.",
      basedOn: "Sur la base de {count} avis",
      outOfFive: "sur 5",
      authorResponse: "Réponse de l’auteur",
    },
    author: {
      metaTitle: "D. Buckky Moral, auteur",
      kicker: "Auteur et conteur indépendant",
      name: "D. Buckky Moral",
      lead: "Créer des mondes imaginatifs, des personnages mémorables et des aventures qui rapprochent les lecteurs de la magie de la lecture.",
      paragraphs: [
        "D. Buckky Moral est un auteur et conteur indépendant passionné par l’imagination, la créativité et l’art de raconter des histoires.",
        "À travers des mondes imaginatifs, des personnages mémorables et des aventures captivantes, D. Buckky Moral crée des livres qui éveillent la curiosité, encouragent l’exploration et rapprochent les lecteurs de la magie de la lecture.",
        "Des histoires captivantes pour enfants aux aventures créatives et aux expériences éducatives, chaque publication est conçue pour offrir quelque chose de significatif, de divertissant et de mémorable.",
        "Animé par une passion pour les idées originales et l’expression créative, D. Buckky Moral continue d’explorer de nouvelles histoires et possibilités, invitant les lecteurs de tout âge à découvrir quelque chose d’extraordinaire à chaque page.",
      ],
      signature: "Chaque histoire commence par l’imagination.",
      cta: "EXPLORER LE JOURNAL",
    },
    post: {
      allPosts: "TOUS LES ARTICLES",
      aboutAuthor: "À PROPOS DE L’AUTEUR",
      authorBio: "Auteur et conteur indépendant qui crée des mondes imaginatifs pour les lecteurs de tout âge.",
      contents: "Sommaire",
    },
    comments: {
      heading: "COMMENTAIRES", leave: "Laisser un commentaire", yourName: "VOTRE NOM", namePlaceholder: "ex. Ada Lovelace",
      yourComment: "VOTRE COMMENTAIRE", commentPlaceholder: "Partagez vos idées, questions ou astuces…", submit: "PUBLIER LE COMMENTAIRE",
      reviewed: "Les commentaires sont vérifiés avant d’apparaître.", empty: "Aucun commentaire pour le moment. Soyez le premier à participer.",
      loading: "Chargement des commentaires…", sending: "Envoi…", saved: "Merci — votre commentaire est en attente d’approbation.",
      unavailable: "Les commentaires sont indisponibles pour le moment.", saveError: "Impossible d’enregistrer le commentaire.",
      editor: { toolbar: "Mise en forme", bold: "Gras", italic: "Italique", underline: "Souligné", bulleted: "Liste à puces", numbered: "Liste numérotée", clear: "Effacer la mise en forme" },
    },
    notFound: { title: "Cette page s’est égarée.", body: "Le lien est peut-être obsolète, ou l’article n’a pas encore été publié.", cta: "ALLER AU JOURNAL" },
    cookie: {
      title: "Vos paramètres de confidentialité",
      body: "En visitant notre site ou en utilisant les services Daily Essential, vous acceptez l’utilisation de cookies et de technologies de suivi similaires afin d’améliorer l’expérience et le fonctionnement de nos services, de proposer un contenu personnalisé et de comprendre comment le site est utilisé. Vous pouvez modifier vos préférences à tout moment.",
      settings: "Voir les paramètres de confidentialité",
      accept: "J’ai compris",
    },
  },

  ar: {
    dir: "rtl",
    nav: { home: "الرئيسية", latest: "أحدث المقالات", author: "المؤلف", about: "من نحن", contact: "اتصل بنا", ebooks: "الكتب الإلكترونية", shop: "المتجر", marketplace: "السوق", faq: "الأسئلة الشائعة" },
    footer: {
      privacy: "سياسة الخصوصية",
      terms: "شروط الاستخدام",
      author: "المؤلف",
      contact: "اتصل بنا",
      faq: "الأسئلة الشائعة",
      marketplace: "السوق",
      tagline: "اقرأ. شاهد. اجعله جزءًا من يومك.",
      copyright: "© 2026 DAILY ESSENTIAL™ LLC.",
    },
    a11y: {
      chooseLanguage: "اختر اللغة",
      home: "الصفحة الرئيسية لديلي إسينشيال",
      mainNav: "التنقل الرئيسي",
      footerNav: "روابط التذييل",
      search: "البحث في المقالات",
      amazon: "زيارة دي باكي مورال على أمازون",
      linkedIn: "ديلي إسينشيال على لينكد إن",
      youTube: "ديلي إسينشيال على يوتيوب",
      admin: "دخول المشرف",
      backToTop: "العودة إلى الأعلى",
      previousPage: "الصفحة السابقة",
      nextPage: "الصفحة التالية",
    },
    home: {
      searchLabel: "البحث في المقالات",
      searchPlaceholder: "البحث في المقالات",
      close: "إغلاق",
      scrollToPosts: "انتقل إلى المقالات",
      latestPosts: "أحدث المقالات",
      noPosts: "لم يتم العثور على مقالات منشورة.",
      loadError: "تعذّر تحميل أحدث المقالات. يرجى المحاولة مرة أخرى بعد قليل.",
      authorKicker: "مؤلف وروائي مستقل",
      authorLead: "عوالم خيالية وشخصيات لا تُنسى ومغامرات لقرّاء من كل الأعمار.",
      authorStory: "من خلال عوالم خيالية وشخصيات لا تُنسى ومغامرات شيّقة، يكتب D. Buckky Moral كتبًا تُثير الفضول، وتشجع على الاستكشاف، وتقرّب القرّاء من سحر القراءة.",
      authorTagline: "كل قصة تبدأ بالخيال.",
      meetAuthor: "تعرّف على المؤلف",
      authorArtQuote: "التعلّم اليوم يبني غدًا أكثر إشراقًا!",
      authorArtAccent: "أكثر إشراقًا",
      pixelLabel: "بكسل / 01",
      pixelQuote: "اعثر على وجهة نظرك.",
      exploreHeading: "اكتشف الجزء الذي يناسب يومك من ديلي إسينشيال.",
      categories: {
        journal: { title: "المجلة", description: "ملاحظات جديدة للحياة اليومية." },
        ebooks: { title: "الكتب الإلكترونية", description: "أدلة تستحق أن تبقى قريبة منك." },
        shop: { title: "المتجر", description: "أشياء مفيدة مختارة بعناية." },
        marketplace: { title: "السوق", description: "اكتشف ما هو قادم." },
      },
    },
    about: {
      metaTitle: "من نحن",
      eyebrow: "عن ديلي إسينشيال",
      title: "لحظات يومية أفضل تبدأ بالانتباه.",
      intro: "ديلي إسينشيال مجلة هادئة للأفكار المفيدة والأشياء المدروسة والروتين الذي يجعل الأيام العادية أكثر وعيًا بقليل.",
      povLabel: "وجهة نظرنا",
      povText: "احتفظ بما يهم. وافسح المجال لما سواه.",
      journalLabel: "مجلتنا",
      journalText: "قصص للبيت واليوم وكل ما بينهما.",
    },
    contact: {
      metaTitle: "اتصل بنا",
      metaDescription: "تواصل مع ديلي إسينشيال لطرح سؤال أو مشاركة ملاحظة أو مناقشة تعاون. نرد خلال يومي عمل.",
      eyebrow: "اتصل بنا",
      title: "لنصنع شيئًا مفيدًا.",
      enquiries: "استفسارات عامة",
      follow: "تابعنا",
      instagram: "إنستغرام",
      sent: {
        title: "تم إرسال الرسالة.",
        body: "شكرًا لك — وصلت رسالتك بنجاح. نرد خلال يومَي عمل.",
        home: "العودة إلى الرئيسية",
        another: "إرسال رسالة أخرى",
      },
      form: {
        label: "أرسل رسالة",
        name: "اسمك",
        email: "البريد الإلكتروني",
        subject: "الموضوع",
        optional: "اختياري",
        message: "الرسالة",
        placeholder: "اكتب رسالتك…",
        send: "إرسال الرسالة",
        sending: "جارٍ الإرسال…",
        success: "شكرًا — رسالتك في الطريق. نرد خلال يومَي عمل.",
        error: "تعذّر إرسال رسالتك. يرجى المحاولة مرة أخرى بعد قليل.",
        required: "يرجى إضافة اسمك وبريدك الإلكتروني ورسالتك.",
        editor: { toolbar: "التنسيق", bold: "عريض", italic: "مائل", underline: "تحته خط", bulleted: "قائمة نقطية", numbered: "قائمة مرقّمة", clear: "إزالة التنسيق" },
      },
    },
    faq: {
      metaTitle: "الأسئلة الشائعة",
      metaDescription: "أجوبة عن الأسئلة الشائعة حول ديلي إسينشيال: ما هي المجلة، وكيف تشارك ملاحظاتك، ومتى يُفتح السوق.",
      eyebrow: "المساعدة",
      title: "الأسئلة الشائعة",
      questions: [
        { question: "ما هو ديلي إسينشيال؟", answer: "مجلة للأفكار المفيدة والأشياء المدروسة والروتين اليومي." },
        { question: "هل يمكنني مشاركة ملاحظاتي؟", answer: "نعم. تفضّل بزيارة صفحة الاتصال وأرسل لنا رسالة." },
        { question: "هل السوق متاح الآن؟", answer: "إنه قيد الإعداد. انضم إلينا بينما يتطور." },
      ],
    },
    privacy: {
      metaTitle: "سياسة الخصوصية",
      eyebrow: "قانوني",
      title: "سياسة الخصوصية",
      intro: "نحن نحترم خصوصيتك. يجمع هذا الموقع فقط المعلومات التي تختار مشاركتها، مثل اسمك وتعليقك، لتقديم التجربة المطلوبة.",
      sectionTitle: "المعلومات التي تشاركها",
      sectionBody: "عند التواصل معنا أو نشر تعليق، قد تقدّم اسمك ورسالتك. نحن لا نبيع المعلومات الشخصية.",
      backHome: "الرئيسية",
    },
    terms: {
      metaTitle: "شروط الاستخدام",
      eyebrow: "قانوني",
      title: "شروط الاستخدام",
      intro: "باستخدامك ديلي إسينشيال، فإنك توافق على استخدام هذا الموقع بمسؤولية واحترام محتواه ومجتمعه وملكيته الفكرية.",
      sectionTitle: "المحتوى والتوافر",
      sectionBody: "قد نقوم بتحديث المحتوى أو تغييره أو إزالته لإبقاء المجلة مفيدة وحديثة. يُقدَّم المحتوى كمعلومات عامة فقط.",
      backHome: "الرئيسية",
    },
    marketplace: {
      metaTitle: "السوق",
      eyebrow: "السوق",
      title: "أشياء مفيدة، قريبًا.",
      body: "ستجد هنا قريبًا تشكيلة مدروسة من الأشياء اليومية. حتى ذلك الحين، تابع المجلة للملاحظات والأفكار الجديدة.",
      cta: "اقرأ المجلة",
    },
    shop: { metaTitle: "المتجر", title: "المتجر", comingSoon: "قريبًا..." },
    ebooks: {
      metaTitle: "الكتب الإلكترونية",
      title: "الكتب الإلكترونية",
      comingSoon: "قريبًا...",
      eyebrow: "المكتبة",
      intro: "مغامرات مصوّرة للقرّاء الصغار، منشورة على أمازون كيندل وبغلاف ورقي — يُفتح كل عنوان بأمان في متجر أمازون.",
      viewOnAmazon: "عرض على أمازون",
      newRelease: "إصدار جديد",
      ebook: "كتاب إلكتروني",
      paperback: "غلاف ورقي",
      ebookAndPrint: "إلكتروني وورقي",
      ages: "الأعمار",
      amazonNote: "تتم عمليات الشراء والعيّنات والمراجعات عبر أمازون.",
    },
    book: {
      backToLibrary: "كل الكتب",
      details: "تفاصيل الكتاب",
      format: "الصيغة",
      ages: "الأعمار",
      series: "السلسلة",
    },
    reviews: {
      heading: "آراء القرّاء",
      intro: "شاركنا رأيك في هذا الكتاب. تظهر الآراء هنا بعد الموافقة عليها.",
      writeReview: "اكتب رأيًا",
      yourRating: "تقييمك",
      ratingHint: "اختر تقييمًا من نجمة إلى خمس نجوم.",
      name: "اسمك",
      namePlaceholder: "الاسم الظاهر مع رأيك",
      headline: "عنوان الرأي",
      headlinePlaceholder: "لخّص رأيك في كلمات قليلة",
      body: "رأيك",
      bodyPlaceholder: "ما رأيك في القصة والرسوم والشخصيات؟",
      submit: "إرسال الرأي",
      submitting: "جارٍ الإرسال…",
      success: "شكرًا لك — سيظهر رأيك بعد الموافقة عليه.",
      error: "تعذّر حفظ رأيك. حاول مرة أخرى.",
      none: "لا توجد آراء بعد. كن أول من يقيّم هذا الكتاب.",
      loading: "جارٍ تحميل الآراء…",
      unavailable: "الآراء غير متاحة الآن.",
      basedOn: "بناءً على {count} رأيًا",
      outOfFive: "من 5",
      authorResponse: "رد المؤلف",
    },
    author: {
      metaTitle: "دي باكي مورال، المؤلف",
      kicker: "مؤلف وروائي مستقل",
      name: "دي باكي مورال",
      lead: "أبتكر عوالم خيالية وشخصيات لا تُنسى ومغامرات تقرّب القرّاء من سحر القراءة.",
      paragraphs: [
        "دي باكي مورال مؤلف وروائي مستقل شغوف بالخيال والإبداع وفنّ رواية القصص.",
        "من خلال عوالم خيالية وشخصيات لا تُنسى ومغامرات آسرة، يكتب دي باكي مورال كتبًا تُشعل الفضول وتُشجّع على الاستكشاف وتقرّب القرّاء من سحر القراءة.",
        "من قصص الأطفال الآسرة إلى المغامرات الإبداعية والتجارب التعليمية، صُمم كل إصدار ليقدّم شيئًا ذا معنى وممتعًا ولا يُنسى.",
        "بدافع الشغف بالأفكار الأصلية والتعبير الإبداعي، يواصل دي باكي مورال استكشاف قصص واحتمالات جديدة، داعيًا القرّاء من كل الأعمار لاكتشاف شيء استثنائي في كل صفحة.",
      ],
      signature: "كل قصة تبدأ بالخيال.",
      cta: "استكشف المجلة",
    },
    post: {
      allPosts: "كل المقالات",
      aboutAuthor: "عن المؤلف",
      authorBio: "مؤلف وروائي مستقل يبتكر عوالم خيالية لقرّاء من كل الأعمار.",
      contents: "المحتويات",
    },
    comments: {
      heading: "التعليقات", leave: "اترك تعليقًا", yourName: "اسمك", namePlaceholder: "مثال: آدا لافليس",
      yourComment: "تعليقك", commentPlaceholder: "شارك أفكارك أو أسئلتك أو نصيحة برمجية…", submit: "نشر التعليق",
      reviewed: "تتم مراجعة التعليقات قبل نشرها.", empty: "لا توجد تعليقات بعد. كن أول من يشارك في النقاش.",
      loading: "جارٍ تحميل التعليقات…", sending: "جارٍ الإرسال…", saved: "شكرًا — تعليقك في انتظار الموافقة.",
      unavailable: "التعليقات غير متاحة حاليًا.", saveError: "تعذّر حفظ التعليق.",
      editor: { toolbar: "التنسيق", bold: "عريض", italic: "مائل", underline: "تسطير", bulleted: "قائمة نقطية", numbered: "قائمة مرقمة", clear: "إزالة التنسيق" },
    },
    notFound: { title: "هذه الصفحة ضلّت الطريق.", body: "قد يكون الرابط قديمًا، أو لم يُنشر المقال بعد.", cta: "اذهب إلى المجلة" },
    cookie: {
      title: "إعدادات الخصوصية",
      body: "بزيارتك لموقعنا أو استخدامك خدمات ديلي إسينشيال، فإنك توافق على استخدام ملفات تعريف الارتباط والتقنيات المشابهة لتحسين تجربة خدماتنا ووظائفها، وتقديم محتوى مخصص، وفهم كيفية استخدام الموقع. يمكنك تغيير تفضيلاتك في أي وقت.",
      settings: "عرض إعدادات الخصوصية",
      accept: "حسنًا",
    },
  },
};

export function getLocale(value?: string | null): Locale {
  return locales.includes(value as Locale) ? value as Locale : "en";
}

export function localePath(locale: Locale, path = "") {
  return `/${locale}${path}`;
}
