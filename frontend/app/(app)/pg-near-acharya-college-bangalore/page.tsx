import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Utensils, Heart, CheckCircle2, PhoneCall, ChevronRight, HelpCircle } from 'lucide-react'

// 1 & 2. Meta Tags (Title & Description)
export const metadata: Metadata = {
  title: 'PG near Acharya College | North Indian Food | MLV PG',
  description: 'Looking for a PG near Acharya College Bangalore? MLV PG offers authentic North Indian food, hygienic rooms & parent-like care. Boys & girls. Walk to campus!',
  alternates: {
    canonical: 'https://mlvpg.com/pg-near-acharya-college-bangalore',
  },
}

export default function PGNearAcharyaCollegePage() {
  return (
    <div className="bg-[#F8F6F1] text-[#1A1A2E] font-sans">
      {/* Spacer for fixed Navbar */}
      <div style={{ height: '118px' }} />

      {/* Hero Section */}
      <section className="relative px-4 py-16 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold rounded-full bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/30 uppercase tracking-wider">
          Premium Student Accommodation
        </span>
        {/* 3. H1 */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif mb-6 text-[#1A1A2E] leading-tight">
          PG near Acharya College Bangalore<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C9A84C] to-[#E8C96B]">
            North Indian Food & Parent-Like Care
          </span>
        </h1>
        {/* 4. Introduction */}
        <p className="max-w-3xl mx-auto text-lg md:text-xl text-[#4A4A6A] leading-relaxed mb-10 font-medium">
          Finding the right accommodation away from home can be challenging, but <strong>MLV PG Services Pvt Ltd</strong> makes it easy. 
          Situated exactly opposite the campus in Soladevanahalli, we are the most trusted <strong>PG near Acharya Institute of Technology</strong>. 
          Whether you are enrolled at <strong>Acharya Institute of Graduate Studies</strong> or <strong>Acharya College</strong>, our facility is 
          literally within walking distance. What truly sets us apart is our commitment to authenticity and hygiene. We are renowned as the finest 
          <strong> North Indian PG near Acharya College</strong>, serving authentic, home-style meals—dal, roti, and sabzi—cooked fresh daily. 
          Beyond just a hygienic PG near Acharya Institute, we offer a secure environment for both boys and girls with genuine, parent-like care. 
          Experience a home where you are looked after, well-fed, and safe, allowing you to focus entirely on your studies.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="#contact-cta" className="px-8 py-3.5 bg-gradient-to-r from-[#C9A84C] to-[#E8C96B] text-[#1A1A2E] font-bold rounded-full shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
            <PhoneCall size={18} /> Book Your Room Today
          </a>
          <Link href="/rooms" className="px-8 py-3.5 bg-white border border-[#C9A84C]/50 text-[#1A1A2E] font-bold rounded-full shadow-sm hover:bg-[#F8F6F1] transition-colors">
            View Room Pricing
          </Link>
        </div>
      </section>

      {/* 5. Feature Section (3 Columns) */}
      <section className="py-16 bg-white border-y border-[#EBEBF0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-serif text-[#1A1A2E]">Why MLV is the Best PG Near Acharya with Home Food</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-[#FAFAF8] border border-[#EBEBF0] hover:shadow-xl transition-shadow group">
              <div className="w-14 h-14 bg-[#C9A84C]/10 border border-[#C9A84C]/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Utensils className="text-[#C9A84C]" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#1A1A2E]">North Indian Food</h3>
              <p className="text-[#4A4A6A] leading-relaxed">
                Craving ghar ka khana? As the leading North Indian PG near Acharya College, we serve authentic dal, phulka rotis, seasonal sabzi, and rice. No bland canteen meals here. We ensure every student enjoys unlimited, delicious home-cooked food that fuels their long study hours.
              </p>
            </div>
            
            <div className="p-8 rounded-2xl bg-[#FAFAF8] border border-[#EBEBF0] hover:shadow-xl transition-shadow group">
              <div className="w-14 h-14 bg-[#C9A84C]/10 border border-[#C9A84C]/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="text-[#C9A84C]" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#1A1A2E]">Hygienic Living</h3>
              <p className="text-[#4A4A6A] leading-relaxed">
                Cleanliness is our top priority. If you are searching for a highly hygienic PG near Acharya Institute, MLV PG offers daily housekeeping, freshly sanitized bathrooms, and a spotless kitchen. We maintain strict hygiene standards so you stay healthy, comfortable, and focused year-round.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#FAFAF8] border border-[#EBEBF0] hover:shadow-xl transition-shadow group">
              <div className="w-14 h-14 bg-[#C9A84C]/10 border border-[#C9A84C]/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Heart className="text-[#C9A84C]" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#1A1A2E]">Parent-Like Care</h3>
              <p className="text-[#4A4A6A] leading-relaxed">
                Moving away from family is hard. Our parent like care PG near Acharya Bangalore ensures you never feel alone. Our dedicated staff knows every student, monitors their well-being, and provides a safe, supportive environment with 24/7 CCTV and secure access for both boys and girls.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Why Students Choose Us (Testimonial Style) */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold font-serif text-center mb-10 text-[#1A1A2E]">Why Students from Acharya Choose MLV PG</h2>
        <div className="space-y-4">
          {[
            "“The only PG where I get real North Indian rotis and dal. It saves me from missing home.” — B.Tech Student, AIT",
            "“I feel completely safe here. The 24/7 security and biometric entry make it the best girls PG near Acharya Institute.” — BCA Student, AIGS",
            "“Zero commute time! I can wake up 10 minutes before class and still make it to Acharya College on time.” — BBA Student",
            "“The cleanliness is unmatched. My room and the washrooms are cleaned every single day without fail.” — Pharmacy Student",
            "“When I fell sick, the PG staff literally took care of me like my parents would. Truly a home away from home.” — Engineering Student"
          ].map((quote, idx) => (
            <div key={idx} className="flex gap-4 items-start p-5 rounded-xl bg-white border border-[#EBEBF0] shadow-sm">
              <span className="text-2xl mt-1">⭐️</span>
              <p className="text-[#4A4A6A] italic font-medium">{quote}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Distance & Location Section */}
      <section className="py-16 bg-[#1A1A2E] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold font-serif mb-6 text-[#C9A84C]">Unbeatable Location Next to Campus</h2>
              <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                Why waste time and money on daily travel? MLV PG Services is strategically located in Soladevanahalli, literally steps away from your college gates.
              </p>
              <ul className="space-y-5">
                <li className="flex items-center gap-4 bg-white/5 p-4 rounded-lg border border-white/10">
                  <MapPin className="text-[#C9A84C]" size={24} />
                  <span className="text-lg font-medium"><strong>0 minutes walk</strong> from Acharya Institute of Technology (Exactly Opposite)</span>
                </li>
                <li className="flex items-center gap-4 bg-white/5 p-4 rounded-lg border border-white/10">
                  <MapPin className="text-[#C9A84C]" size={24} />
                  <span className="text-lg font-medium"><strong>2 minutes walk</strong> from Acharya Institute of Graduate Studies</span>
                </li>
                <li className="flex items-center gap-4 bg-white/5 p-4 rounded-lg border border-white/10">
                  <MapPin className="text-[#C9A84C]" size={24} />
                  <span className="text-lg font-medium"><strong>3 minutes walk</strong> from Acharya College main campus</span>
                </li>
              </ul>
            </div>
            <div className="h-[400px] w-full rounded-2xl overflow-hidden border-2 border-[#C9A84C]/30 shadow-2xl">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.136894565757!2d77.4815110756779!3d13.083400087241857!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae236fc0000001%3A0x6b100bbbe250fdd9!2sAcharya%20Institute%20of%20Technology!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="MLV PG Services Location Map"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* 8. North Indian Food Menu Highlights */}
      <section className="py-16 bg-white border-b border-[#EBEBF0]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[#C9A84C] font-bold tracking-wider uppercase text-sm mb-2 block">Our Kitchen</span>
          <h2 className="text-3xl font-bold font-serif mb-4 text-[#1A1A2E]">A Taste of Home: North Indian Menu</h2>
          <p className="text-[#4A4A6A] mb-12 max-w-2xl mx-auto">
            We are proud to be the best PG near Acharya with home food. Our meals are prepared fresh daily using quality ingredients.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#FAFAF8] p-6 rounded-2xl border border-[#EBEBF0]">
              <h3 className="text-xl font-bold text-[#1A1A2E] mb-4 border-b pb-3">🌅 Breakfast</h3>
              <ul className="text-[#4A4A6A] space-y-3 text-left list-disc list-inside marker:text-[#C9A84C]">
                <li>Hot Aloo Parathas with Curd</li>
                <li>Poha & Jalebi</li>
                <li>Chole Bhature</li>
                <li>Fresh Tea & Coffee</li>
              </ul>
            </div>
            <div className="bg-[#FAFAF8] p-6 rounded-2xl border border-[#EBEBF0]">
              <h3 className="text-xl font-bold text-[#1A1A2E] mb-4 border-b pb-3">☀️ Lunch</h3>
              <ul className="text-[#4A4A6A] space-y-3 text-left list-disc list-inside marker:text-[#C9A84C]">
                <li>Rajma Chawal</li>
                <li>Fresh Phulka Rotis</li>
                <li>Seasonal Dry Sabzi (Bhindi, Gobi)</li>
                <li>Yellow Dal Tadka & Salad</li>
              </ul>
            </div>
            <div className="bg-[#FAFAF8] p-6 rounded-2xl border border-[#EBEBF0]">
              <h3 className="text-xl font-bold text-[#1A1A2E] mb-4 border-b pb-3">🌙 Dinner</h3>
              <ul className="text-[#4A4A6A] space-y-3 text-left list-disc list-inside marker:text-[#C9A84C]">
                <li>Paneer Butter Masala</li>
                <li>Dal Makhani & Jeera Rice</li>
                <li>Hot Rotis & Papad</li>
                <li>Occasional Sweet Dish (Kheer/Gulab Jamun)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ Section */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold font-serif text-center mb-10 text-[#1A1A2E]">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: "Is MLV PG the best North Indian PG near Acharya College?",
              a: "Yes, MLV PG is highly rated (4.1★) specifically for its authentic North Indian home-cooked food, offering daily fresh dal, roti, and sabzi unlike typical local PGs."
            },
            {
              q: "How far is the PG from Acharya Institute of Technology?",
              a: "We are located exactly opposite the campus gate. It is literally a 0 to 2-minute walk to Acharya Institute of Technology."
            },
            {
              q: "Is it a safe and hygienic PG near Acharya Institute for girls?",
              a: "Absolutely. We offer dedicated, secure accommodation for girls with 24/7 CCTV surveillance, biometric access, and female staff. Our strict cleanliness protocols make us the most hygienic PG near Acharya Institute."
            },
            {
              q: "What does 'parent-like care PG Acharya Bangalore' mean?",
              a: "It means our management treats students like family. We monitor student well-being, ensure they eat properly, and provide immediate assistance during illnesses or emergencies."
            },
            {
              q: "Do you serve vegetarian and non-vegetarian food?",
              a: "Yes, we serve both. However, our specialty remains our rich, hygienic, and authentic North Indian vegetarian meals that remind students of home."
            },
            {
              q: "Are you close to Acharya Institute of Graduate Studies (AIGS)?",
              a: "Yes! AIGS is situated within the same campus vicinity, making MLV PG just a 2-3 minute walking distance for graduate students."
            },
            {
              q: "What amenities are included in the rent?",
              a: "Rent includes North Indian meals (breakfast, lunch, dinner), high-speed WiFi, 24/7 electricity backup, daily housekeeping, CCTV security, and RO drinking water."
            },
            {
              q: "Is MLV PG open 24 hours?",
              a: "Yes, our facility is 24hr open to accommodate the varied academic and project schedules of students, secured round-the-clock by staff and biometrics."
            },
            {
              q: "How often is the PG cleaned?",
              a: "Rooms, washrooms, and common areas are cleaned daily by professional housekeeping staff, maintaining our reputation as a highly hygienic PG in Bangalore."
            },
            {
              q: "Can I book a room before arriving in Bangalore?",
              a: "Yes, we highly recommend pre-booking as our rooms fill up quickly before the semester starts. You can call us to block your bed."
            }
          ].map((faq, idx) => (
            <div key={idx} className="bg-white border border-[#EBEBF0] rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#1A1A2E] flex items-start gap-3 mb-2">
                <HelpCircle className="text-[#C9A84C] mt-0.5 flex-shrink-0" size={20} />
                {faq.q}
              </h3>
              <p className="text-[#4A4A6A] pl-8 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 10. CTA Section & 11. Internal Links */}
      <section id="contact-cta" className="py-20 bg-gradient-to-br from-[#1A1A2E] to-[#2A2A4A] text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(201,168,76,0.8)_0,transparent_100%)]"></div>
        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <h2 className="text-4xl font-bold font-serif mb-6">Book Your PG Near Acharya College Today</h2>
          <p className="text-xl text-gray-300 mb-10">
            Don't settle for less. Experience authentic North Indian food, parent-like care, and a hygienic lifestyle right opposite your college.
          </p>
          <a href="tel:+919066570348" className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-[#C9A84C] to-[#E8C96B] text-[#1A1A2E] text-lg font-bold rounded-full shadow-2xl hover:scale-105 transition-transform mb-12">
            <PhoneCall size={24} /> Call Now: +91 90665 70348
          </a>
          
          <div className="border-t border-white/20 pt-8 mt-4">
            <p className="text-gray-400 mb-4 font-medium uppercase tracking-wider text-sm">Explore More</p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link href="/rooms" className="text-gray-300 hover:text-[#C9A84C] flex items-center gap-1 transition-colors">
                View Rooms & Pricing <ChevronRight size={14} />
              </Link>
              <Link href="/gallery" className="text-gray-300 hover:text-[#C9A84C] flex items-center gap-1 transition-colors">
                Photo Gallery <ChevronRight size={14} />
              </Link>
              <Link href="/#about" className="text-gray-300 hover:text-[#C9A84C] flex items-center gap-1 transition-colors">
                About MLV PG <ChevronRight size={14} />
              </Link>
              <Link href="/#contact" className="text-gray-300 hover:text-[#C9A84C] flex items-center gap-1 transition-colors">
                Contact Us <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
