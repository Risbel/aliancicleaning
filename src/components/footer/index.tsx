import { HugeiconsIcon } from "@hugeicons/react";
import {
  Mail01Icon,
  Call02Icon,
  Facebook01Icon,
  InstagramIcon,
  Linkedin01Icon,
  NewTwitterIcon,
  YoutubeIcon,
} from "@hugeicons/core-free-icons";

const socialLinks = [
  { icon: Facebook01Icon, label: "Facebook", href: "#" },
  { icon: InstagramIcon, label: "Instagram", href: "#" },
  { icon: Linkedin01Icon, label: "LinkedIn", href: "#" },
  { icon: NewTwitterIcon, label: "X", href: "#" },
  { icon: YoutubeIcon, label: "YouTube", href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-[#0f1a24] text-[#e8edf0]">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2">
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-lg font-semibold tracking-tight text-white">
                Alianci Cleaning
              </p>
              <p className="mt-1 text-sm text-[#e8edf0]/60">
                Professional cleaning services you can trust.
              </p>
            </div>
            <div className="flex items-center gap-4">
              {socialLinks.map(({ icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="text-[#e8edf0]/50 transition-colors duration-200 hover:text-white"
                >
                  <HugeiconsIcon icon={icon} size={20} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold tracking-[0.15em] text-[#e8edf0]/40 uppercase">
              Contact
            </p>
            <a
              href="mailto:aliancicleanig@gmail.com"
              className="flex items-center gap-3 text-sm text-[#e8edf0]/70 transition-colors duration-200 hover:text-white"
            >
              <HugeiconsIcon icon={Mail01Icon} size={18} strokeWidth={1.5} />
              aliancicleanig@gmail.com
            </a>
            <a
              href="tel:+15129028518"
              className="flex items-center gap-3 text-sm text-[#e8edf0]/70 transition-colors duration-200 hover:text-white"
            >
              <HugeiconsIcon icon={Call02Icon} size={18} strokeWidth={1.5} />
              512-902-8518
            </a>
          </div>
        </div>

        <hr className="mt-12 border-white/10" />

        <p className="mt-6 text-xs text-[#e8edf0]/40">
          © 2026 Alianci Cleaning Services. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
