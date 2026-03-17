export type NavigationItem = {
  label: string;
  href: string;
};

export type SocialLink = {
  label: string;
  shortLabel: string;
  href: string;
};

export type HeroProof = {
  value: string;
  label: string;
};

export type IntroPillar = {
  title: string;
  description: string;
};

export type TechnologyItem = {
  title: string;
  description: string;
  image: string;
};

export type FabricOption = {
  label: string;
  image: string;
};

export type CertificateItem = {
  label: string;
  image: string;
};

export type ProjectItem = {
  title: string;
  description: string;
  cover: string;
  gallery: string[];
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type ContactDetails = {
  phone: string;
  email: string;
  address: string;
  mapUrl: string;
  hours: string[];
};

export const navigation: NavigationItem[] = [
  { label: 'About', href: '#about' },
  { label: 'Difference', href: '#difference' },
  { label: 'Fabrics', href: '#fabrics' },
  { label: 'Projects', href: '#projects' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
];

export const socialLinks: SocialLink[] = [
  { label: 'Facebook', shortLabel: 'Fb', href: 'https://www.facebook.com/tigran.galstyan.99' },
  { label: 'Yelp', shortLabel: 'Ye', href: 'https://www.yelp.com/biz/areve-beverly-hills' },
  { label: 'Instagram', shortLabel: 'Ig', href: 'https://www.instagram.com/areve.us/' },
  { label: 'YouTube', shortLabel: 'Yt', href: 'https://www.youtube.com/channel/UCpP70TSoI6X7PJfWhy3j7zA' },
  { label: 'WhatsApp', shortLabel: 'Wa', href: 'https://wa.me/17608008808' },
];

export const heroImages = {
  primary: '/media/hero/patio-main.jpeg',
  secondary: '/media/hero/lounge.jpg',
  ambient: '/media/hero/shade-wall.jpg',
};

export const heroSlides: string[] = [
  '/media/hero/slide-01.jpg',
  '/media/hero/slide-02.jpg',
  '/media/hero/slide-03.jpg',
];

export const aboutMedia = {
  image: '/media/about/portrait.jpeg',
  video: '/media/about/intro.mov',
  videoPoster: '/media/about/intro-poster.png',
  experience: '25+',
};

export const featureImages = {
  allSeasons: '/media/bands/all-seasons.jpeg',
  fabrics: '/media/bands/fabrics.jpg',
  faq: '/media/faq/patio.jpeg',
};

export const heroProofs: HeroProof[] = [
  { value: '25 ft', label: 'maximum width supported' },
  { value: '18 ft', label: 'maximum height available' },
  { value: 'No zippers', label: 'continuous bead retention system' },
];

export const introPillars: IntroPillar[] = [
  {
    title: 'Idea & Concept',
    description: 'Innovative solutions for your vision.',
  },
  {
    title: 'Design & Technique',
    description: 'Precision engineering meets creative design',
  },
];

export const differenceBullets: string[] = [
  'Our screens: zipper-free design.',
  'Adjustable tracks.',
  'Top-grade materials for durability and longevity.',
  'Seamlessly blend with existing architecture or decor.',
  'Predefined sizes for a precise fit.',
  'Expert installation.',
];

export const technologyItems: TechnologyItem[] = [
  {
    title: 'No zippers, no sewing, no problems',
    description:
      'Screens are edged with low-friction tape wrapped around a PVC cord and RF-welded for exceptional strength.',
    image: '/media/technology/no-zippers.png',
  },
  {
    title: 'Self-adjusting tracks',
    description:
      'Three-part aluminum tracks and hidden springs maintain proper tension without adjustment screws or magnets.',
    image: '/media/technology/adjustable-tracks.png',
  },
  {
    title: 'No blowouts',
    description:
      'The guide system keeps screens secured from reel to track, while smart motors stop movement before alignment is compromised.',
    image: '/media/technology/no-blowouts.png',
  },
  {
    title: 'Strong corners',
    description:
      'Injection-molded components lock bottom track, side tracks, and screen together into a far stronger assembly.',
    image: '/media/technology/strong-corners.png',
  },
  {
    title: 'Level screens',
    description:
      'Reel compensators fine-tune roll-up behavior so the bottom track stays visually level and polished.',
    image: '/media/technology/level-screens.png',
  },
  {
    title: 'Smart motors',
    description:
      'Somfy-ready motors detect obstacles, respond to wind logic, and integrate with broader home automation systems.',
    image: '/media/technology/smart-motors.png',
  },
];

export const fabricOptions: FabricOption[] = [
  { label: 'Fabric 01', image: '/media/fabrics/fabric-01.png' },
  { label: 'Fabric 02', image: '/media/fabrics/fabric-02.png' },
  { label: 'Fabric 03', image: '/media/fabrics/fabric-03.png' },
  { label: 'Fabric 04', image: '/media/fabrics/fabric-04.png' },
  { label: 'Fabric 05', image: '/media/fabrics/fabric-05.png' },
  { label: 'Fabric 06', image: '/media/fabrics/fabric-06.png' },
  { label: 'Fabric 07', image: '/media/fabrics/fabric-07.png' },
  { label: 'Fabric 08', image: '/media/fabrics/fabric-08.png' },
  { label: 'Fabric 09', image: '/media/fabrics/fabric-09.png' },
  { label: 'Fabric 10', image: '/media/fabrics/fabric-10.png' },
];

export const certificates: CertificateItem[] = [
  { label: 'Certificate 01', image: '/media/certificates/certificate-01.jpeg' },
  { label: 'Certificate 02', image: '/media/certificates/certificate-02.jpeg' },
  { label: 'Certificate 03', image: '/media/certificates/certificate-03.jpeg' },
  { label: 'Certificate 04', image: '/media/certificates/certificate-04.jpeg' },
  { label: 'Certificate 05', image: '/media/certificates/certificate-05.jpeg' },
  { label: 'Certificate 06', image: '/media/certificates/certificate-06.jpeg' },
  { label: 'Certificate 07', image: '/media/certificates/certificate-07.jpeg' },
  { label: 'Certificate 08', image: '/media/certificates/certificate-08.jpeg' },
];

export const projects: ProjectItem[] = [
  {
    title: 'Veranda Lounge',
    description:
      "We've revitalized their patio with durable screens that replaced outdated weather-sensitive systems, creating a cleaner and more dependable outdoor experience.",
    cover: '/media/projects/veranda/cover.jpg',
    gallery: [
      '/media/projects/veranda/gallery-01.jpg',
      '/media/projects/veranda/gallery-02.jpg',
      '/media/projects/veranda/gallery-03.jpg',
      '/media/projects/veranda/gallery-04.jpg',
      '/media/projects/veranda/gallery-05.jpg',
    ],
  },
  {
    title: 'Sky Hookah Lounge',
    description:
      "After aligning with the owner's vision, we converted the patio into a modern lounge that protects guests from weather while preserving privacy and warmth.",
    cover: '/media/projects/sky-hookah/cover.jpeg',
    gallery: [
      '/media/projects/sky-hookah/gallery-01.jpg',
      '/media/projects/sky-hookah/gallery-02.jpg',
      '/media/projects/sky-hookah/gallery-03.jpg',
      '/media/projects/sky-hookah/gallery-04.jpg',
      '/media/projects/sky-hookah/gallery-05.jpg',
    ],
  },
  {
    title: 'Beverly Hills',
    description:
      'A louvered pergola needed integrated sunshade control, so we installed screens that disappear into the patio while keeping the space comfortable.',
    cover: '/media/projects/beverly-hills/cover.jpeg',
    gallery: [
      '/media/projects/beverly-hills/gallery-01.jpeg',
      '/media/projects/beverly-hills/gallery-02.jpeg',
    ],
  },
  {
    title: 'Burbank Mansion',
    description:
      'This large-scale installation spans patio, grill area, outdoor gym, and garage to deliver a unified luxury environment with year-round usability.',
    cover: '/media/projects/burbank-mansion/cover.jpeg',
    gallery: [
      '/media/projects/burbank-mansion/gallery-01.jpeg',
      '/media/projects/burbank-mansion/gallery-02.jpeg',
      '/media/projects/burbank-mansion/gallery-03.jpeg',
      '/media/projects/burbank-mansion/gallery-04.jpeg',
      '/media/projects/burbank-mansion/gallery-05.jpeg',
      '/media/projects/burbank-mansion/gallery-06.jpg',
    ],
  },
  {
    title: 'Woodland Hills',
    description:
      'We matched the patio finish precisely and turned the space into an inviting day-to-night lounge with weather protection and a polished custom look.',
    cover: '/media/projects/woodland-hills/cover.jpg',
    gallery: [
      '/media/projects/woodland-hills/gallery-01.jpg',
      '/media/projects/woodland-hills/gallery-02.jpg',
      '/media/projects/woodland-hills/gallery-03.jpg',
    ],
  },
  {
    title: 'Glendale Hills',
    description:
      'The design preserved city views while adding privacy and weather control, giving the client a patio atmosphere that feels elevated but still open.',
    cover: '/media/projects/glendale-hills/cover.jpg',
    gallery: [
      '/media/projects/glendale-hills/gallery-01.jpg',
      '/media/projects/glendale-hills/gallery-02.jpg',
      '/media/projects/glendale-hills/gallery-03.jpg',
      '/media/projects/glendale-hills/gallery-04.jpg',
      '/media/projects/glendale-hills/gallery-05.jpg',
    ],
  },
];

export const faqItems: FaqItem[] = [
  {
    question: 'Are your screens suitable for all weather conditions?',
    answer:
      'Yes. The systems are designed to handle sun, wind, and rain, and they are tested for durable outdoor performance.',
  },
  {
    question: 'Can your screens be installed on different types of windows and doors?',
    answer:
      'Yes. We tailor installations for a wide variety of openings, including custom architectural conditions.',
  },
  {
    question: 'Do your screens require regular maintenance?',
    answer:
      'Maintenance is minimal. Periodic inspection and simple track cleaning help keep the system performing at its best.',
  },
  {
    question: 'How do your screens compare to traditional zipper-based screens?',
    answer:
      'Our systems avoid zipper-based retention altogether and use a continuous bead design that stays secure in the tracks with smoother operation.',
  },
  {
    question: 'Are your screens energy-efficient?',
    answer:
      'Yes. By cutting glare and solar heat gain, they can improve comfort and reduce cooling demand in warm conditions.',
  },
  {
    question: 'What is the maximum size of your retractable screens?',
    answer: 'The maximum size is 25 feet wide by 18 feet high.',
  },
  {
    question: 'Do you offer warranty coverage for your screens?',
    answer:
      'Yes. Warranty coverage is available, and project-specific terms are shared as part of the quote and purchase process.',
  },
  {
    question: 'How long does it take to install your screens?',
    answer:
      'Installation timing depends on project size and complexity, but our team works to complete installs efficiently with minimal disruption.',
  },
  {
    question: "Can I customize the color and design of your screens to match my home's aesthetic?",
    answer:
      'Yes. We offer multiple finishes and fabric options so the final system aligns with both exterior and interior design choices.',
  },
  {
    question: 'Are your screens pet-friendly?',
    answer:
      'Yes. Durable mesh options can be specified to help withstand active household use while maintaining airflow and insect protection.',
  },
];

export const contactDetails: ContactDetails = {
  phone: '+1(760) 800-8808',
  email: 'info@areve.us',
  address: '111 N Louise St, Glendale, CA 91206',
  mapUrl: 'https://goo.gl/maps/MRVnJgRM6YZ681Yq6',
  hours: ['Mon-Fri: 09.00 am - 07.00 pm', 'Sat-Sun: 10.00 am - 05.00 pm'],
};
