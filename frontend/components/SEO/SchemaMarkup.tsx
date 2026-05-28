import React from 'react'

const SchemaMarkup = () => {
  // ─── 1. LocalBusiness / LodgingBusiness ──────────────────────────────────
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': ['LodgingBusiness', 'LocalBusiness'],
    '@id': 'https://mlvpg.com/#business',

    name: 'MLV PG Services Pvt Ltd',
    alternateName: ['MLV PG', 'MLV PG Services'],

    description:
      'MLV PG Services Pvt Ltd is a trusted North Indian PG near Acharya Institute of Technology, Acharya Institute of Graduate Studies, and Acharya College in Soladevanahalli, Bangalore. We offer authentic home-cooked North Indian food, a hygienic kitchen, parent-like care, and safe accommodation for boys and girls.',

    url: 'https://mlvpg.com',

    telephone: '+919066570348',

    email: 'sujeetsinghslv@gmail.com',

    address: {
      '@type': 'PostalAddress',
      streetAddress:
        '13, Opp. Acharya Institute of Technology, Shakti Enclave, Thammenahalli Village, K.G. Tammenahalli',
      addressLocality: 'Soladevanahalli',
      addressRegion: 'Karnataka',
      postalCode: '560107',
      addressCountry: 'IN',
    },

    geo: {
      '@type': 'GeoCoordinates',
      latitude: '13.0834',
      longitude: '77.4837',
    },

    hasMap:
      'https://www.google.com/maps?q=13.0834,77.4837',

    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '00:00',
        closes: '23:59',
      },
    ],

    priceRange: '₹7,500–₹13,000/month',

    currenciesAccepted: 'INR',
    paymentAccepted: 'Cash, UPI, Bank Transfer',

    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.1',
      reviewCount: '143',
      bestRating: '5',
      worstRating: '1',
    },

    image: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80',
    ],

    // Amenities
    amenityFeature: [
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Authentic North Indian Home-Cooked Food',
        value: true,
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Hygienic Kitchen',
        value: true,
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'CCTV Surveillance 24/7',
        value: true,
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'High-Speed WiFi',
        value: true,
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: '24/7 Security',
        value: true,
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Washing Machine (Self-Use)',
        value: true,
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: '24/7 Power Backup',
        value: true,
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'RO Drinking Water',
        value: true,
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Housekeeping',
        value: true,
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Biometric Entry',
        value: true,
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Accommodation for Girls',
        value: true,
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Accommodation for Boys',
        value: true,
      },
    ],

    // Target audience
    audience: {
      '@type': 'Audience',
      audienceType:
        'Students of Acharya Institute of Technology, Acharya Institute of Graduate Studies, Acharya College, and other colleges in Bangalore',
    },

    // Nearby landmarks for local SEO
    containedInPlace: {
      '@type': 'Place',
      name: 'Soladevanahalli',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Soladevanahalli',
        addressRegion: 'Karnataka',
        addressCountry: 'IN',
      },
    },

    nearbyAttractions: [
      {
        '@type': 'EducationalOrganization',
        name: 'Acharya Institute of Technology',
        alternateName: 'AIT',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Soladevanahalli, Hesaraghatta Road',
          addressLocality: 'Bangalore',
          postalCode: '560107',
          addressCountry: 'IN',
        },
      },
      {
        '@type': 'EducationalOrganization',
        name: 'Acharya Institute of Graduate Studies',
        alternateName: 'AIGS',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Soladevanahalli, Hesaraghatta Road',
          addressLocality: 'Bangalore',
          postalCode: '560107',
          addressCountry: 'IN',
        },
      },
      {
        '@type': 'EducationalOrganization',
        name: 'Acharya College',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Soladevanahalli, Bangalore',
          addressCountry: 'IN',
        },
      },
    ],

    keywords:
      'PG near Acharya College, PG near Acharya Institute of Technology, PG near Acharya Institute of Graduate Studies, North Indian PG Bangalore, North Indian PG near Acharya, MLV PG, MLV PG Services, PG near Soladevanahalli, paying guest near Acharya Bangalore, safe PG for girls near Acharya',

    sameAs: ['https://mlvpg.com'],
  }

  // ─── 2. FAQPage ──────────────────────────────────────────────────────────
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Which is the best PG near Acharya Institute of Technology?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'MLV PG Services Pvt Ltd, located directly opposite Acharya Institute of Technology in Soladevanahalli, Bangalore, is one of the top-rated PGs in the area with a 4.1-star rating and 143 reviews. It offers authentic North Indian home-cooked food, a hygienic kitchen, parent-like care, 24/7 CCTV, and safe accommodation for boys and girls.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is there a North Indian food PG near Acharya College Bangalore?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. MLV PG Services offers authentic home-cooked North Indian meals — dal, roti, sabzi, rice — prepared fresh every day in a hygienically maintained kitchen, located right opposite Acharya Institute of Technology (AIT) and within walking distance of Acharya Institute of Graduate Studies (AIGS) and Acharya College in Soladevanahalli, Bangalore.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does MLV PG accept girls near Acharya Institute?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. MLV PG Services offers separate and secure accommodation for both boys and girls near Acharya Institute of Technology (AIT) and Acharya Institute of Graduate Studies (AIGS), Soladevanahalli, Bangalore. The facility features 24/7 CCTV, biometric entry, gated premises, and dedicated on-site female staff for girl residents.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is there a PG near Acharya Institute with North Indian food?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes — MLV PG is located directly opposite Acharya Institute of Technology, just a 2-minute walk away. We are one of the very few PGs in Soladevanahalli that serve authentic North Indian home-cooked food — dal, roti, sabzi, and rice prepared fresh every day in a hygienic kitchen.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is MLV PG safe for girls?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Absolutely. Safety is our highest priority. MLV PG has 24/7 CCTV cameras covering all common areas, a biometric access system, gated entry, and dedicated female staff on duty at all times. Parents of our girl residents regularly tell us they sleep peacefully knowing their daughters are with us.',
        },
      },
      {
        '@type': 'Question',
        name: 'How far is MLV PG from Acharya Institute of Technology?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'MLV PG is located directly opposite Acharya Institute of Technology (AIT) on Hesaraghatta Road, Soladevanahalli — roughly a 2-minute walk from the campus gate. Students from Acharya Institute of Graduate Studies (AIGS) and Acharya College are also within comfortable walking distance.',
        },
      },
      {
        '@type': 'Question',
        name: 'What type of food is served at MLV PG?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'MLV PG serves authentic North Indian home-cooked meals: dal (arhar/chana), fresh rotis, seasonal sabzi, steamed rice, and curd. Meals are prepared daily in a hygienically maintained kitchen using fresh ingredients. Both vegetarian and non-vegetarian options are available.',
        },
      },
      {
        '@type': 'Question',
        name: 'What are the room charges at MLV PG and what is included?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Room rent at MLV PG starts at ₹7,500/month (triple sharing) and goes up to ₹13,000/month (single room). All plans include North Indian home-cooked meals (breakfast, lunch & dinner), high-speed WiFi, 24/7 electricity with backup, CCTV security, housekeeping, and self-use washing machine. A refundable one-month security deposit is required at move-in.',
        },
      },
    ],
  }

  // ─── 3. BreadcrumbList ───────────────────────────────────────────────────
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://mlvpg.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'PG near Acharya College Bangalore',
        item: 'https://mlvpg.com/#about',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'North Indian Food PG',
        item: 'https://mlvpg.com/#food',
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: 'Rooms & Pricing',
        item: 'https://mlvpg.com/#rooms',
      },
      {
        '@type': 'ListItem',
        position: 5,
        name: 'Contact MLV PG',
        item: 'https://mlvpg.com/#contact',
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema, null, 0) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema, null, 0) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema, null, 0) }}
      />
    </>
  )
}

export default SchemaMarkup
