'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';

const nutritionClientTypes = [
  { id: 'weight-management',      label: 'Weight Management',               emoji: '⚖️' },
  { id: 'clinical',               label: 'Clinical Client',                  emoji: '🏥' },
  { id: 'fitness',                label: 'Fitness Client',                   emoji: '💪' },
  { id: 'lifestyle',              label: 'Lifestyle Client',                 emoji: '🌿' },
  { id: 'pregnant-lactating',     label: 'Pregnant or Lactating Women',      emoji: '🤰' },
  { id: 'children-adolescent',    label: 'Children & Adolescent',            emoji: '🧒' },
  { id: 'elderly',                label: 'Elderly Client',                   emoji: '🧓' },
  { id: 'special-diet',           label: 'Special Diet',                     emoji: '🥦' },
  { id: 'corporate-professional', label: 'Corporate / Busy Professional',    emoji: '💼' },
  { id: 'emotional-behavioral',   label: 'Emotional or Behavioral Client',   emoji: '🧠' },
  { id: 'hormonal-imbalance',     label: 'Hormonal Imbalance',               emoji: '🔬' },
  { id: 'digestive-health',       label: 'Digestive Health',                 emoji: '🫁' },
  { id: 'post-surgery',           label: 'Post Surgery / Recovery',          emoji: '🩺' },
  { id: 'fertility',              label: 'Fertility or Preconception',       emoji: '🌸' },
  { id: 'skin-beauty',            label: 'Skin & Beauty Nutrition',          emoji: '✨' },
  { id: 'students',               label: 'Students',                         emoji: '📚' },
  { id: 'low-budget',             label: 'Low Budget Client',                emoji: '💰' },
  { id: 'religious-fasting',      label: 'Religious or Fasting Client',      emoji: '🙏' },
  { id: 'eating-disorder',        label: 'Eating Disorder Support',          emoji: '💚' },
  { id: 'busy-mothers',           label: 'Busy Mothers / Family Nutrition',  emoji: '👩‍👧' },
  { id: 'chronic-dieters',        label: 'Chronic Dieters',                  emoji: '🔄' },
  { id: 'food-business',          label: 'Food Business Owners',             emoji: '🍽️' },
  { id: 'food-allergy',           label: 'Food Allergy / Intolerance',       emoji: '⚠️' },
  { id: 'diabetic',               label: 'Diabetic Client',                  emoji: '🩸' },
  { id: 'hypertensive',           label: 'Hypertensive Client',              emoji: '❤️' },
  { id: 'weight-plateau',         label: 'Weight Plateau Client',            emoji: '📊' },
  { id: 'underweight',            label: 'Underweight / Malnourished',       emoji: '🌱' },
  { id: 'shift-workers',          label: 'Shift / Night Workers',            emoji: '🌙' },
  { id: 'travelling',             label: 'Travelling Client',                emoji: '✈️' },
  { id: 'luxury',                 label: 'Luxury / High-End Client',         emoji: '👑' },
  { id: 'postpartum',             label: 'Postpartum Women',                 emoji: '👶' },
  { id: 'mens-health',            label: "Men's Health Client",              emoji: '🏋️' },
  { id: 'immune-boosting',        label: 'Immune Boosting',                  emoji: '🛡️' },
  { id: 'stress-mental-health',   label: 'Stress & Mental Health',           emoji: '🧘' },
  { id: 'event-prep',             label: 'Preparing for an Event',           emoji: '🎯' },
  { id: 'influencer',             label: 'Influencer / Content Creator',     emoji: '📱' },
  { id: 'beginner',               label: "Beginner — I don't know where to start", emoji: '🙋' },
];

