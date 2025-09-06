import { ContentSchema } from './schema';

export const en: ContentSchema = {
  meta: {
    title: "PORTALIS - Your perfect move worldwide",
    description: "Experience seamless global relocation with one trusted platform. Compare countries, understand requirements, and make the right move with clarity and confidence.",
    keywords: "relocation, global move, visa, countries, immigration, expat"
  },

  nav: {
    countries: "Countries",
    compare: "Compare", 
    wizard: "Wizard",
    login: "Login",
    languageToggle: {
      en: "EN",
      de: "DE"
    }
  },

  hero: {
    title: "PORTALIS",
    subtitle: "Your perfect move worldwide", 
    description: "Experience seamless global relocation with one trusted platform. Compare countries, understand requirements, and make the right move with clarity and confidence.",
    ctaPrimary: "Login",
    ctaSecondary: "Discover More"
  },

  problem: {
    headline: "Relocation is chaos",
    bullets: [
      "Scattered information across dozens of sources",
      "Conflicting rules and outdated guidance", 
      "Hidden costs and unexpected risks",
      "Too many forms, too little clear direction"
    ]
  },

  solution: {
    headline: "Everything in one place",
    description: "Portalis aggregates official sources, expert insights, and real-time updates—so you can plan once and act with certainty. No more guesswork, just informed decisions."
  },

  features: {
    headline: "Everything you need to relocate",
    items: [
      {
        title: "Countries Database",
        description: "Comprehensive profiles with visa requirements, costs, and living conditions",
        icon: "globe"
      },
      {
        title: "Visa & Residency Guidance", 
        description: "Step-by-step processes for different visa types and residency paths",
        icon: "file-text"
      },
      {
        title: "Cost of Living Analysis",
        description: "Real-time data on housing, utilities, healthcare, and daily expenses",
        icon: "dollar-sign"
      },
      {
        title: "Safety & Healthcare",
        description: "Security levels, healthcare quality, and insurance requirements",
        icon: "shield"
      },
      {
        title: "Taxes & Business Formation",
        description: "Tax obligations, business setup processes, and legal requirements",
        icon: "briefcase"
      },
      {
        title: "Community & Services",
        description: "Connect with expat communities and essential service providers",
        icon: "users"
      }
    ]
  },

  howItWorks: {
    headline: "How it works",
    steps: [
      {
        title: "Tell us your priorities",
        description: "Share your budget, preferences, and requirements through our smart questionnaire"
      },
      {
        title: "Compare and shortlist countries", 
        description: "Get personalized recommendations based on your criteria and compare options side-by-side"
      },
      {
        title: "Follow a guided checklist to execution",
        description: "Step-by-step guidance through visa applications, paperwork, and relocation logistics"
      }
    ]
  },

  teasers: {
    countries: {
      headline: "Explore Countries",
      description: "Browse detailed profiles of 50+ countries with visa requirements, costs, and living conditions.",
      cta: "Explore →"
    },
    compare: {
      headline: "Compare Side-by-Side", 
      description: "Compare multiple destinations across all factors that matter for your perfect move.",
      cta: "Compare →"
    },
    wizard: {
      headline: "Relocation Wizard",
      description: "Get personalized recommendations based on your priorities and circumstances.",
      cta: "Start Wizard →"
    }
  },

  trust: {
    headline: "Trusted by relocators worldwide",
    testimonials: [
      {
        quote: "Portalis made my move to Portugal incredibly smooth. Having all the information in one place saved me months of research.",
        author: "Sarah Chen",
        role: "Software Engineer"
      },
      {
        quote: "The visa guidance was spot-on. I wish I had found Portalis before my first failed attempt at relocating.",
        author: "Marcus Schmidt", 
        role: "Digital Nomad"
      },
      {
        quote: "Finally, a platform that understands the complexity of international relocation. Game-changer!",
        author: "Elena Rodriguez",
        role: "Entrepreneur"
      }
    ]
  },

  cta: {
    headline: "Be first to move right",
    subtitle: "Join the Early Access list and get priority access to Portalis when we launch",
    emailPlaceholder: "you@domain.com",
    button: "Get Early Access",
    successMessage: "Thanks! We'll be in touch soon.",
    errorMessage: "Please enter a valid email address."
  },

  footer: {
    description: "Your trusted partner for seamless global relocations. Making your perfect move worldwide, one journey at a time.",
    links: {
      privacy: "Privacy Policy",
      terms: "Terms of Service", 
      contact: "Contact"
    },
    copyright: "© 2024 Portalis. All rights reserved."
  },

  placeholders: {
    comingSoon: "Coming Soon",
    backToHome: "← Back to Home"
  }
};
