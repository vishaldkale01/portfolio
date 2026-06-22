export interface NavigationLink {
  path: string;
  label: string;
}

export const primaryNavigationLinks: NavigationLink[] = [
  { path: '/', label: 'Home' },
  { path: '/experience', label: 'Experience' },
  { path: '/projects', label: 'Projects' },
  { path: '/contact', label: 'Contact' },
];

export const learningNavigationLink: NavigationLink = { path: '/learning', label: 'Learning' };

export interface SocialLink {
  href: string;
  label: string;
  icon: 'github' | 'linkedin';
}

export const socialLinks: SocialLink[] = [
  {
    href: 'https://github.com/vishaldkale01',
    label: 'GitHub profile',
    icon: 'github',
  },
  {
    href: 'https://www.linkedin.com/in/vishal-kale-72b261218',
    label: 'LinkedIn profile',
    icon: 'linkedin',
  },
];
