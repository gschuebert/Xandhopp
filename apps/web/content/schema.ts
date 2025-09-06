export interface ContentSchema {
  // Site meta
  meta: {
    title: string;
    description: string;
    keywords: string;
  };

  // Navigation
  nav: {
    countries: string;
    compare: string;
    wizard: string;
    login: string;
    languageToggle: {
      en: string;
      de: string;
    };
  };

  // Hero section
  hero: {
    title: string;
    subtitle: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };

  // Problem section
  problem: {
    headline: string;
    bullets: string[];
  };

  // Solution section
  solution: {
    headline: string;
    description: string;
  };

  // Features section
  features: {
    headline: string;
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
    emailPlaceholder: string;
    button: string;
    successMessage: string;
    errorMessage: string;
  };

  // Footer
  footer: {
    description: string;
    links: {
      privacy: string;
      terms: string;
      contact: string;
    };
    copyright: string;
  };

  // Placeholder pages
  placeholders: {
    comingSoon: string;
    backToHome: string;
  };
}
