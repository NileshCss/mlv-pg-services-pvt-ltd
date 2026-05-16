import React from 'react'

const SchemaMarkup = () => {
  const businessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: 'MLV PG Services',
    description: 'Premium student PG near Acharya Institute with unlimited food, 24/7 electricity, WiFi, CCTV security, and parent-like care.',
    url: 'https://mlv-pg-services-pvt-ltd-frontend.vercel.app',
    telephone: '+91 8809630649',
    email: 'sujeetsinghslv@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Opposite Acharya Institute of Technology',
      addressLocality: 'Bangalore',
      postalCode: '560107',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '13.1483',
      longitude: '77.6122',
    },
    priceRange: '₹7,500–₹13,000/month',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '500',
    },
    image: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80',
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is included in the room rent?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Room rent includes a fully furnished room, high-speed WiFi, 24/7 electricity with backup, CCTV security, housekeeping, laundry service, and unlimited food (breakfast, lunch & dinner).',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you provide vegetarian and non-vegetarian food?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! We provide both vegetarian and non-vegetarian options. You can choose your food preference during registration, and we also accommodate special dietary needs.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is there any deposit or advance payment required?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "We require a one-month refundable security deposit plus the first month's rent in advance. Full details and payment options will be discussed during your site visit.",
        },
      },
      {
        '@type': 'Question',
        name: 'What is the booking process?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Simply fill the pre-registration form → we'll contact you within 24 hours → schedule a visit → finalize your room → and you're all set! The whole process takes as little as 2–3 days.",
        },
      },
      {
        '@type': 'Question',
        name: 'Are guests allowed?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Yes, guests are allowed with prior notice. There are designated visiting hours (9 AM – 9 PM) and sign-in guidelines for guest visits to ensure everyone's comfort and safety.",
        },
      },
      {
        '@type': 'Question',
        name: 'What is the location and connectivity?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We are located directly opposite Acharya Institute of Technology — just a 3-minute walk! The area is well-connected by public transport (metro, bus) and has all essential amenities nearby.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is the PG safe for girls?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Absolutely. We have dedicated women-only floors with 24/7 CCTV, biometric entry, and on-site female staff. Safety is our highest priority.',
        },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  )
}

export default SchemaMarkup
