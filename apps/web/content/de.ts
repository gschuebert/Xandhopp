import { ContentSchema } from './schema';

export const de: ContentSchema = {
  meta: {
    title: "Xandhopp - Ihr perfekter Umzug weltweit",
    description: "Erleben Sie nahtlose globale Umzüge mit einer vertrauenswürdigen Plattform. Vergleichen Sie Länder, verstehen Sie Anforderungen und treffen Sie die richtige Entscheidung mit Klarheit und Vertrauen.",
    keywords: "umzug, globaler umzug, visum, länder, einwanderung, expat"
  },

  nav: {
    home: "Startseite",
    countries: "Länder",
    compare: "Vergleichen", 
    wizard: "Assistent",
    signin: "Anmelden",
    login: "Anmelden",
    register: "Registrieren",
    profile: "Profil",
    signOut: "Abmelden",
    languageToggle: {
      en: "EN",
      de: "DE"
    }
  },

  countries: {
    title: "Länder erkunden",
    subtitle: "Entdecken Sie Länder und US-Bundesstaaten mit detaillierten Informationen",
    searchPlaceholder: "Länder oder Bundesstaaten suchen...",
    searchButton: "Suchen",
    clearButton: "Löschen",
    noResults: "Keine Ergebnisse gefunden",
    loading: "Lade...",
    backToSearch: "← Zurück zur Suche",
    backToCountrySearch: "← Zurück zur Ländersuche",
    overview: "Überblick",
    culture: "Kultur",
    economy: "Wirtschaft",
    history: "Geschichte",
    demography: "Demografie",
    liveData: "Live-Daten",
    fxRates: "Wechselkurse",
    travelAdvisory: "Reisehinweise",
    metrics: "Besonderheiten",
    famousFood: "Berühmte Gerichte",
    famousLandmark: "Sehenswürdigkeiten",
    famousPerson: "Berühmte Persönlichkeiten",
    stateMotto: "Staatsmotto",
    stateFlower: "Staatsblume",
    stateBird: "Staatsvogel",
    stateTree: "Staatsbaum",
    nickname: "Spitzname",
    timeZone: "Zeitzone",
    drivingSide: "Fahrseite"
  },

  hero: {
    title: "Ihr perfekter Umzug",
    subtitle: "weltweit",
    description: "Navigieren Sie globale Umzüge mit Vertrauen. Expertenberatung, Echtzeitdaten und personalisierte Unterstützung für Ihren internationalen Umzug.",
    ctaPrimary: "Reise starten",
    ctaSecondary: "Demo ansehen",
    stats: {
      countries: "50+",
      countriesLabel: "Länder abgedeckt",
      relocations: "10K+",
      relocationsLabel: "Erfolgreiche Umzüge",
      support: "24/7",
      supportLabel: "Experten-Support"
    }
  },

  problem: {
    headline: "Umzug sollte nicht so",
    subtitle: "kompliziert sein",
    description: "Ein Umzug in ein neues Land ist eine der größten Entscheidungen im Leben, aber der Prozess ist oft voller Hindernisse, die ihn unnötig schwierig machen.",
    problems: [
      {
        title: "Zeitaufwändige Recherche",
        description: "Stunden damit verbracht, Visumsanforderungen, Dokumentation und rechtliche Verfahren in verschiedenen Ländern zu recherchieren.",
        icon: "clock"
      },
      {
        title: "Versteckte Kosten",
        description: "Unerwartete Gebühren, Währungsschwankungen und versteckte Ausgaben, die Ihr Budget sprengen.",
        icon: "dollar-sign"
      },
      {
        title: "Komplexe Papierkram",
        description: "Überwältigende Dokumentationsanforderungen, Formulare und bürokratische Hürden.",
        icon: "file-text"
      },
      {
        title: "Kulturelle Barrieren",
        description: "Sprachbarrieren, kulturelle Unterschiede und mangelndes lokales Wissen.",
        icon: "globe"
      },
      {
        title: "Unzuverlässige Dienstleister",
        description: "Inkonsistente Servicequalität, mangelnde Transparenz und schlechte Kommunikation.",
        icon: "users"
      },
      {
        title: "Rechtliche Risiken",
        description: "Compliance-Probleme, Visumsablehnungen und rechtliche Komplikationen, die Ihre Pläne durchkreuzen können.",
        icon: "shield"
      }
    ],
    cta: "Klingt bekannt? Sie sind nicht allein."
  },

  solution: {
    headline: "Wir machen Umzug",
    subtitle: "mühelos",
    description: "Unsere umfassende Plattform kombiniert Technologie, Expertise und personalisierten Service, um Ihre Umzugserfahrung von stressig zu nahtlos zu verwandeln.",
    solutions: [
      {
        title: "Globale Expertise",
        description: "Zugang zu lokalen Experten in 50+ Ländern mit tiefem Wissen über Einwanderungsgesetze und -verfahren.",
        icon: "globe"
      },
      {
        title: "Risikominderung",
        description: "Umfassende Compliance-Prüfungen und rechtliche Beratung zur Minimierung von Risiken und Gewährleistung reibungsloser Übergänge.",
        icon: "shield"
      },
      {
        title: "Personalisierte Unterstützung",
        description: "Dedizierte Umzugsspezialisten, die Ihre einzigartigen Bedürfnisse verstehen und maßgeschneiderte Lösungen bieten.",
        icon: "users"
      },
      {
        title: "Optimierter Prozess",
        description: "Automatisierte Workflows und digitale Tools, die komplexe Verfahren vereinfachen und Ihnen Zeit sparen.",
        icon: "zap"
      },
      {
        title: "Transparente Preise",
        description: "Klare, vorausschauende Kosten ohne versteckte Gebühren. Wissen Sie genau, wofür Sie von Tag eins an bezahlen.",
        icon: "check-circle"
      },
      {
        title: "Laufende Unterstützung",
        description: "Kontinuierliche Hilfe auch nach Ihrem Umzug, die Ihnen hilft, sich einzuleben und in Ihrem neuen Zuhause zu gedeihen.",
        icon: "heart"
      }
    ],
    cta: "Bereit, den Unterschied zu erleben?"
  },

  features: {
    headline: "Alles was Sie für einen",
    subtitle: "erfolgreichen Umzug brauchen",
    description: "Unsere umfassende Suite von Tools und Services deckt jeden Aspekt Ihres internationalen Umzugs ab, von der ersten Recherche bis zur Unterstützung nach dem Umzug.",
    items: [
      {
        title: "Länder-Intelligenz",
        description: "Umfassende Daten zu Visumsanforderungen, Lebenshaltungskosten und Lebensqualitätsmetriken.",
        icon: "map-pin"
      },
      {
        title: "Dokumentenverwaltung", 
        description: "Digitale Dokumentenspeicherung und automatisierte Checklistenverwaltung für all Ihre Unterlagen.",
        icon: "file-text"
      },
      {
        title: "Kostenrechner",
        description: "Echtzeit-Kostenschätzungen einschließlich Steuern, Gebühren und Lebenshaltungskosten für Ihr Zielland.",
        icon: "calculator"
      },
      {
        title: "Expertenberatung",
        description: "Direkter Zugang zu Einwanderungsanwälten und Umzugsspezialisten über Chat und Videoanrufe.",
        icon: "message-circle"
      },
      {
        title: "Zeitplanung",
        description: "Personalisierte Zeitpläne mit Meilenstein-Tracking und Fristenerinnerungen.",
        icon: "clock"
      },
      {
        title: "Compliance-Überwachung",
        description: "Automatisierte Compliance-Prüfungen und Überwachung rechtlicher Anforderungen während Ihrer Reise.",
        icon: "shield"
      },
      {
        title: "Mehrsprachiger Support",
        description: "Unterstützung in mehreren Sprachen für nahtlose Kommunikation in Ihrer bevorzugten Sprache.",
        icon: "globe"
      },
      {
        title: "Community-Netzwerk",
        description: "Verbinden Sie sich mit anderen Expats und lokalen Gemeinschaften in Ihrem Zielland.",
        icon: "users"
      }
    ]
  },

  howItWorks: {
    headline: "So funktioniert es",
    steps: [
      {
        title: "Teilen Sie uns Ihre Prioritäten mit",
        description: "Teilen Sie Ihr Budget, Ihre Präferenzen und Anforderungen über unseren intelligenten Fragebogen mit"
      },
      {
        title: "Vergleichen und erstellen Sie eine Auswahl", 
        description: "Erhalten Sie personalisierte Empfehlungen basierend auf Ihren Kriterien und vergleichen Sie Optionen nebeneinander"
      },
      {
        title: "Folgen Sie einer geführten Checkliste zur Umsetzung",
        description: "Schritt-für-Schritt-Anleitung durch Visumsanträge, Papierkram und Umzugslogistik"
      }
    ]
  },

  teasers: {
    countries: {
      headline: "Länder erkunden",
      description: "Durchsuchen Sie detaillierte Profile von 50+ Ländern mit Visumsanforderungen, Kosten und Lebensbedingungen.",
      cta: "Erkunden →"
    },
    compare: {
      headline: "Seite an Seite vergleichen", 
      description: "Vergleichen Sie mehrere Ziele über alle Faktoren, die für Ihren perfekten Umzug wichtig sind.",
      cta: "Vergleichen →"
    },
    wizard: {
      headline: "Umzugs-Assistent",
      description: "Erhalten Sie personalisierte Empfehlungen basierend auf Ihren Prioritäten und Umständen.",
      cta: "Assistent starten →"
    }
  },

  trust: {
    headline: "Vertraut von Umziehern weltweit",
    testimonials: [
      {
        quote: "Xandhopp hat meinen Umzug nach Portugal unglaublich reibungslos gemacht. Alle Informationen an einem Ort zu haben hat mir Monate der Recherche erspart.",
        author: "Sarah Chen",
        role: "Software-Ingenieurin"
      },
      {
        quote: "Die Visumsberatung war punktgenau. Ich wünschte, ich hätte Xandhopp vor meinem ersten gescheiterten Umzugsversuch gefunden.",
        author: "Marcus Schmidt", 
        role: "Digitaler Nomade"
      },
      {
        quote: "Endlich eine Plattform, die die Komplexität internationaler Umzüge versteht. Ein Wendepunkt!",
        author: "Elena Rodriguez",
        role: "Unternehmerin"
      }
    ]
  },

  cta: {
    headline: "Bereit, Ihre",
    subtitle: "Umzugsreise zu starten?",
    description: "Treten Sie Tausenden erfolgreichen Umziehern bei, die Xandhopp vertrauen, um sie zu ihrem perfekten Ziel zu führen.",
    emailPlaceholder: "E-Mail-Adresse eingeben",
    button: "Loslegen",
    benefits: [
      "Kostenlose Umzugsbewertung",
      "Personalisierte Länderempfehlungen", 
      "Exklusiver Zugang zu Expertenberatungen",
      "Früher Zugang zu neuen Funktionen"
    ],
    trustedBy: "Vertraut von Fachkräften führender Unternehmen",
    companies: ["Google", "Microsoft", "Amazon", "Meta"],
    successMessage: "Danke! Wir melden uns bald bei Ihnen.",
    errorMessage: "Bitte geben Sie eine gültige E-Mail-Adresse ein."
  },

  footer: {
    description: "Ihr vertrauenswürdiger Partner für nahtlose internationale Umzüge. Globale Umzüge einfach, transparent und stressfrei machen.",
    contact: {
      email: "hello@xandhopp.com",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA"
    },
    sections: {
      product: {
        title: "Produkt",
        links: {
          countries: "Länder",
          visas: "Visumstypen",
          calculator: "Kostenrechner",
          documents: "Dokumentenleitfaden"
        }
      },
      support: {
        title: "Support",
        links: {
          help: "Hilfe-Center",
          contact: "Kontakt",
          chat: "Live-Chat",
          status: "Status-Seite"
        }
      },
      company: {
        title: "Unternehmen",
        links: {
          about: "Über uns",
          careers: "Karriere",
          press: "Presse",
          partners: "Partner"
        }
      },
      legal: {
        title: "Rechtliches",
        links: {
          privacy: "Datenschutz",
          terms: "Nutzungsbedingungen",
          cookies: "Cookie-Richtlinie",
          gdpr: "DSGVO"
        }
      }
    },
    copyright: "© 2025 Xandhopp. Alle Rechte vorbehalten."
  },

  placeholders: {
    comingSoon: "Demnächst verfügbar",
    backToHome: "← Zurück zur Startseite"
  },

  forms: {
    register: {
      title: "Konto erstellen",
      subtitle: "Treten Sie Xandhopp bei und starten Sie Ihre Umzugsreise",
      firstName: "Vorname",
      lastName: "Nachname",
      email: "E-Mail-Adresse",
      password: "Passwort",
      confirmPassword: "Passwort bestätigen",
      acceptTerms: "Ich stimme den",
      termsOfService: "Nutzungsbedingungen",
      and: "und",
      privacyPolicy: "Datenschutzrichtlinie",
      createAccount: "Konto erstellen",
      creatingAccount: "Konto wird erstellt...",
      alreadyHaveAccount: "Haben Sie bereits ein Konto?",
      signIn: "Anmelden",
      checkEmail: "E-Mail prüfen",
      emailSent: "Wir haben einen Bestätigungslink an",
      sent: "gesendet. Bitte klicken Sie auf den Link, um Ihr Konto zu bestätigen.",
      goToSignIn: "Zur Anmeldung",
      passwordRequirements: {
        minLength: "Mindestens 8 Zeichen",
        uppercase: "Ein Großbuchstabe",
        lowercase: "Ein Kleinbuchstabe",
        number: "Eine Zahl",
        specialChar: "Ein Sonderzeichen"
      },
      passwordsMatch: "✓ Passwörter stimmen überein",
      passwordsDoNotMatch: "✗ Passwörter stimmen nicht überein",
      errors: {
        passwordsDoNotMatch: "Passwörter stimmen nicht überein",
        passwordRequirements: "Passwort erfüllt nicht die Anforderungen",
        acceptTerms: "Bitte akzeptieren Sie die Nutzungsbedingungen",
        registrationFailed: "Registrierung fehlgeschlagen",
        networkError: "Netzwerkfehler. Bitte versuchen Sie es erneut."
      },
      success: {
        accountCreated: "Konto erfolgreich erstellt!"
      }
    },
    login: {
      title: "Willkommen zurück",
      subtitle: "Melden Sie sich in Ihrem Konto an",
      email: "E-Mail-Adresse",
      password: "Passwort",
      signIn: "Anmelden",
      signingIn: "Anmeldung läuft...",
      dontHaveAccount: "Haben Sie noch kein Konto?",
      createAccount: "Konto erstellen",
      errors: {
        loginFailed: "Anmeldung fehlgeschlagen",
        networkError: "Netzwerkfehler. Bitte versuchen Sie es erneut."
      },
      success: {
        loginSuccessful: "Anmeldung erfolgreich!"
      }
    },
    profile: {
      title: "Profil-Einstellungen",
      subtitle: "Verwalten Sie Ihre Kontoinformationen und Einstellungen",
      tabs: {
        personal: "Persönlich",
        location: "Standort",
        professional: "Beruflich",
        settings: "Einstellungen"
      },
      personal: {
        firstName: "Vorname",
        lastName: "Nachname",
        email: "E-Mail-Adresse",
        emailCannotBeChanged: "E-Mail kann nicht geändert werden",
        dateOfBirth: "Geburtsdatum",
        nationality: "Staatsangehörigkeit",
        selectNationality: "Wählen Sie Ihre Staatsangehörigkeit",
        bio: "Biografie",
        bioPlaceholder: "Erzählen Sie uns etwas über sich..."
      },
      location: {
        currentCountry: "Aktuelles Land",
        selectCurrentCountry: "Wählen Sie Ihr aktuelles Land",
        currentCity: "Aktuelle Stadt",
        addressDetails: "Adressdetails",
        addressLine1: "Adresszeile 1",
        addressLine2: "Adresszeile 2",
        city: "Stadt",
        state: "Bundesland/Provinz",
        postalCode: "Postleitzahl",
        country: "Land",
        selectCountry: "Land auswählen"
      },
      professional: {
        profession: "Beruf",
        company: "Unternehmen",
        website: "Website",
        linkedin: "LinkedIn-Profil"
      },
      settings: {
        preferredLanguage: "Bevorzugte Sprache",
        timezone: "Zeitzone",
        emailPreferences: "E-Mail-Einstellungen",
        receiveNotifications: "Wichtige Kontobenachrichtigungen erhalten",
        receiveMarketing: "Marketing-E-Mails und Updates erhalten",
        makeProfilePublic: "Mein Profil öffentlich machen"
      },
      saveChanges: "Änderungen speichern",
      saving: "Speichern...",
      errors: {
        updateFailed: "Profil konnte nicht aktualisiert werden",
        networkError: "Netzwerkfehler. Bitte versuchen Sie es erneut."
      },
      success: {
        profileUpdated: "Profil erfolgreich aktualisiert!"
      }
    },
    countries: {
      germany: "Deutschland",
      unitedStates: "Vereinigte Staaten",
      unitedKingdom: "Vereinigtes Königreich",
      france: "Frankreich",
      italy: "Italien",
      spain: "Spanien",
      netherlands: "Niederlande",
      switzerland: "Schweiz",
      austria: "Österreich",
      canada: "Kanada",
      australia: "Australien",
      other: "Andere"
    }
  },

  continents: {
    all: "Alle Kontinente",
    asia: "Asien",
    europe: "Europa",
    northAmerica: "Nordamerika",
    southAmerica: "Südamerika",
    africa: "Afrika",
    oceania: "Ozeanien",
    antarctica: "Antarktis"
  }
};