const serviceData = {
  induction:      { title: "Induction Service",       description: "Select your preferred Jollof package.", emoji: "🎓", categories: [{ id: 1, name: "Starter Bundle", qty: "20 plates of Jollof & Fried rice with chicken", price: 60000 }, { id: 2, name: "Event Bundle", qty: "50 plates of Jollof & Fried rice with chicken", price: 147000 }]},
  birthday:       { title: "Birthday Catering",        description: "Choose a feast for your celebration.", emoji: "🎂", categories: [{ id: 1, name: "Mini Celebration", qty: "Small Chops + Main", price: 85000 }, { id: 2, name: "Grand Party", qty: "Full Buffet Style", price: "Custom" }]},
  "personal-chef":{ title: "Personal Chef",            description: "Professional culinary service at your home.", emoji: "👨‍🍳", categories: [{ id: 1, name: "One-Time Meal", qty: "Single Visit", price: 25000 }, { id: 2, name: "Weekly Meal Prep", qty: "3 Visits/Week", price: 70000 }, { id: 3, name: "Monthly", qty: "Once a meal", price: 300000 }]},
  corporate: {
    title: "Nutritional Consultation",
    description: "",
    emoji: "🥗",
    slogan: "Your body goals, our priority.",
    timeframe: "3 hours per session",
    categories: [
      { id: 1, name: "Consultation Only",                qty: "1 session · 3 hours", price: 30000, detail: "In-depth nutritional assessment and personalised guidance." },
      { id: 2, name: "Consultation + Meal Plan",         qty: "1 session · 3 hours", price: 40000, detail: "Full consultation plus a customised meal plan tailored to your goals." },
      { id: 3, name: "1-Month Coaching with Follow-Up",  qty: "Ongoing · 1 month",   price: 50000, detail: "Comprehensive coaching, accountability check-ins, and follow-up support." },
    ],
  },
  wedding:        { title: "Wedding Ceremony",         description: "We craft delicious menus for your big day.", emoji: "💍", categories: [{ id: 1, name: "Basic Package", qty: "Small Chops + Main", price: 85000 }, { id: 2, name: "Grand Party", qty: "Full Buffet Style", price: "Custom" }]},
  convocation:    { title: "Convocation",              description: "Celebrate your years of hard work with a joyful feast.", emoji: "🎓", categories: [{ id: 1, name: "Basic Package", qty: "20 plates of Jollof & Fried rice with chicken", price: 60000 }, { id: 2, name: "Premium Package", qty: "50 plates of Jollof & Fried rice with chicken", price: 147000 }]},
  anniversaries:  { title: "Anniversary",              description: "Relive your favourite memories over an intimate meal.", emoji: "💕", categories: [{ id: 1, name: "Basic Package", qty: "20 plates of Jollof & Fried rice with chicken", price: 60000 }, { id: 2, name: "Premium Package", qty: "50 plates of Jollof & Fried rice with chicken", price: 147000 }]},
  retirements:    { title: "Retirement Service",       description: "Toast to your legacy with a remarkable celebration.", emoji: "🏆", categories: [{ id: 1, name: "Basic Package", qty: "20 plates of Jollof & Fried rice with chicken", price: 60000 }, { id: 2, name: "Premium Package", qty: "50 plates of Jollof & Fried rice with chicken", price: 147000 }]},
};

