export const project = {
  brand: "YOUR BRAND / INDUSTRIAL",
  projectName: "A better foundation for industry.",
  location: "Project location to be confirmed",
  introduction:
    "A considered industrial address starts with the things that make work flow: legible planning, dependable infrastructure, and room to grow. Share your requirements to receive verified project information as it becomes available.",
  heroImage: {
    src: "https://images.unsplash.com/photo-1758304481470-e575d1d44efa?auto=format&fit=crop&w=2400&q=85",
    alt: "Aerial view of industrial buildings and a highway overpass, used as illustrative imagery",
    caption: "Illustrative image · not a photograph of the project",
  },
  images: [
    {
      src: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1400&q=82",
      alt: "Engineer reviewing equipment in an industrial setting",
      caption: "Industrial operations · illustrative image",
      className: "gallery-tall",
    },
    {
      src: "https://images.unsplash.com/photo-1567789884554-0b844b597180?auto=format&fit=crop&w=1400&q=82",
      alt: "Modern warehouse with organized racking and high ceilings",
      caption: "Warehouse typology · illustrative image",
      className: "gallery-wide",
    },
    {
      src: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1400&q=82",
      alt: "Industrial district seen from above",
      caption: "Industrial landscape · illustrative image",
      className: "gallery-short",
    },
  ],
} as const;

export const navigation = [
  { label: "Overview", href: "#overview" },
  { label: "Infrastructure", href: "#infrastructure" },
  { label: "Location", href: "#location" },
  { label: "Master plan", href: "#master-plan" },
  { label: "FAQs", href: "#faqs" },
] as const;
