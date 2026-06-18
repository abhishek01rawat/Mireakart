import React from 'react';
import { Helmet } from 'react-helmet-async';

const SeoHelmet = ({ title, description, keywords, canonical }) => {
  const defaultTitle = 'Mireakart | Premium Cosmetics & Beauty Store';
  const displayTitle = title ? `${title} | Mireakart` : defaultTitle;
  
  const defaultDescription = 'Discover premium beauty and cosmetics at Mireakart. Shop makeup, skincare, fragrances, and hair care with fast shipping and authentic products.';
  const displayDescription = description || defaultDescription;

  const defaultKeywords = 'Mireakart, cosmetics, makeup online, beauty store, skincare products, authentic beauty';
  const displayKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;

  const displayCanonical = canonical || window.location.href;

  return (
    <Helmet>
      <title>{displayTitle}</title>
      <meta name="description" content={displayDescription} />
      <meta name="keywords" content={displayKeywords} />
      <link rel="canonical" href={displayCanonical} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={displayTitle} />
      <meta property="og:description" content={displayDescription} />
      <meta property="og:url" content={displayCanonical} />
      <meta property="og:site_name" content="Mireakart" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={displayTitle} />
      <meta name="twitter:description" content={displayDescription} />
    </Helmet>
  );
};

export default SeoHelmet;
