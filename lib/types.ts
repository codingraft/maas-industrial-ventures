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
  projectId?: string;
  className?: string;
};

export type SectionImage = {
  src: string;
  alt: string;
  caption?: string;
};

export type MediaItem = {
  id: string;
  url: string;
  fileName: string;
  source: "uploads" | "hero" | "project" | "blog" | "gallery" | "branding" | "other";
  format: string;
  sizeBytes?: number;
  createdAt: string;
  alt?: string;
  usageCount?: number;
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

export type DevelopmentVertical = {
  id: string;
  title: string;
  description: string;
  tag: string;
  icon?: string;
};

export type VisionMissionPhilosophy = {
  vision: string;
  mission: string;
  philosophyTitle: string;
  philosophyText: string;
};

export type ProjectItem = {
  id: string;
  title: string;
  slug: string;
  tagline?: string;
  location: string;
  addressShort: string;
  shortDescription: string;
  fullDescription: string;
  plotSizes: string;
  roadWidth: string;
  connectivity: string[];
  features: string[];
  subsidiesInfo?: string;
  status: "Active Plots Available" | "Under Development" | "Ready for Possession";
  coverImage: string;
  galleryImages: string[];
  brochureUrl?: string;
  order: number;
  isActive: boolean;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  authorBio?: string;
  readTime: string;
  publishedAt: string;
  isFeatured: boolean;
  isPublished: boolean;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
};

export type Lead = {
  id: number | string;
  name: string;
  phone: string;
  email: string;
  project?: string;
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
    heroEyebrow?: string;
    heroHeadline?: string;
    heroSubheadline?: string;
    heroDescription?: string;
    heroPrimaryBtnText?: string;
    heroSecondaryBtnText?: string;
    locationHighlight?: string;
    bottomHighlights?: string[];
    overviewHeadline?: string;
    overviewParagraphs?: string[];
    overviewEyebrow?: string;
    overviewCtaText?: string;
    verticalsEyebrow?: string;
    verticalsHeadline?: string;
    verticalsDescription?: string;
    projectsEyebrow?: string;
    projectsHeadline?: string;
    projectsDescription?: string;
    galleryEyebrow?: string;
    galleryHeadline?: string;
    galleryDescription?: string;
    blogSectionEyebrow?: string;
    blogSectionHeadline?: string;
    blogSectionDescription?: string;
    contactEyebrow?: string;
    contactHeadline?: string;
    contactDescription?: string;
    blogEyebrow?: string;
    blogHeadline?: string;
    blogDescription?: string;
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
    projects: boolean;
    gallery: boolean;
    blog: boolean;
    contact: boolean;
    highlights: boolean;
    infrastructure: boolean;
    masterplan: boolean;
    location: boolean;
    timeline: boolean;
    faq: boolean;
    enquire: boolean;
  };
  verticals: DevelopmentVertical[];
  vision_mission: VisionMissionPhilosophy;
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

export const defaultVerticals: DevelopmentVertical[] = [
  {
    id: "vert-1",
    title: "Industrial Development",
    description:
      "We develop industrial hubs, industrial parks and planned industrial estates, creating opportunities for manufacturers, businesses, entrepreneurs and investors.",
    tag: "Parks & Estates",
  },
  {
    id: "vert-2",
    title: "Industrial Plot Development",
    description:
      "We plan, develop and sell industrial plots for businesses looking to establish, expand or invest in industrial locations, subject to applicable land-use permissions.",
    tag: "Plotted Hubs",
  },
  {
    id: "vert-3",
    title: "Residential Development",
    description:
      "We develop residential plotted projects, creating organised land opportunities for homebuyers, individuals and property investors.",
    tag: "Residential",
  },
  {
    id: "vert-4",
    title: "Land & Real Estate Development",
    description:
      "We undertake land development and plotted real estate projects, with a focus on transforming land into purposeful developments and creating long-term value for our customers.",
    tag: "Integrated Land",
  },
];

export const defaultVisionMission: VisionMissionPhilosophy = {
  vision:
    "To establish MAAS as a trusted name in industrial and residential real estate development by creating thoughtfully planned destinations that support industries, businesses and growing communities.",
  mission:
    "To develop land with vision, purpose and careful planning, creating industrial and residential developments that offer meaningful opportunities and lasting value.",
  philosophyTitle: "We don't just sell land. We develop the places where the future takes shape.",
  philosophyText:
    "At MAAS Industrial Ventures, we believe development is about creating possibilities. Every industrial hub, every industrial plot and every residential development takes place to move businesses, investments and communities forward.",
};

export const defaultProjects: ProjectItem[] = [
  {
    id: "proj-gayatri",
    title: "Gayatri Industrial Park",
    slug: "gayatri-industrial-park",
    tagline: "Gated Industrial & Warehousing Hub",
    location: "Bhojpur, Modinagar (Ghaziabad district), Uttar Pradesh",
    addressShort: "Bhojpur, Modinagar (Ghaziabad)",
    shortDescription:
      "A gated industrial and warehousing hub offering strategic access to the Delhi–Meerut Expressway and NH-24. Designed for manufacturing units, factories, and logistics operations.",
    fullDescription:
      "Gayatri Industrial Park is a gated industrial and warehousing hub located in Bhojpur, Modinagar (Ghaziabad district), Uttar Pradesh, offering strategic access to the Delhi–Meerut Expressway and NH-24. Designed for manufacturing units, factories, and logistics operations, the park features industrial plots starting from 500 sq. yards, wide 45–52 ft. concrete roads, industrial power and drainage infrastructure, and 24/7 gated security.",
    plotSizes: "From 500 Sq. Yards",
    roadWidth: "45–52 ft. Heavy-Duty Concrete Roads",
    connectivity: [
      "Direct access to Delhi–Meerut Expressway (DME)",
      "Proximity to NH-24 / Meerut Corridor",
      "Fast connectivity to Delhi NCR manufacturing & freight nodes",
    ],
    features: [
      "Gated perimeter with 24/7 surveillance security",
      "Wide 45–52 ft. heavy concrete road circulation",
      "Industrial HT/LT power feeder network ready",
      "Integrated storm water drainage & utility corridors",
    ],
    subsidiesInfo: "Eligible for standard state manufacturing & logistics clearances.",
    status: "Active Plots Available",
    coverImage:
      "https://images.unsplash.com/photo-1758304481470-e575d1d44efa?auto=format&fit=crop&w=1600&q=85",
    galleryImages: [
      "https://images.unsplash.com/photo-1758304481470-e575d1d44efa?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1400&q=82",
      "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1400&q=82",
    ],
    brochureUrl: "",
    order: 1,
    isActive: true,
  },
  {
    id: "proj-shri-balaji",
    title: "Shri Balaji Industrial Park",
    slug: "shri-balaji-industrial-park",
    tagline: "Planned Industrial Park with UP MSME Policy Benefits",
    location: "Near Sarawa Bus Stand, Hapur–Modinagar Road, Hapur, Uttar Pradesh",
    addressShort: "Sarawa Bus Stand, Hapur-Modinagar Rd",
    shortDescription:
      "An industrial development project designed for entrepreneurs, manufacturers, factories and investors. Features completed demarcation, RCC roads, and UP MSME Promotion Policy 2022 benefits.",
    fullDescription:
      "Shri Balaji Industrial Park is an industrial development project located near Sarawa Bus Stand on Hapur–Modinagar Road, Hapur, Uttar Pradesh. Designed for entrepreneurs, manufacturers, factories and industrial investors, the park offers industrial plots ranging from 500 to 3,000 sq. yards, properly constructed RCC roads and completed plot demarcation, with planned amenities. The project also highlights potential investment benefits under the Uttar Pradesh MSME Promotion Policy 2022, including eligible capital investment subsidies, stamp duty exemptions and access to MSME support schemes, subject to applicable government guidelines and eligibility.",
    plotSizes: "500 to 3,000 Sq. Yards",
    roadWidth: "Engineered High-Load RCC Roads",
    connectivity: [
      "Prime position on Hapur–Modinagar Road near Sarawa Bus Stand",
      "Quick link to NH-9, NH-334 & regional expressways",
      "Direct transit corridor to Western UP trade centers",
    ],
    features: [
      "Completed clear plot demarcation for rapid site handover",
      "Engineered RCC internal road infrastructure",
      "Planned amenities for industrial workforce & operations",
      "Dedicated power & water supply provisions",
    ],
    subsidiesInfo:
      "Potential investment benefits under Uttar Pradesh MSME Promotion Policy 2022: eligible capital investment subsidies, stamp duty exemptions, and MSME financial support schemes.",
    status: "Active Plots Available",
    coverImage:
      "https://images.unsplash.com/photo-1567789884554-0b844b597180?auto=format&fit=crop&w=1600&q=85",
    galleryImages: [
      "https://images.unsplash.com/photo-1567789884554-0b844b597180?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=82",
      "https://images.unsplash.com/photo-1567789884554-0b844b597180?auto=format&fit=crop&w=1400&q=82",
    ],
    brochureUrl: "",
    order: 2,
    isActive: true,
  },
];

export const defaultBlogs: BlogPost[] = [
  {
    id: "blog-up-msme-2022",
    title: "Uttar Pradesh MSME Promotion Policy 2022: Subsidies & Benefits for Industrial Plot Buyers",
    slug: "uttar-pradesh-msme-promotion-policy-2022-subsidies-benefits",
    category: "Policy & Subsidies",
    excerpt:
      "Discover the eligible capital investment subsidies, 100% stamp duty exemptions, and power tariff concessions available for enterprises investing in Uttar Pradesh industrial parks.",
    content: `## Accelerating Industrial Manufacturing in Uttar Pradesh

The **Uttar Pradesh Micro, Small and Medium Enterprises (MSME) Promotion Policy 2022** marks a landmark framework designed to foster industrial growth, entrepreneurship, and manufacturing infrastructure across the state. For enterprises establishing operations at developments such as **Shri Balaji Industrial Park** on the Hapur–Modinagar corridor, these incentives translate into significant capital savings and accelerated project ROI.

### Key Policy Incentives for Industrial Plot Buyers

1. **Capital Investment Subsidies**:
   Eligible MSME units can receive capital investment subsidies ranging between 10% to 25% of eligible fixed capital investment, subject to zoning tier and unit scale.

2. **Stamp Duty Exemptions**:
   Industrial buyers setting up in approved industrial areas and designated clusters can claim up to **100% exemption on stamp duty** on the purchase or lease of industrial land.

3. **Interest Subsidies on Term Loans**:
   Annual interest subsidies on loans acquired for plant and machinery procurement, reducing the cost of initial debt servicing.

4. **Single Window Clearance**:
   Fast-track regulatory approvals through the **Nivesh Mitra** portal, minimizing bureaucratic delays for building plans, power sanction, and pollution clearances.

### Why Planned Plotted Parks Matter

Standalone rural land often requires arduous change of land use (CLU) conversions, power feeder installations, and prolonged litigation risks. In contrast, acquiring demarcated plots inside organized developments like **Shri Balaji Industrial Park** and **Gayatri Industrial Park** provides developers with immediate possession, engineered RCC road access, and verified statutory clarity.

*To review specific eligibility criteria for your enterprise scale, connect with our industrial advisory team.*`,
    coverImage:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1400&q=82",
    author: "MAAS Research Desk",
    readTime: "4 min read",
    publishedAt: "2026-11-10",
    isFeatured: true,
    isPublished: true,
    metaTitle: "UP MSME Promotion Policy 2022 Subsidies | MAAS Industrial Ventures",
    metaDescription:
      "Complete guide to capital subsidies, stamp duty exemptions, and incentives under the UP MSME Promotion Policy 2022 for industrial plot buyers.",
    keywords: ["UP MSME Policy 2022", "industrial subsidies UP", "stamp duty exemption UP", "Shri Balaji Industrial Park"],
  },
  {
    id: "blog-dme-ghaziabad-hapur",
    title: "Delhi–Meerut Expressway & NH-24: Why Bhojpur, Modinagar & Hapur Are Key Industrial Hubs",
    slug: "delhi-meerut-expressway-bhojpur-modinagar-hapur-industrial-hub",
    category: "Connectivity & Logistics",
    excerpt:
      "How signal-free expressway access and strategic positioning within NCR make Bhojpur (Modinagar) and Hapur the premier destinations for manufacturing and warehousing.",
    content: `## The Strategic Infrastructure Boom in Western Uttar Pradesh

Logistics efficiency is the lifeblood of modern manufacturing. Over the past five years, the operationalization of the **Delhi–Meerut Expressway (DME)**, eastern peripheral connections, and widening of national highways have fundamentally altered industrial geography in the National Capital Region (NCR).

### 1. Rapid Freight Transit to Delhi & Major Ports

Industrial hubs situated along the **Bhojpur–Modinagar** belt and the **Hapur–Modinagar Road** enjoy unparalleled logistical advantages:
- **Under 45 minutes** to Anand Vihar / East Delhi borders.
- Seamless freight movement without entering city congestion zones.
- Direct connectivity to the Western Dedicated Freight Corridor (WDFC) rail terminals.

### 2. Gayatri Industrial Park: Prime Bhojpur Positioning

Located in Bhojpur, Modinagar (Ghaziabad district), **Gayatri Industrial Park** offers direct access to the DME and NH-24. For distribution companies, third-party logistics (3PL) providers, and precision manufacturing units, this corridor ensures overnight turnaround to consumer hubs across North India.

### 3. Abundant Skilled Workforce & Industrial Utilities

The Modinagar–Hapur belt is home to established technical institutions, engineering colleges, and a mature industrial labor ecosystem. Furthermore, continuous high-tension power infrastructure and groundwater availability ensure low operational downtime.

*Explore available industrial plots from 500 sq. yards at Gayatri Industrial Park.*`,
    coverImage:
      "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1400&q=82",
    author: "MAAS Infrastructure Insights",
    readTime: "5 min read",
    publishedAt: "2026-11-05",
    isFeatured: true,
    isPublished: true,
    metaTitle: "Delhi-Meerut Expressway Industrial Hubs | Gayatri Industrial Park",
    metaDescription:
      "Analysis of industrial plot opportunities in Bhojpur, Modinagar, and Hapur with direct Delhi-Meerut Expressway connectivity.",
    keywords: ["Delhi Meerut Expressway industrial plots", "Bhojpur Modinagar industrial park", "Hapur industrial land", "Gayatri Industrial Park"],
  },
  {
    id: "blog-plot-demarcation-roads",
    title: "Demarcation, Concrete Roads & Power: What to Inspect Before Buying an Industrial Plot",
    slug: "what-to-inspect-before-buying-industrial-plots-demarcation-roads",
    category: "Industrial Insights",
    excerpt:
      "A practical checklist for factory owners: evaluating road turning radiuses for 40ft trailers, power feeder capacity, and plot boundary demarcation.",
    content: `## A Practical Due Diligence Guide for Industrial Plot Buyers

Investing in an industrial plot is a long-term capital decision. Unlike commercial or residential land, industrial facilities impose strict mechanical, statutory, and logistical demands on the physical site.

### Checklist: Essential Features of a Grade-A Industrial Park

1. **Internal Road Width & Construction Type**:
   A road narrower than 40 feet creates continuous traffic gridlock when 40-foot multi-axle freight containers load or unload. Look for **45–52 ft concrete or RCC roads** that can withstand 40+ tonne axle loads without surface degradation.

2. **Completed Physical Demarcation**:
   Never invest based on paper coordinates alone. Ensure the park has finished physical corner-stone demarcation and level grading so construction can initiate immediately upon registry.

3. **High-Tension (HT) Dual Grid Connectivity**:
   Heavy machinery, cold storage, and plastics extrusion demand reliable high-voltage supply. Verify whether the park includes dedicated feeder lines or independent substations.

4. **Storm Water & Effluent Drainage**:
   Flooding during monsoons halts dispatch schedules. Engineered dual drainage (stormwater drains separated from industrial effluent channels) is mandatory for sustainable operations.

### Experience the MAAS Standard

At **Gayatri Industrial Park** and **Shri Balaji Industrial Park**, every plot is developed to institutional infrastructure benchmarks. Schedule a physical site inspection with our engineering leads to review road cross-sections and utility layouts.`,
    coverImage:
      "https://images.unsplash.com/photo-1567789884554-0b844b597180?auto=format&fit=crop&w=1400&q=82",
    author: "MAAS Engineering Division",
    readTime: "6 min read",
    publishedAt: "2026-10-28",
    isFeatured: false,
    isPublished: true,
    metaTitle: "Industrial Plot Buying Guide: Demarcation & Infrastructure | MAAS",
    metaDescription:
      "Checklist for purchasing industrial plots: road width for multi-axle freight, HT power feeders, and boundary demarcation.",
    keywords: ["industrial plot checklist", "RCC road width industrial park", "factory plot buying guide"],
  },
];

export const defaultContent: SiteSettings["content"] = {
  facts: [
    { id: "fact-1", label: "Development Zone", value: "Industrial & Residential Hubs" },
    { id: "fact-2", label: "Connectivity", value: "Delhi–Meerut Expressway & NH-24" },
    { id: "fact-3", label: "Active Parks", value: "Gayatri & Shri Balaji" },
    { id: "fact-4", label: "Plot Typology", value: "From 500 to 3,000 Sq. Yards" },
  ],
  highlights: [
    {
      id: "hl-1",
      index: "01",
      title: "Strategic Corridors",
      value: "Delhi–Meerut Expressway & NH-24",
      note: "Instant logistics access across NCR and Western UP",
    },
    {
      id: "hl-2",
      index: "02",
      title: "Heavy-Duty Infrastructure",
      value: "45–52 ft Concrete & RCC Roads",
      note: "Engineered for 40ft multi-axle freight movement",
    },
    {
      id: "hl-3",
      index: "03",
      title: "Statutory Approvals",
      value: "Clear Industry Land Permissions",
      note: "Demarcated plots ready for fast-track construction",
    },
    {
      id: "hl-4",
      index: "04",
      title: "Financial Incentives",
      value: "UP MSME Promotion Policy 2022",
      note: "Eligible capital subsidies & stamp duty benefits",
    },
  ],
  timeline: [
    {
      id: "tm-1",
      phase: "PHASE 01 / ALLOCATION",
      title: "Land Identification & Master Planning",
      description: "Strategic location acquisition, zoning clearances, and macro sectoral layout design.",
    },
    {
      id: "tm-2",
      phase: "PHASE 02 / INFRASTRUCTURE",
      title: "RCC Road Networks & Utility Feeder Laying",
      description: "Concrete freight road construction, power substation energization, and plot demarcation.",
    },
    {
      id: "tm-3",
      phase: "PHASE 03 / POSSESSION",
      title: "Plot Handover & Manufacturing Commissioning",
      description: "Plot possession with continuous 24/7 gated security and park administration support.",
    },
  ],
  faqs: [
    {
      id: "faq-1",
      question: "What plot sizes are available at MAAS Industrial projects?",
      answer:
        "At Gayatri Industrial Park, industrial plots start from 500 sq. yards. At Shri Balaji Industrial Park, plots range from 500 to 3,000 sq. yards, accommodating small workshops, medium factories, and large warehousing facilities.",
    },
    {
      id: "faq-2",
      question: "What financial incentives are available under the UP MSME Promotion Policy 2022?",
      answer:
        "Eligible units setting up at Shri Balaji Industrial Park may access capital investment subsidies, up to 100% stamp duty exemptions, and MSME financial assistance schemes subject to state guidelines and eligibility.",
    },
    {
      id: "faq-3",
      question: "Where are the projects located and how is the road connectivity?",
      answer:
        "Gayatri Industrial Park is located in Bhojpur, Modinagar (Ghaziabad) with rapid access to the Delhi–Meerut Expressway and NH-24. Shri Balaji Industrial Park is located near Sarawa Bus Stand on the Hapur–Modinagar Road.",
    },
    {
      id: "faq-4",
      question: "What infrastructure is provided inside the parks?",
      answer:
        "Both parks feature wide 45–52 ft heavy concrete / RCC roads, completed plot demarcation, dedicated industrial power and drainage infrastructure, and 24/7 gated security.",
    },
    {
      id: "faq-5",
      question: "What sectors or industries can establish operations?",
      answer:
        "The parks are designed for manufacturing units, engineering workshops, logistics operations, assembly units, and industrial investors, subject to applicable land-use approvals.",
    },
    {
      id: "faq-6",
      question: "How can I schedule a physical site inspection or enquire?",
      answer:
        "You can submit an enquiry through our website selecting the specific project, call our direct desk at +91 98765 43210, or connect via WhatsApp for an immediate response.",
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
      alt: "MAAS Industrial Ventures development overview",
      eyebrow: "MAAS INDUSTRIAL VENTURES PVT. LIMITED",
      title: "Developing Land. Building Opportunities.",
      subtitle: "Creating Industrial Hubs & Residential Developments for a Better Tomorrow.",
    },
    {
      id: "slide-2",
      src: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=2400&q=85",
      alt: "Gayatri Industrial Park Bhojpur Modinagar",
      eyebrow: "GAYATRI INDUSTRIAL PARK / BHOJPUR, MODINAGAR",
      title: "Strategic Delhi–Meerut Expressway & NH-24 Access.",
      subtitle: "Industrial plots starting from 500 sq. yards with wide 45–52 ft concrete roads and 24/7 security.",
    },
    {
      id: "slide-3",
      src: "https://images.unsplash.com/photo-1567789884554-0b844b597180?auto=format&fit=crop&w=2400&q=85",
      alt: "Shri Balaji Industrial Park Hapur",
      eyebrow: "SHRI BALAJI INDUSTRIAL PARK / HAPUR",
      title: "500 to 3,000 Sq. Yards with UP MSME Subsidies.",
      subtitle: "Completed plot demarcation, RCC roads, and potential capital investment subsidies under UP MSME Policy 2022.",
    },
  ],
  overviewImage: {
    src: "https://images.unsplash.com/photo-1567789884554-0b844b597180?auto=format&fit=crop&w=2200&q=85",
    alt: "Modern industrial development and planned estates",
    caption: "MAAS Industrial Ventures · We Develop Land. We Build Destinations.",
  },
  infraImage: {
    src: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=82",
    alt: "Industrial operations and robust utility infrastructure",
    caption: "Engineered concrete road networks & dedicated power corridors",
  },
  masterplanImage: {
    src: "",
    alt: "Master Plan blueprint",
    caption: "Official master plan layout and zoning division blueprint",
  },
  masterplanPlans: [
    {
      id: "plan-1",
      title: "Gayatri Industrial Park Layout",
      subtitle: "Bhojpur, Modinagar · Plots from 500 Sq. Yards",
      description: "Gated industrial layout with wide 45–52 ft concrete roads, power substation, and 24/7 security entrance.",
      src: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=85",
      alt: "Gayatri Industrial Park Layout Blueprint",
      tag: "Gayatri Industrial Park",
    },
    {
      id: "plan-2",
      title: "Shri Balaji Industrial Park Master Layout",
      subtitle: "Sarawa Bus Stand, Hapur–Modinagar Rd · 500 to 3,000 Sq. Yards",
      description: "Engineered RCC road network with completed demarcation for small and large manufacturing units.",
      src: "https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=1600&q=85",
      alt: "Shri Balaji Industrial Park Layout",
      tag: "Shri Balaji Industrial Park",
    },
  ],
  galleryCategories: [
    { id: "all", label: "All Photos" },
    { id: "gayatri", label: "Gayatri Industrial Park" },
    { id: "shri-balaji", label: "Shri Balaji Industrial Park" },
    { id: "infrastructure", label: "Infrastructure & Roads" },
    { id: "manufacturing", label: "Manufacturing & Logistics" },
  ],
  locationImage: {
    src: "",
    alt: "Strategic connectivity corridor map",
    caption: "Delhi–Meerut Expressway, NH-24, and Hapur industrial corridors",
  },
  gallery: [
    {
      id: "gal-1",
      src: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1400&q=82",
      alt: "Gayatri Industrial Park - Precision manufacturing unit",
      caption: "Precision Engineering & Robotic Manufacturing Bay",
      category: "manufacturing",
      projectId: "proj-gayatri",
    },
    {
      id: "gal-2",
      src: "https://images.unsplash.com/photo-1567789884554-0b844b597180?auto=format&fit=crop&w=1400&q=82",
      alt: "Heavy fabrication and industrial engineering floor",
      caption: "Heavy Industrial Fabrication Unit",
      category: "manufacturing",
      projectId: "proj-shri-balaji",
    },
    {
      id: "gal-3",
      src: "https://images.unsplash.com/photo-1567789884554-0b844b597180?auto=format&fit=crop&w=1400&q=82",
      alt: "Warehousing and distribution logistics terminal",
      caption: "High-Bay Distribution & Logistics Centre",
      category: "manufacturing",
      projectId: "proj-gayatri",
    },
    {
      id: "gal-4",
      src: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=82",
      alt: "Demarcated plot layout and dispatch area",
      caption: "Demarcated Industrial Plot Infrastructure",
      category: "infrastructure",
      projectId: "proj-shri-balaji",
    },
    {
      id: "gal-5",
      src: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1400&q=82",
      alt: "Wide 45-52 ft heavy-duty concrete road network",
      caption: "45–52 ft Heavy-Duty Concrete Roads",
      category: "infrastructure",
      projectId: "proj-gayatri",
    },
    {
      id: "gal-6",
      src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=82",
      alt: "Gated entry complex and 24/7 security checkpoint",
      caption: "24/7 Gated Security & Administrative Entrance",
      category: "infrastructure",
      projectId: "proj-shri-balaji",
    },
  ],
};

export const defaultSeo: SeoSettings = {
  metaTitle: "MAAS Industrial Ventures Pvt. Limited | Developing Land. Building Opportunities.",
  metaDescription:
    "We are land and real estate developers creating thoughtfully planned industrial hubs, industrial plots, and residential developments across India. Explore Gayatri Industrial Park and Shri Balaji Industrial Park.",
  keywords:
    "MAAS Industrial Ventures, Gayatri Industrial Park, Shri Balaji Industrial Park, industrial plots Bhojpur Modinagar, industrial land Hapur, UP MSME Policy 2022 subsidies, industrial land development India",
  canonicalUrl: "https://maasventures.com",
  ogTitle: "MAAS Industrial Ventures Pvt. Limited | Developing Land. Building Opportunities.",
  ogDescription:
    "Creating Industrial Hubs & Residential Developments for a Better Tomorrow. High-grade industrial plots in Ghaziabad and Hapur.",
  ogImage: "https://images.unsplash.com/photo-1758304481470-e575d1d44efa?auto=format&fit=crop&w=1600&q=85",
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterHandle: "@maasventures",
  robotsIndex: true,
  robotsFollow: true,
  googleSiteVerification: "",
  bingSiteVerification: "",
  structuredDataEnabled: true,
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

