import { db } from "./index";
import { experiences, educations, skills, profile } from "./schema";

/**
 * Seeds the CV content (section 8 of the brief) with a first-pass EN
 * translation for each `*En` field (to be reviewed by Robin). Projects start
 * empty — they are added through the admin. Idempotent per table: only inserts
 * when the table is empty, so re-running won't duplicate rows.
 */

const profileData = {
  name: "Robin Bonhoure",
  titleFr: "Développeur front-end React / Next.js",
  titleEn: "Front-end Developer React / Next.js",
  email: "robin.bonhoure@outlook.fr",
  phone: "0646028752",
  location: "31500 Toulouse, France",
  socials: [{ label: "Site", url: "https://robinweb.fr" }],
  aboutFr:
    "Développeur front-end avec plus de 5 ans d'expérience en développement web, dont 3 ans en environnement professionnel React / Next.js. J'ai contribué au développement et à la maintenance d'applications web complexes (plateformes SaaS, dashboards, intégrations d'API, messagerie, solutions de paiement). Autonome, rigoureux et attaché à la qualité du code, je veille à la performance et à la fiabilité des applications ainsi qu'à une expérience utilisateur soignée. J'utilise les outils d'IA de manière maîtrisée, en conservant une expertise solide dans l'analyse et la validation du code produit. À l'aise pour intervenir en fullstack lorsque nécessaire, tout en gardant une forte expertise frontend. Je souhaite intégrer une équipe en CDI afin de mettre mes compétences au service de projets structurants et évoluer dans un environnement stimulant.",
  aboutEn:
    "Front-end developer with over 5 years of experience in web development, including 3 years in a professional React / Next.js environment. I have contributed to the development and maintenance of complex web applications (SaaS platforms, dashboards, API integrations, messaging, payment solutions). Independent, rigorous and committed to code quality, I care about the performance and reliability of applications as well as a polished user experience. I use AI tools in a controlled way, while keeping solid expertise in analyzing and validating the code produced. Comfortable working full-stack when needed, while retaining strong front-end expertise. I am looking to join a team on a permanent contract to put my skills at the service of meaningful projects and grow in a stimulating environment.",
};

const experiencesData = [
  {
    company: "Autoentrepreneur",
    location: null,
    period: "2020 – en cours",
    roleFr: "Développeur front-end",
    roleEn: "Front-end Developer",
    bulletsFr: [
      "Développement d'interfaces web et web design pour différents projets clients",
      "Réalisation de sites vitrines et e-commerce",
      "Intégration front-end responsive et optimisée",
      "Collaboration avec designers et porteurs de projet",
    ],
    bulletsEn: [
      "Web interface development and web design for various client projects",
      "Building showcase and e-commerce websites",
      "Responsive, optimized front-end integration",
      "Collaboration with designers and project owners",
    ],
    order: 0,
  },
  {
    company: "Emprunte mon toutou",
    location: "Toulouse",
    period: "2024 – 2026",
    roleFr: "Développeur front-end Next.js",
    roleEn: "Front-end Developer Next.js",
    bulletsFr: [
      "Développement et évolution des fonctionnalités front-end",
      "Intégration Stripe (paiement) et messagerie temps réel (Mercure)",
      "Maintenance du produit en production",
      "Intégration d'API et optimisation UX",
    ],
    bulletsEn: [
      "Development and evolution of front-end features",
      "Stripe payment integration and real-time messaging (Mercure)",
      "Maintenance of the product in production",
      "API integration and UX optimization",
    ],
    order: 1,
  },
  {
    company: "Agence de communication Melting.k",
    location: "Toulouse",
    period: "2021 – 2023",
    roleFr: "Développeur front-end (alternance)",
    roleEn: "Front-end Developer (work-study)",
    bulletsFr: [
      "Développement et intégration de sites web (15+ projets)",
      "Intégration HTML / CSS / JavaScript",
      "Développement de fonctionnalités JavaScript",
      "Projets WebGL et animations interactives",
      "Travail en équipe avec designers et chefs de projet",
    ],
    bulletsEn: [
      "Development and integration of websites (15+ projects)",
      "HTML / CSS / JavaScript integration",
      "JavaScript feature development",
      "WebGL projects and interactive animations",
      "Teamwork with designers and project managers",
    ],
    order: 2,
  },
  {
    company: "LAAS-CNRS",
    location: "Toulouse",
    period: "2019",
    roleFr: "Stage (3 mois) – Développement scientifique",
    roleEn: "Internship (3 months) – Scientific development",
    bulletsFr: [
      "Modélisation de membranes cellulaires",
      "Développement d'outils en Python, C++ et Shell",
      "Étude du comportement biomécanique des modèles",
    ],
    bulletsEn: [
      "Modeling of cell membranes",
      "Tool development in Python, C++ and Shell",
      "Study of the biomechanical behavior of the models",
    ],
    order: 3,
  },
  {
    company: "Arconic",
    location: "Toulouse",
    period: "2017",
    roleFr: "Stage (3 mois) – Développement & automatisation",
    roleEn: "Internship (3 months) – Development & automation",
    bulletsFr: [
      "Développement VBA Excel pour la gestion des flux",
      "Automatisation de processus internes",
      "Formation de deux opérateurs aux outils développés",
    ],
    bulletsEn: [
      "Excel VBA development for flow management",
      "Automation of internal processes",
      "Training of two operators on the developed tools",
    ],
    order: 4,
  },
];

