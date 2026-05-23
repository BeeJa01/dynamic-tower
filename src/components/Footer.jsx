import Link from "next/link";
import { LocateIcon, PhoneCall, WhatsApp, TikTok, Instagram, YouTube, Facebook } from "@/components/Icons";

const Footer = () => {
  return (
    <footer className="bg-gray-950 text-gray-400">

      {/* CTA Strip */}
      <div className="bg-orange-500 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center
                        justify-between gap-4 text-center md:text-left">
          <div>
            <h3 className="text-white font-black text-2xl">Hungry? Order Now.</h3>
            <p className="text-orange-100 text-sm mt-1">
              Hot meals delivered in Ogbomoso — fast and fresh.
            </p>
          </div>
          <Link href="/product">
            <button className="bg-white text-orange-500 font-black px-8 py-3
                               rounded-full text-sm hover:bg-orange-50 transition-all
                               shadow-lg shadow-orange-600/30 active:scale-95">
              Order Now →
            </button>
          </Link>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/">
              <img src="/logo.webp" alt="Dynamic Tower" loading="lazy" className="h-14 w-auto mb-4 brightness-0 invert" />
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Dynamic Tower Multipurpose LTD — delicious meals and snacks delivered to your door in Ogbomoso.
            </p>
            <div className="flex flex-col gap-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <LocateIcon size={14} className="text-orange-500 shrink-0" />
                <span>Ogbomoso, Oyo State, Nigeria</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall size={14} className="text-orange-500 shrink-0" />
                <span>+234 810 7191 319</span>
              </div>
            </div>
            {/* Socials */}
            <div className="flex gap-3 mt-5">
              <a href="https://wa.me/message/U6WRAFLQS6R7A1" className="w-9 h-9 bg-gray-800 hover:bg-orange-500 rounded-full
                                    flex items-center justify-center transition-colors">
                <WhatsApp className="text-base text-gray-300" />
              </a>
              <a href="https://tiktok.com/@dynamic_tower_foods" className="w-9 h-9 bg-gray-800 hover:bg-orange-500 rounded-full
                                    flex items-center justify-center transition-colors">
                <TikTok className="text-base text-gray-300" />
              </a>
              <a href="https://www.facebook.com/share/18eowyR2xQ/" className="w-9 h-9 bg-gray-800 hover:bg-orange-500 rounded-full
                                    flex items-center justify-center transition-colors">
                <Facebook className="text-base text-gray-300" />
              </a>
              <a href="https://www.instagram.com/dymamictowerfoods?igsh=MXBwNTBvb2tzNG9ucA==" className="w-9 h-9 bg-gray-800 hover:bg-orange-500 rounded-full
                                    flex items-center justify-center transition-colors">
                <Instagram className="text-base text-gray-300" />
              </a>
              <a href="https://www.youtube.com/@oluwatimilehinadekunle5388" className="w-9 h-9 bg-gray-800 hover:bg-orange-500 rounded-full
                                    flex items-center justify-center transition-colors">
                <YouTube className="text-base text-gray-300" />
              </a>
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: "Quick Links",
              links: [
                { label: "Home", to: "/" },
                { label: "About Us", to: "/aboutus" },
                { label: "Services", to: "/services" },
                { label: "Order Now", to: "/product" },
              ],
            },
            {
              title: "Need Help?",
              links: [
                { label: "Chat with Us", to: "/chat" },
                { label: "Contact Us", to: "/contact" },
                { label: "Help Center", to: "/help" },
                { label: "Login", to: "/login" },
              ],
            },
            {
              title: "Legal",
              links: [
                { label: "Privacy Notice", to: "/privacy" },
                { label: "Cookie Policy", to: "/cookie-policy" },
                { label: "Terms & Conditions", to: "/terms" },
                { label: "Preferences", to: "/preferences" },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-4">
                {col.title}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      href={to}
                      className="text-sm text-gray-500 hover:text-orange-400 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800 py-4 px-4 text-center text-xs text-gray-600">
        © 2026 Dynamic Tower Multipurpose LTD. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
