// Details that appear on every page. Change them here once.
export const site = {
  name: 'Amr Ibrahim',
  role: 'Transformation Specialist, Infor GPS',
  // Draft headline from the brief [TO CONFIRM]
  headline: 'ERP transformation for manufacturers and distributors, built on Infor CloudSuite.',
  // Invitation line used in every "Get in touch" block and on the Contact page.
  invitation: "If you'd like to talk about ERP transformation, or about making deals hold up after they're signed, I'd be glad to hear from you.",
  location: 'Düsseldorf, Germany',
  email: 'contact@amribrahim.work',
  linkedin: 'https://www.linkedin.com/in/amrrribrahim',
  year: 2026,
};

export type PageKey = 'home' | 'about' | 'experience' | 'contact' | 'impressum' | 'datenschutz';

export const navPages: { key: PageKey; label: string; href: string }[] = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'about', label: 'About', href: '/about/' },
  { key: 'experience', label: 'Experience', href: '/experience/' },
  { key: 'contact', label: 'Contact', href: '/contact/' },
];

export type NavSection = { id: string; label: string };