const educationsData = [
  {
    school: "udemy.com",
    period: "2026",
    titleFr: "Formation Backend Node.js (en cours)",
    titleEn: "Backend Node.js course (in progress)",
    detailFr: "NodeJS: The Complete Guide (MVC, REST APIs, GraphQL, Deno)",
    detailEn: "NodeJS: The Complete Guide (MVC, REST APIs, GraphQL, Deno)",
    order: 0,
  },
  {
    school: "threejs-journey.com",
    period: "2022",
    titleFr: "Formation WebGL",
    titleEn: "WebGL course",
    detailFr: "créations 3D pour le web",
    detailEn: "3D creations for the web",
    order: 1,
  },
  {
    school: "OpenClassrooms",
    period: "2021 – 2023",
    titleFr: "Développeur web frontend React.js",
    titleEn: "Front-end Web Developer React.js",
    detailFr: "Diplôme RNCP niveau 6, 14 projets de développement web",
    detailEn: "RNCP level 6 diploma, 14 web development projects",
    order: 2,
  },
  {
    school: "Université Paul Sabatier (Toulouse)",
    period: "2020",
    titleFr: "Master 1 Mécanique Énergétique",
    titleEn: "Master 1 in Energy Mechanics",
    detailFr: null,
    detailEn: null,
    order: 3,
  },
  {
    school: "Université Paul Sabatier (Toulouse)",
    period: "2019",
    titleFr: "Licence Mécanique Énergétique",
    titleEn: "Bachelor's degree in Energy Mechanics",
    detailFr: "Modélisation 3D / Matlab",
    detailEn: "3D modeling / Matlab",
    order: 4,
  },
  {
    school: "IUT GMP Paul Sabatier",
    period: "2017",
    titleFr: "DUT Génie Mécanique et Productique",
    titleEn: "Two-year technical degree in Mechanical Engineering",
    detailFr: "Conception numérique 3D (CATIA)",
    detailEn: "3D digital design (CATIA)",
    order: 5,
  },
];

const skillsData = [
  // stack
  { category: "stack", name: "React.js / Next.js", order: 0 },
  { category: "stack", name: "JavaScript / TypeScript", order: 1 },
  { category: "stack", name: "Tailwind CSS / CSS avancé / SCSS", order: 2 },
  { category: "stack", name: "Redux / Zustand", order: 3 },
  { category: "stack", name: "Figma / Adobe XD", order: 4 },
  { category: "stack", name: "Git", order: 5 },
  // fonctionnel
  { category: "fonctionnel", name: "Intégration d'API REST", order: 0 },
  { category: "fonctionnel", name: "Paiement en ligne Stripe (frontend)", order: 1 },
  { category: "fonctionnel", name: "Messagerie temps réel", order: 2 },
  { category: "fonctionnel", name: "Dashboards & interfaces SaaS", order: 3 },
  // qualite
  { category: "qualite", name: "Créatif", order: 0 },
  { category: "qualite", name: "Pédagogue", order: 1 },
  { category: "qualite", name: "Ouvert d'esprit", order: 2 },
  { category: "qualite", name: "Autonome", order: 3 },
  { category: "qualite", name: "Curieux", order: 4 },
];

export async function seedContent() {
  const existingProfile = await db.select().from(profile).limit(1);
  if (existingProfile.length === 0) {
    await db.insert(profile).values(profileData);
    console.log("✓ Profile seeded");
  } else {
    console.log("✓ Profile already present");
  }

  const existingExp = await db.select().from(experiences).limit(1);
  if (existingExp.length === 0) {
    await db.insert(experiences).values(experiencesData);
    console.log(`✓ ${experiencesData.length} experiences seeded`);
  } else {
    console.log("✓ Experiences already present");
  }

  const existingEdu = await db.select().from(educations).limit(1);
  if (existingEdu.length === 0) {
    await db.insert(educations).values(educationsData);
    console.log(`✓ ${educationsData.length} educations seeded`);
  } else {
    console.log("✓ Educations already present");
  }

  const existingSkills = await db.select().from(skills).limit(1);
  if (existingSkills.length === 0) {
    await db.insert(skills).values(skillsData);
    console.log(`✓ ${skillsData.length} skills seeded`);
  } else {
    console.log("✓ Skills already present");
  }
}
