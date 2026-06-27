import Link from "next/link";

export default function Footer() {
  const quickLinks = [
    { label: "Home", href: "#home" },
    { label: "About Us", href: "#about" },
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Testimonials", href: "#testimonials" },
  ];

  const socials = [
    { label: "f", href: "#", title: "Facebook" },
    { label: "in", href: "#", title: "Instagram" },
    { label: "t", href: "#", title: "Twitter" },
  ];

  const contacts = [
    { icon: "📍", text: "123 School Road, Lagos, Nigeria" },
    { icon: "📞", text: "+234 800 000 0000" },
    { icon: "📞", text: "+234 810 000 0000" },
    { icon: "📧", text: "info@shalommodelcollege.edu.ng" },
    { icon: "🌐", text: "www.shalommodelcollege.edu.ng" },
  ];

  const officeHours = [
    { day: "Mon – Fri", time: "8:00am – 4:00pm", closed: false },
    { day: "Saturday", time: "9:00am – 1:00pm", closed: false },
    { day: "Sunday", time: "Closed", closed: true },
  ];

  return (
    <footer id="contact" className="bg-primary text-gray-400">
      {/* Main Footer */}
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Column 1 — School Info */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img
              src="/shalomlogo.svg"
              alt="Shalom logo"
              className="w-16 h-16 bg-white rounded-full p-2 object-contain shadow-sm"
            />
            <div>
              <p className="text-white font-bold text-sm leading-tight">
                Shalom Model College
              </p>
              <p className="text-xs text-gray-500">Student Records System</p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-gray-500">
            Providing quality education that nurtures academic excellence, moral
            integrity, and leadership skills in every student.
          </p>

          {/* Socials */}
          <div className="flex gap-3 mt-6">
            {socials.map((social) => (
              <a
                key={social.title}
                href={social.href}
                title={social.title}
                className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-primary-50 text-white flex items-center justify-center text-xs font-bold transition"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>

        {/* Column 2 — Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-3 text-sm">
            {quickLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="hover:text-blue-400 transition">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3 — Portals + Office Hours */}
        <div>
          <h4 className="text-white font-semibold mb-4">Portals</h4>
          <ul className="space-y-3 text-sm mb-8">
            <li>
              <Link href="/login" className="hover:text-blue-400 transition">
                Staff Login
              </Link>
            </li>
            <li>
              <Link
                href="/parent/login"
                className="hover:text-blue-400 transition"
              >
                Parent Portal
              </Link>
            </li>
          </ul>

          <h4 className="text-white font-semibold mb-4">Office Hours</h4>
          <ul className="space-y-2 text-sm">
            {officeHours.map((item) => (
              <li key={item.day} className="flex justify-between">
                <span>{item.day}</span>
                <span
                  className={item.closed ? "text-red-400" : "text-gray-400"}
                >
                  {item.time}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4 — Contact */}
        <div>
          <h4 className="text-white font-semibold mb-4">Contact Us</h4>
          <ul className="space-y-4 text-sm">
            {contacts.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-blue-400 mt-0.5">{item.icon}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-600">
          <p>
            © {new Date().getFullYear()} Shalom Model College. All rights
            reserved.
          </p>
          <p>Designed for Nigerian Schools</p>
        </div>
      </div>
    </footer>
  );
}
