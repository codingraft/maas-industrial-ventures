export type HeroSlide = {
  id: string;
  src: string;
  alt: string;
  eyebrow?: string;
  title: string;
  subtitle: string;
};

export type MasterPlanItem = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  src: string;
  alt: string;
  tag?: string;
};

export type GalleryCategory = {
  id: string;
  label: string;
};

export type GalleryItem = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  category: string;
  className?: string;
};

export type SectionImage = {
  src: string;
  alt: string;
  caption?: string;
};

export type FactItem = {
  id: string;
  label: string;
  value: string;
};

export type HighlightItem = {
  id: string;
  index: string;
  title: string;
  value: string;
  note: string;
};

export type TimelineMilestone = {
  id: string;
  phase: string;
  title: string;
  description: string;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type Lead = {
  id: number | string;
  name: string;
  phone: string;
  email: string;
  industry: string;
  requirement: string;
  message: string;
  status: "new" | "contacted" | "qualified" | "converted" | "archived";
  notes: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string;
  utm_content: string;
  gclid: string;
  fbclid: string;
  created_at: string;
};

export type SeoSettings = {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  twitterCard: "summary" | "summary_large_image";
  twitterHandle: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  googleSiteVerification: string;
  bingSiteVerification: string;
  structuredDataEnabled: boolean;
};

export type SiteSettings = {
  site_info: {
    brandName: string;
    shortName: string;
    tagline: string;
    subheadline: string;
    introduction: string;
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    brochureUrl: string;
  };
  sections: {
    hero: boolean;
    facts: boolean;
    overview: boolean;
    highlights: boolean;
    infrastructure: boolean;
    masterplan: boolean;
    location: boolean;
    gallery: boolean;
    timeline: boolean;
    faq: boolean;
    enquire: boolean;
  };
  social_links: {
    linkedin: string;
    instagram: string;
    facebook: string;
    twitter: string;
    youtube: string;
  };
  media: {
    logo: string;
    hero: string;
    overview: string;
    heroSlides: HeroSlide[];
    overviewImage: SectionImage;
    infraImage: SectionImage;
    masterplanImage: SectionImage;
    masterplanPlans: MasterPlanItem[];
    locationImage: SectionImage;
    gallery: GalleryItem[];
    galleryCategories: GalleryCategory[];
  };
  tracking: {
    gtmId: string;
    googleAdsId: string;
    metaPixelId: string;
  };
  seo: SeoSettings;
  content: {
    facts: FactItem[];
    highlights: HighlightItem[];
    timeline: TimelineMilestone[];
    faqs: FaqItem[];
  };
};

export const defaultContent: SiteSettings["content"] = {
  facts: [
    { id: "fact-1", label: "Development Zone", value: "Master Industrial Park" },
    { id: "fact-2", label: "Connectivity", value: "Direct NH Corridor Access" },
    { id: "fact-3", label: "Zoning Status", value: "Clear Industry Approvals" },
    { id: "fact-4", label: "Space Typology", value: "Plots & Built-to-Suit" },
  ],
  highlights: [
    {
      id: "hl-1",
      index: "01",
      title: "Zoning & Land Tenure",
      value: "Freehold Industrial Title",
      note: "Verified clear commercial documentation",
    },
    {
      id: "hl-2",
      index: "02",
      title: "Power Infrastructure",
      value: "Dedicated HT Dual Grid Feeders",
      note: "High-capacity uninterrupted supply",
    },
    {
      id: "hl-3",
      index: "03",
      title: "Circulation & Access",
      value: "Heavy Freight Arterial Concrete Roads",
      note: "Engineered for 40ft multi-axle freight trailers",
    },
    {
      id: "hl-4",
      index: "04",
      title: "Statutory Approvals",
      value: "Fast-Track Single Window Approvals",
      note: "Comprehensive statutory clearance dossiers",
    },
  ],
  timeline: [
    {
      id: "tm-1",
      phase: "PHASE 01 / ALLOCATION",
      title: "Land Allotment & Civil Infrastructure",
      description: "Plot boundaries demarcation, concrete road network completion, and boundary security deployment.",
    },
    {
      id: "tm-2",
      phase: "PHASE 02 / UTILITIES",
      title: "Power Substations & Water Lines",
      description: "HT electricity energization, high-capacity water connection, and telecom optical fiber laying.",
    },
    {
      id: "tm-3",
      phase: "PHASE 03 / COMMISSIONING",
      title: "Built-to-Suit Handover & Operations",
      description: "Full occupier operations commencement with dedicated park administration and security.",
    },
  ],
  faqs: [
    {
      id: "faq-1",
      question: "What plot sizes and warehouse configurations are available?",
      answer: "MAAS Industrial Ventures accommodates requirements from 2-acre discrete manufacturing plots up to 50+ acre custom enterprise industrial and logistics campuses. Contact the team for the current verified availability schedule.",
    },
    {
      id: "faq-2",
      question: "Which industrial categories and zoning permissions apply?",
      answer: "Zoning accommodates clean manufacturing, engineering, heavy assembly, warehousing, cold-chain, and logistics operations with fast-track clearances. Contact us for exact classification documents.",
    },
    {
      id: "faq-3",
      question: "What power, water, and road infrastructure is delivered?",
      answer: "Direct dedicated high-tension (HT) industrial feeder lines, high-capacity dual water supplies, storm drainage, heavy-duty internal concrete arterial roads designed for multi-axle freight vehicles.",
    },
    {
      id: "faq-4",
      question: "Where is the development strategically situated?",
      answer: "Positioned along prime industrial freight corridors with direct access to national highways, dedicated freight corridors, and key cargo ports for seamless regional and global distribution.",
    },
    {
      id: "faq-5",
      question: "What regulatory approvals and title verifications are in place?",
      answer: "Clear, unencumbered freehold land titles with complete master development sanctions. Verified due-diligence dossiers and master plans are provided upon registration.",
    },
    {
      id: "faq-6",
      question: "How can I arrange a private site visit or discuss commercial terms?",
      answer: "Submit your specifications via the enquiry form, call our project desk directly, or connect via WhatsApp for an executive presentation and escorted site inspection.",
    },
  ],
};

export const defaultMedia: SiteSettings["media"] = {
  logo: "/images/maas-logo-white.svg",
  hero: "https://images.unsplash.com/photo-1758304481470-e575d1d44efa?auto=format&fit=crop&w=2400&q=85",
  overview: "https://images.unsplash.com/photo-1567789884554-0b844b597180?auto=format&fit=crop&w=2200&q=85",
  heroSlides: [
    {
      id: "slide-1",
      src: "https://images.unsplash.com/photo-1758304481470-e575d1d44efa?auto=format&fit=crop&w=2400&q=85",
      alt: "Aerial view of high-capacity industrial park and national highway",
      eyebrow: "MAAS INDUSTRIAL VENTURES / INFRASTRUCTURE",
      title: "Built for industry. Designed for what's next.",
      subtitle: "High-capacity, infrastructure-ready industrial addresses engineered for modern manufacturing and scalable growth.",
    },
    {
      id: "slide-2",
      src: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=2400&q=85",
      alt: "Advanced precision manufacturing and automation floor",
      eyebrow: "PRECISION ENGINEERING & LOGISTICS",
      title: "Uncompromising capacity. Dependable power & utilities.",
      subtitle: "Dedicated high-tension power feeders, high-cube structural clear heights, and heavy multi-axle freight road networks.",
    },
    {
      id: "slide-3",
      src: "https://images.unsplash.com/photo-1567789884554-0b844b597180?auto=format&fit=crop&w=2400&q=85",
      alt: "Modern high-cube distribution logistics terminal",
      eyebrow: "MULTI-MODAL FREIGHT CONNECTIVITY",
      title: "Direct national freight corridor access.",
      subtitle: "Zero-friction cargo movement with immediate expressway, cargo rail, and maritime port connectivity.",
    },
  ],
  overviewImage: {
    src: "https://images.unsplash.com/photo-1567789884554-0b844b597180?auto=format&fit=crop&w=2200&q=85",
    alt: "Modern industrial warehouse interior",
    caption: "MAAS Industrial Ventures · Engineering & High-Cube Logistics",
  },
  infraImage: {
    src: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=82",
    alt: "Engineer reviewing plant machinery",
    caption: "Industrial operations & robust utility infrastructure",
  },
  masterplanImage: {
    src: "",
    alt: "Master Plan blueprint",
    caption: "Official master plan layout and zoning division blueprint",
  },
  masterplanPlans: [
    {
      id: "plan-1",
      title: "Overall Zoning & Master Layout",
      subtitle: "Macro sectoral demarcation & green buffer perimeter",
      description: "Comprehensive 150+ acre industrial township master layout with zoned clusters for heavy manufacturing, light assembly, and logistics warehousing.",
      src: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=85",
      alt: "Overall Master Plan Layout & Zoning Blueprint",
      tag: "Phase 1 & 2 Blueprint",
    },
    {
      id: "plan-2",
      title: "Phase 1 Industrial Plot Demarcation",
      subtitle: "Modular plots from 2.5 to 25 acres with clear setbacks",
      description: "Engineered plot division matrix optimized for build-to-suit manufacturing units, standard design factories (SDF), and expandable footprints.",
      src: "https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=1600&q=85",
      alt: "Phase 1 Industrial Plot Grid",
      tag: "Plot Demarcation Grid",
    },
    {
      id: "plan-3",
      title: "Utility Corridors & Arterial Road Grid",
      subtitle: "45m primary arterial spines & dedicated 33/11kV substations",
      description: "Dedicated heavy vehicle freight transit spines, internal storm water drainage networks, underground utility trenches, and dedicated industrial substations.",
      src: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1600&q=85",
      alt: "Utility Corridors & Road Arteries",
      tag: "Infrastructure Matrix",
    },
  ],
  galleryCategories: [
    { id: "manufacturing", label: "Manufacturing" },
    { id: "warehousing", label: "Warehousing" },
    { id: "infrastructure", label: "Infrastructure" },
    { id: "logistics", label: "Logistics" },
  ],
  locationImage: {
    src: "",
    alt: "Strategic connectivity corridor map",
    caption: "Highway, dedicated rail freight, and port connectivity network",
  },
  gallery: [
    {
      id: "gal-1",
      src: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1400&q=82",
      alt: "Precision robotics and automated assembly bay",
      caption: "Precision Engineering & Robotic Manufacturing Bay",
      category: "manufacturing",
    },
    {
      id: "gal-2",
      src: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1400&q=82",
      alt: "Heavy fabrication and structural machinery floor",
      caption: "Heavy Industrial Fabrication Unit",
      category: "manufacturing",
    },
    {
      id: "gal-3",
      src: "https://images.unsplash.com/photo-1567789884554-0b844b597180?auto=format&fit=crop&w=1400&q=82",
      alt: "High-bay distribution and racking logistics terminal",
      caption: "High-Bay Distribution & Logistics Centre",
      category: "warehousing",
    },
    {
      id: "gal-4",
      src: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=82",
      alt: "Automated warehouse pallet sorting and storage",
      caption: "Automated Pallet Storage & Dispatch Systems",
      category: "warehousing",
    },
    {
      id: "gal-5",
      src: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1400&q=82",
      alt: "Multi-modal transport network and highway corridor",
      caption: "Strategic Multi-Modal Connectivity Hub",
      category: "infrastructure",
    },
    {
      id: "gal-6",
      src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=82",
      alt: "Park administrative center and high-tension utility grid",
      caption: "Park Central Administrative Complex",
      category: "infrastructure",
    },
    {
      id: "gal-7",
      src: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1400&q=82",
      alt: "Intermodal freight rail terminal and freight staging",
      caption: "Dedicated Freight Rail & Intermodal Staging Hub",
      category: "logistics",
    },
    {
      id: "gal-8",
      src: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1400&q=82",
      alt: "Cross-docking bays and logistics fleet dispatch",
      caption: "High-Volume Multi-Axle Cross-Docking Terminal",
      category: "logistics",
    },
  ],
};

export const defaultSeo: SeoSettings = {
  metaTitle: "MAAS Industrial Ventures Pvt Limited | High-Capacity Industrial Infrastructure",
  metaDescription:
    "MAAS Industrial Ventures delivers high-capacity, infrastructure-ready industrial addresses engineered for modern manufacturing, strategic warehousing, and institutional capital.",
  keywords: "industrial land, warehouse for lease, industrial plots India, manufacturing infrastructure, MAAS Industrial Ventures",
  canonicalUrl: "https://maasventures.com",
  ogTitle: "MAAS Industrial Ventures Pvt Limited | Industrial Infrastructure",
  ogDescription: "A considered industrial address for businesses planning what comes next.",
  ogImage: "/images/hero-1.jpg",
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterHandle: "@maasventures",
  robotsIndex: true,
  robotsFollow: true,
  googleSiteVerification: "",
  bingSiteVerification: "",
  structuredDataEnabled: true,
};
