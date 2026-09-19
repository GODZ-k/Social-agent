import Link from "next/link";
import { Logo } from "./logo";
import { company } from "@/lib/content/company";

const GROUPS = [
  {
    title: "Product",
    links: [
      { href: "/how-it-works", label: "How it works" },
      { href: "/services", label: "Services" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/blog", label: "Blog" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-24 max-w-5xl px-4 pb-10 md:mt-32 md:px-6">
      <div className="grid gap-10 border-t border-border pt-10 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
        <div className="min-w-0">
          <Logo />
          <p className="type-label mt-3 max-w-[36ch]">
            An agent that runs your social media, and asks before it posts.
          </p>
        </div>
        {GROUPS.map((group) => (
          <nav key={group.title} aria-label={group.title} className="min-w-0">
            <p className="text-sm font-medium">{group.title}</p>
            <ul className="mt-3 grid gap-2.5">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="type-label transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <p className="type-label mt-10 tabular-nums">
        © {new Date().getFullYear()} {company.legalName}
      </p>
    </footer>
  );
}
