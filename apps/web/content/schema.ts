export interface ContentSchema {
  // Site meta
  meta: {
    title: string;
    description: string;
    keywords: string;
  };

  // Navigation
  nav: {
    home: string;
    countries: string;
    compare: string;
    wizard: string;
    signin: string;
    register: string;
    profile: string;
    signOut: string;
    languageToggle: {
      en: string;
      de: string;
    };
  };

  // Countries page
  countries: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    searchButton: string;
    clearButton: string;
    noResults: string;
    loading: string;
    backToSearch: string;
    backToCountrySearch: string;
    overview: string;
    culture: string;
    economy: string;
    history: string;
    demography: string;
    liveData: string;
    fxRates: string;
    travelAdvisory: string;
    metrics: string;
    famousFood: string;
    famousLandmark: string;
    famousPerson: string;
    stateMotto: string;
    stateFlower: string;
    stateBird: string;
    stateTree: string;
    nickname: string;
    timeZone: string;
    drivingSide: string;
  };

  // Hero section
  hero: {
    title: string;
    subtitle: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
    stats: {
      countries: string;
      countriesLabel: string;
      relocations: string;
      relocationsLabel: string;
      support: string;
      supportLabel: string;
    };
  };

  // Problem section
  problem: {
    headline: string;
    subtitle: string;
    description: string;
    problems: {
      title: string;
      description: string;
      icon: string;
    }[];
    cta: string;
  };

  // Solution section
  solution: {
    headline: string;
    subtitle: string;
    description: string;
    solutions: {
      title: string;
      description: string;
      icon: string;
    }[];
    cta: string;
  };

  // Features section
  features: {
    headline: string;
    subtitle: string;
    description: string;
    items: {
      title: string;
      description: string;
      icon: string;
    }[];
  };

  // How it works section
  howItWorks: {
    headline: string;
    steps: {
      title: string;
      description: string;
    }[];
  };

  // Teasers
  teasers: {
    countries: {
      headline: string;
      description: string;
      cta: string;
    };
    compare: {
      headline: string;
      description: string;
      cta: string;
    };
    wizard: {
      headline: string;
      description: string;
      cta: string;
    };
  };

  // Trust/Testimonials section
  trust: {
    headline: string;
    testimonials: {
      quote: string;
      author: string;
      role: string;
    }[];
  };

  // CTA section
  cta: {
    headline: string;
    subtitle: string;
    description: string;
    emailPlaceholder: string;
    button: string;
    benefits: string[];
    trustedBy: string;
    companies: string[];
    successMessage: string;
    errorMessage: string;
  };

  // Footer
  footer: {
    description: string;
    contact: {
      email: string;
      phone: string;
      location: string;
    };
    sections: {
      product: {
        title: string;
        links: {
          countries: string;
          visas: string;
          calculator: string;
          documents: string;
        };
      };
      support: {
        title: string;
        links: {
          help: string;
          contact: string;
          chat: string;
          status: string;
        };
      };
      company: {
        title: string;
        links: {
          about: string;
          careers: string;
          press: string;
          partners: string;
        };
      };
      legal: {
        title: string;
        links: {
          privacy: string;
          terms: string;
          cookies: string;
          gdpr: string;
        };
      };
    };
    copyright: string;
  };

  // Placeholder pages
  placeholders: {
    comingSoon: string;
    backToHome: string;
  };

  // Form translations
  forms: {
    register: {
      title: string;
      subtitle: string;
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      confirmPassword: string;
      acceptTerms: string;
      termsOfService: string;
      and: string;
      privacyPolicy: string;
      createAccount: string;
      creatingAccount: string;
      alreadyHaveAccount: string;
      signIn: string;
      checkEmail: string;
      emailSent: string;
      sent: string;
      goToSignIn: string;
      passwordRequirements: {
        minLength: string;
        uppercase: string;
        lowercase: string;
        number: string;
        specialChar: string;
      };
      passwordsMatch: string;
      passwordsDoNotMatch: string;
      errors: {
        passwordsDoNotMatch: string;
        passwordRequirements: string;
        acceptTerms: string;
        registrationFailed: string;
        networkError: string;
      };
      success: {
        accountCreated: string;
      };
    };
    login: {
      title: string;
      subtitle: string;
      email: string;
      password: string;
      signIn: string;
      signingIn: string;
      dontHaveAccount: string;
      createAccount: string;
      errors: {
        loginFailed: string;
        networkError: string;
      };
      success: {
        loginSuccessful: string;
      };
    };
    profile: {
      title: string;
      subtitle: string;
      tabs: {
        personal: string;
        location: string;
        professional: string;
        settings: string;
      };
      personal: {
        firstName: string;
        lastName: string;
        email: string;
        emailCannotBeChanged: string;
        dateOfBirth: string;
        nationality: string;
        selectNationality: string;
        bio: string;
        bioPlaceholder: string;
      };
      location: {
        currentCountry: string;
        selectCurrentCountry: string;
        currentCity: string;
        addressDetails: string;
        addressLine1: string;
        addressLine2: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        selectCountry: string;
      };
      professional: {
        profession: string;
        company: string;
        website: string;
        linkedin: string;
      };
      settings: {
        preferredLanguage: string;
        timezone: string;
        emailPreferences: string;
        receiveNotifications: string;
        receiveMarketing: string;
        makeProfilePublic: string;
      };
      saveChanges: string;
      saving: string;
      errors: {
        updateFailed: string;
        networkError: string;
      };
      success: {
        profileUpdated: string;
      };
    };
    countries: {
      germany: string;
      unitedStates: string;
      unitedKingdom: string;
      france: string;
      italy: string;
      spain: string;
      netherlands: string;
      switzerland: string;
      austria: string;
      canada: string;
      australia: string;
      other: string;
    };
  };

  continents: {
    all: string;
    asia: string;
    europe: string;
    northAmerica: string;
    southAmerica: string;
    africa: string;
    oceania: string;
    antarctica: string;
  };
}