export default function BookingPage({ params }) {
  const { serviceSlug } = use(params);
  const router = useRouter();
  const currentService = serviceData[serviceSlug];
  const [selected, setSelected] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [clientType, setClientType] = useState(null);
  const isNutrition = serviceSlug === 'corporate';

  if (!currentService) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 text-center px-4">
        <span className="text-5xl mb-4">🔍</span>
        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Service not found</h2>
        <button onClick={() => router.push('/services')} className="mt-4 bg-orange-500 text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-orange-600 transition-all">
          Browse Services
        </button>
      </div>
    );
  }

  const handleConfirm = () => {
    if (!selected) return;
    const priceStr = typeof selected.price === 'number' ? `₦${selected.price.toLocaleString()}` : selected.price;
    const clientLine = isNutrition && clientType ? `👤 *Client Type:* ${clientType.emoji} ${clientType.label}\n` : '';
    const companyLine = companyName ? `🏢 *Company:* ${companyName}\n` : '';
    const message = `🍽️ *Service Booking — Dynamic Tower Foods*\n\n📋 *Service:* ${currentService.title}\n📦 *Package:* ${selected.name}\n📝 *Details:* ${selected.qty}\n💰 *Price:* ${priceStr}\n${clientLine}${companyLine}\nPlease confirm my booking. Thank you!`;
    window.open(`https://wa.me/2348107191319?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-5">

        {/* Header */}
        <div>
          <button onClick={() => router.push('/services')} className="flex items-center gap-1 text-orange-500 font-semibold text-sm mb-4 hover:text-orange-600 transition-colors">
            ← Back to Services
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center text-3xl border border-orange-100 dark:border-orange-800">{currentService.emoji}</div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">{currentService.title}</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{currentService.description}</p>
            </div>
          </div>
        </div>

        {/* Nutrition-only: slogan + timeframe banner */}
        {isNutrition && (
          <div className="bg-linear-to-r from-green-50 to-orange-50 dark:from-green-900/20 dark:to-orange-900/20 rounded-2xl px-5 py-4 border border-green-100 dark:border-green-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-green-700 dark:text-green-300 font-black text-sm italic">✨ `{currentService.slogan}`</p>
            <span className="flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-3 py-1.5 rounded-full self-start sm:self-auto">
              ⏱️ {currentService.timeframe}
            </span>
          </div>
        )}

        {/* Package selection */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="font-black text-gray-900 dark:text-white mb-4">Choose a Package</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentService.categories.map((cat) => (
              <button key={cat.id} onClick={() => setSelected(cat)}
                className={`text-left p-5 rounded-2xl border-2 transition-all ${selected?.id === cat.id ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-md shadow-orange-500/10' : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:border-orange-300 dark:hover:border-orange-700'}`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-black text-base ${selected?.id === cat.id ? 'text-orange-500' : 'text-gray-900 dark:text-white'}`}>{cat.name}</h3>
                  {selected?.id === cat.id && <span className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0">✓</span>}
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{cat.qty}</p>
                {cat.detail && <p className="text-xs text-gray-400 mb-2 italic">{cat.detail}</p>}
                <p className="text-2xl font-black text-orange-500">{typeof cat.price === 'number' ? `₦${cat.price.toLocaleString()}` : cat.price}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Nutrition-only: client type selector */}
        {isNutrition && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h2 className="font-black text-gray-900 dark:text-white mb-1">What type of client are you?</h2>
            <p className="text-xs text-gray-400 mb-4">Choose the option that best describes you — this helps us prepare before your session.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {nutritionClientTypes.map((type) => (
                <button key={type.id} onClick={() => setClientType(clientType?.id === type.id ? null : type)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 text-left text-sm font-semibold transition-all ${clientType?.id === type.id ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-green-300 dark:hover:border-green-700'}`}>
                  <span className="text-base shrink-0">{type.emoji}</span>
                  <span className="leading-snug">{type.label}</span>
                  {clientType?.id === type.id && <span className="ml-auto w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0">✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Corporate company name field (non-nutrition) */}
        {selected && !isNutrition && serviceSlug === 'corporate' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Company Name</label>
            <input type="text" placeholder="Enter your company name" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:outline-none focus:border-orange-400 text-sm transition-all" />
          </div>
        )}

        {/* Summary card */}
        {selected && (
          <div className="bg-orange-500 rounded-2xl p-5 text-white shadow-lg shadow-orange-500/25">
            <p className="text-orange-100 text-xs font-bold uppercase tracking-widest mb-1">Selected Package</p>
            <p className="font-black text-lg">{selected.name}</p>
            <p className="text-orange-100 text-sm">{selected.qty}</p>
            {isNutrition && clientType && (
              <p className="text-orange-100 text-sm mt-1">{clientType.emoji} {clientType.label}</p>
            )}
            <p className="text-2xl font-black mt-2">{typeof selected.price === 'number' ? `₦${selected.price.toLocaleString()}` : selected.price}</p>
          </div>
        )}

        <button onClick={handleConfirm} disabled={!selected}
          className={`w-full py-4 rounded-xl font-black text-sm transition-all active:scale-95 ${selected ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'}`}>
          {selected ? `✅ Book "${selected.name}" via WhatsApp` : 'Select a package to continue'}
        </button>
        <p className="text-xs text-center text-gray-400 pb-4">We`ll get back to you within 24 hours to confirm your booking details.</p>
      </div>
    </div>
  );
}
