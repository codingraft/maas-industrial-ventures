import type { Metadata } from "next";
import Script from "next/script";
import { getAllSettings } from "@/lib/db";
import { EnquiryModal } from "@/components/EnquiryModal";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  let settings;
  try {
    settings = await getAllSettings();
  } catch {
    return {
      title: "MAAS Industrial Ventures Pvt Limited | High-Capacity Industrial Infrastructure",
      description:
        "MAAS Industrial Ventures delivers high-capacity, infrastructure-ready industrial addresses engineered for modern manufacturing, strategic warehousing, and institutional capital.",
    };
  }

  const seo = settings.seo;
  const siteInfo = settings.site_info;

  const siteUrl = seo?.canonicalUrl || "https://maasventures.com";
  const title = seo?.metaTitle || `${siteInfo?.brandName || "MAAS Industrial Ventures"} | High-Capacity Industrial Infrastructure`;
  const description = seo?.metaDescription || siteInfo?.introduction || "A considered industrial address for businesses planning what comes next.";

  let ogImageUrl = seo?.ogImage || "/images/hero-1.jpg";
  if (!ogImageUrl.startsWith("http")) {
    const cleanUrl = siteUrl.replace(/\/$/, "");
    const cleanImg = ogImageUrl.replace(/^\//, "");
    ogImageUrl = `${cleanUrl}/${cleanImg}`;
  }

  const keywordsList = seo?.keywords
    ? seo.keywords.split(",").map((k) => k.trim()).filter(Boolean)
    : undefined;

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    keywords: keywordsList,
    alternates: {
      canonical: siteUrl,
    },
    robots: {
      index: seo?.robotsIndex ?? true,
      follow: seo?.robotsFollow ?? true,
      googleBot: {
        index: seo?.robotsIndex ?? true,
        follow: seo?.robotsFollow ?? true,
      },
    },
    openGraph: {
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      url: siteUrl,
      siteName: siteInfo?.brandName || "MAAS Industrial Ventures",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: seo?.ogTitle || title,
        },
      ],
      type: (seo?.ogType as "website") || "website",
    },
    twitter: {
      card: seo?.twitterCard || "summary_large_image",
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      images: [ogImageUrl],
      creator: seo?.twitterHandle || undefined,
    },
    verification: {
      google: seo?.googleSiteVerification || undefined,
      other: seo?.bingSiteVerification
        ? { "msvalidate.01": seo.bingSiteVerification }
        : undefined,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let settings;
  let tracking = { gtmId: "", googleAdsId: "", metaPixelId: "" };
  try {
    settings = await getAllSettings();
    if (settings.tracking) {
      tracking = settings.tracking;
    }
  } catch {
    // Fallback if db is initializing
  }

  const seo = settings?.seo;
  const siteInfo = settings?.site_info;

  return (
    <html lang="en">
      <head>
        {/* Schema.org Structured Data (JSON-LD) for Rich Google Snippets */}
        {seo?.structuredDataEnabled && siteInfo && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "RealEstateListing",
                name: seo.ogTitle || seo.metaTitle || siteInfo.brandName,
                description: seo.metaDescription || siteInfo.introduction,
                url: seo.canonicalUrl || "https://maasventures.com",
                telephone: siteInfo.phone,
                address: {
                  "@type": "PostalAddress",
                  streetAddress: siteInfo.address,
                  addressCountry: "IN",
                },
              }),
            }}
          />
        )}

        {/* Google Tag Manager */}
        {tracking.gtmId && (
          <Script id="gtm-script" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${tracking.gtmId}');
            `}
          </Script>
        )}

        {/* Google Ads / GA4 - Loaded during idle time to prevent hydration blocking */}
        {tracking.googleAdsId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${tracking.googleAdsId}`}
              strategy="lazyOnload"
            />
            <Script id="google-ads-script" strategy="lazyOnload">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${tracking.googleAdsId}');
              `}
            </Script>
          </>
        )}

        {/* Meta Pixel - Loaded during idle time to maintain 100fps rendering */}
        {tracking.metaPixelId && (
          <Script id="meta-pixel-script" strategy="lazyOnload">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${tracking.metaPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}
      </head>
      <body>
        {tracking.gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${tracking.gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        {children}
        <EnquiryModal />
      </body>
    </html>
  );
}
