export type Lang = 'fr' | 'en';

export const profile = {
  name: 'Macéo Narbonnet',
  email: 'maceo.narbonnet@etu.utc.fr',
  phone: '+33 6 95 13 93 03',
  github: 'https://github.com/Maceo-Narbonnet',
  githubHandle: 'Maceo-Narbonnet',
  linkedin: 'https://www.linkedin.com/in/mac%C3%A9o-narbonnet-080676334/',
  photo: '/img/photo.webp',
  cv: { fr: '/cv/CV_Maceo_Narbonnet_FR.pdf', en: '/cv/CV_Maceo_Narbonnet_EN.pdf' },
};

export const paths = {
  home: { fr: '/', en: '/en/' },
  project: (lang: Lang, slug: string) => (lang === 'fr' ? `/projets/${slug}/` : `/en/projects/${slug}/`),
  projectsAnchor: { fr: '/#projets', en: '/en/#projects' },
};

type Experience = {
  title: string;
  org: string;
  place: string;
  period: string;
  bullets: string[];
  project?: string; // slug of the related project page
};

type Education = { title: string; org: string; place: string; period: string; note?: string };

type SkillGroup = { name: string; items: string[] };

export const content: Record<
  Lang,
  {
    htmlLang: string;
    meta: { title: string; description: string };
    nav: { projects: string; about: string; skills: string; contact: string; cv: string };
    hero: {
      kicker: string;
      title: string;
      subtitle: string;
      availability: string;
      ctaProjects: string;
      ctaCv: string;
      location: string;
    };
    stats: { value: string; label: string }[];
    sections: { projects: string; projectsSub: string; about: string; experience: string; education: string; skills: string; contact: string };
    about: string[];
    experience: Experience[];
    education: Education[];
    skills: SkillGroup[];
    languages: string;
    interests: string[];
    contact: { title: string; text: string; email: string; linkedin: string; github: string };
    project: { back: string; context: string; role: string; stack: string; period: string; keyResults: string; source: string; prev: string; next: string; readMore: string; internship: string; project: string; otherProjects: string };
    footer: { built: string; source: string };
  }
> = {
  fr: {
    htmlLang: 'fr',
    meta: {
      title: 'Macéo Narbonnet — Ingénieur informatique, systèmes embarqués & vision par ordinateur',
      description:
        "Portfolio de Macéo Narbonnet, élève ingénieur en informatique à l'UTC (embarqué, systèmes autonomes, vision par ordinateur). Stage de fin d'études de 6 mois à partir de février/mars 2027.",
    },
    nav: { projects: 'Projets', about: 'Parcours', skills: 'Compétences', contact: 'Contact', cv: 'CV' },
    hero: {
      kicker: 'Élève ingénieur · UTC · Génie informatique',
      title: 'Je conçois des systèmes qui perçoivent et décident.',
      subtitle:
        "Vision par ordinateur, robotique et temps réel embarqué : de la calibration de caméras à l'ordonnanceur préemptif, je construis des chaînes complètes — capteurs, algorithmes, mesure de l'erreur.",
      availability: 'Stage de fin d’études · 6 mois · dès février/mars 2027',
      ctaProjects: 'Voir les projets',
      ctaCv: 'Télécharger le CV',
      location: 'Compiègne, France · Erasmus Västerås, Suède (2026–27)',
    },
    stats: [
      { value: '15,6 mm', label: 'précision d’une capture de mouvement sans marqueurs vs Vicon' },
      { value: '×3', label: 'AP d’un détecteur de panneaux, sans deep learning' },
      { value: '4', label: 'caméras calibrées et triangulées en 3D' },
      { value: '7,6° → 5,2°', label: 'erreur angulaire après filtrage, LSTM et correction OpenSim' },
    ],
    sections: {
      projects: 'Projets',
      projectsSub: 'Cinq travaux documentés, du capteur au résultat mesuré.',
      about: 'Parcours',
      experience: 'Expériences',
      education: 'Formation',
      skills: 'Compétences',
      contact: 'Contact',
    },
    about: [
      "Je suis en cycle ingénieur en Génie Informatique à l'Université de Technologie de Compiègne, spécialité Informatique Embarquée et Systèmes Autonomes, après une classe préparatoire TSI.",
      "Ce qui me plaît : les systèmes où le logiciel rencontre le monde physique — des caméras qu'il faut calibrer, des capteurs à fusionner, des tâches à ordonnancer avec des garanties temporelles. Et une exigence commune à tous mes projets : mesurer avant d'optimiser.",
      "Je passe l'automne 2026 à Mälardalen University (Suède) et je cherche un stage de fin d'études de 6 mois à partir de février/mars 2027, en embarqué, robotique, vision par ordinateur ou IA appliquée. Les secteurs de la défense et de la sécurité m'intéressent tout particulièrement.",
    ],
    experience: [
      {
        title: 'Stagiaire R&D — Capture de mouvement et modélisation 3D par IA',
        org: 'Laboratoire BMBI (CNRS / UTC) — équipe BioMov-E',
        place: 'Compiègne',
        period: 'sept. 2025 – févr. 2026',
        bullets: [
          'Amélioration d’un pipeline de motion capture markerless : calibration, détection 2D par IA, triangulation.',
          'Caractérisation des erreurs par comparaison à une référence Vicon : écart-type moyen de 15,6 mm.',
          'Filtrage, augmentation de marqueurs par LSTM et correction biomécanique OpenSim : RMSE 7,6° → 5,2°.',
        ],
        project: 'mocapia',
      },
      {
        title: 'Gestion des accès et habilitations informatiques (IAM)',
        org: 'Crédit Agricole — Unité Outils Transverses et Sécurité',
        place: 'Chambéry',
        period: 'juil. – août 2025',
        bullets: [
          'Traitement des tickets d’accès et d’habilitations des collaborateurs de la caisse régionale.',
          'Amélioration du suivi des mouvements de droits, pour la traçabilité et la qualité de service.',
        ],
      },
      {
        title: 'Agent d’accueil en agence bancaire',
        org: 'Crédit Agricole — agence de Cognin',
        place: 'Chambéry',
        period: 'juil. – août 2024',
        bullets: ['Relation clients, accueil et opérations courantes en agence.'],
      },
    ],
    education: [
      {
        title: 'Cycle ingénieur en Informatique — Informatique Embarquée / Systèmes Autonomes',
        org: 'Université de Technologie de Compiègne (UTC)',
        place: 'Compiègne',
        period: '2024 – 2027',
      },
      {
        title: 'Semestre d’échange Erasmus',
        org: 'Mälardalen University (MDU)',
        place: 'Västerås, Suède',
        period: 'sept. 2026 – janv. 2027',
      },
      {
        title: 'Classe préparatoire TSI',
        org: 'Lycée Gaspard Monge',
        place: 'Chambéry',
        period: '2022 – 2024',
      },
      {
        title: 'Baccalauréat technologique STI2D',
        org: 'Lycée Gaspard Monge / Louis Armand',
        place: 'Chambéry',
        period: '2022',
      },
    ],
    skills: [
      { name: 'Langages', items: ['C', 'C++', 'Python', 'MATLAB', 'SQL', 'Bash'] },
      { name: 'Embarqué & temps réel', items: ['ARM Cortex-M7', 'bare-metal', 'ordonnancement', 'QEMU', 'GDB', 'Linux embarqué'] },
      { name: 'Vision par ordinateur & IA', items: ['OpenCV', 'scikit-learn', 'NumPy / SciPy', 'CNN', 'YOLO', 'RTMPose', 'CUDA', 'calibration multi-caméras', 'triangulation'] },
      { name: 'Robotique', items: ['ROS 2', 'LiDAR', 'IMU', 'encodeurs', 'fusion multi-capteurs', 'ICP'] },
      { name: 'Génie logiciel & outils', items: ['POO', 'design patterns', 'UML', 'Qt / PyQt', 'Git / GitLab', 'Linux', 'LaTeX'] },
    ],
    languages: 'Français (langue maternelle) · Anglais (C1) · Italien (A2)',
    interests: ['Directeur sportif du BDS UTC (22 clubs, 150 sportifs en compétition)', 'Responsable tennis & capitaine de l’équipe UTC', 'Responsable communication puis matériel de l’association audiovisuelle', 'WWOOFing au Canada (Vancouver)'],
    contact: {
      title: 'Discutons.',
      text: 'Un stage, un projet, une question technique sur l’un de ces travaux : écrivez-moi, je réponds vite.',
      email: 'Envoyer un e-mail',
      linkedin: 'LinkedIn',
      github: 'GitHub',
    },
    project: {
      back: 'Tous les projets',
      context: 'Contexte',
      role: 'Rôle',
      stack: 'Stack',
      period: 'Période',
      keyResults: 'Résultats clés',
      source: 'Code source',
      prev: 'Projet précédent',
      next: 'Projet suivant',
      readMore: 'Lire le projet',
      internship: 'Stage',
      project: 'Projet',
      otherProjects: 'Autres projets',
    },
    footer: { built: 'Site statique construit avec Astro, hébergé sur GitHub Pages.', source: 'Code source du site' },
  },
  en: {
    htmlLang: 'en',
    meta: {
      title: 'Macéo Narbonnet — Computer engineering student, embedded systems & computer vision',
      description:
        'Portfolio of Macéo Narbonnet, computer engineering student at UTC (embedded systems, autonomous systems, computer vision). Looking for a 6-month final-year internship from February/March 2027.',
    },
    nav: { projects: 'Projects', about: 'Background', skills: 'Skills', contact: 'Contact', cv: 'Resume' },
    hero: {
      kicker: 'Engineering student · UTC · Computer Engineering',
      title: 'I build systems that perceive and decide.',
      subtitle:
        'Computer vision, robotics and embedded real-time: from camera calibration to preemptive schedulers, I build complete pipelines — sensors, algorithms, and honest error measurement.',
      availability: 'Final-year internship · 6 months · from February/March 2027',
      ctaProjects: 'See the projects',
      ctaCv: 'Download resume',
      location: 'Compiègne, France · Erasmus in Västerås, Sweden (2026–27)',
    },
    stats: [
      { value: '15.6 mm', label: 'accuracy of a markerless motion capture pipeline vs Vicon' },
      { value: '×3', label: 'AP of a traffic-sign detector built without deep learning' },
      { value: '4', label: 'cameras calibrated and triangulated in 3D' },
      { value: '7.6° → 5.2°', label: 'joint-angle error after filtering, LSTM and OpenSim correction' },
    ],
    sections: {
      projects: 'Projects',
      projectsSub: 'Five documented pieces of work, from sensor to measured result.',
      about: 'Background',
      experience: 'Experience',
      education: 'Education',
      skills: 'Skills',
      contact: 'Contact',
    },
    about: [
      "I am a computer engineering student at Université de Technologie de Compiègne (UTC), specialising in Embedded and Autonomous Systems, after two years of French preparatory classes (CPGE TSI).",
      'What I enjoy: systems where software meets the physical world — cameras to calibrate, sensors to fuse, tasks to schedule under timing guarantees. And one discipline shared by all my projects: measure before you optimise.',
      'I am spending autumn 2026 at Mälardalen University (Sweden) and I am looking for a 6-month final-year internship starting February/March 2027, in embedded systems, robotics, computer vision or applied AI. Defence and security are sectors I care about in particular.',
    ],
    experience: [
      {
        title: 'R&D Intern — AI-based motion capture and 3D modelling',
        org: 'BMBI Laboratory (CNRS / UTC) — BioMov-E team',
        place: 'Compiègne',
        period: 'Sept. 2025 – Feb. 2026',
        bullets: [
          'Improved a markerless motion capture pipeline: camera calibration, AI-based 2D keypoint detection, triangulation.',
          'Characterised system errors against a Vicon reference: mean standard deviation of 15.6 mm.',
          'Filtering, LSTM-based marker augmentation and OpenSim biomechanical correction: RMSE 7.6° → 5.2°.',
        ],
        project: 'mocapia',
      },
      {
        title: 'IT access & identity management (IAM) assistant',
        org: 'Crédit Agricole — Cross-functional Tools & Security unit',
        place: 'Chambéry',
        period: 'Jul. – Aug. 2025',
        bullets: [
          'Processed access and authorisation tickets for employees across the regional bank.',
          'Improved the tracking of access-right changes, for traceability and quality of service.',
        ],
      },
      {
        title: 'Bank branch customer service assistant',
        org: 'Crédit Agricole — Cognin branch',
        place: 'Chambéry',
        period: 'Jul. – Aug. 2024',
        bullets: ['Customer relations, front desk and day-to-day branch operations.'],
      },
    ],
    education: [
      {
        title: "Master's degree in Computer Engineering (Engineering degree) — Embedded & Autonomous Systems",
        org: 'Université de Technologie de Compiègne (UTC)',
        place: 'Compiègne, France',
        period: '2024 – 2027',
      },
      {
        title: 'Erasmus exchange semester',
        org: 'Mälardalen University (MDU)',
        place: 'Västerås, Sweden',
        period: 'Sept. 2026 – Jan. 2027',
      },
      {
        title: 'Preparatory classes for engineering schools (CPGE TSI) — maths, physics & engineering',
        org: 'Lycée Gaspard Monge',
        place: 'Chambéry, France',
        period: '2022 – 2024',
      },
      {
        title: 'French Baccalauréat — technological track (STI2D)',
        org: 'Lycée Gaspard Monge / Louis Armand',
        place: 'Chambéry, France',
        period: '2022',
      },
    ],
    skills: [
      { name: 'Programming', items: ['C', 'C++', 'Python', 'MATLAB', 'SQL', 'Bash'] },
      { name: 'Embedded & real-time', items: ['ARM Cortex-M7', 'bare-metal', 'scheduling', 'QEMU', 'GDB', 'embedded Linux'] },
      { name: 'Computer vision & AI', items: ['OpenCV', 'scikit-learn', 'NumPy / SciPy', 'CNN', 'YOLO', 'RTMPose', 'CUDA', 'multi-camera calibration', 'triangulation'] },
      { name: 'Robotics', items: ['ROS 2', 'LiDAR', 'IMU', 'encoders', 'multi-sensor fusion', 'ICP'] },
      { name: 'Software engineering & tools', items: ['OOP', 'design patterns', 'UML', 'Qt / PyQt', 'Git / GitLab', 'Linux', 'LaTeX'] },
    ],
    languages: 'French (native) · English (C1) · Italian (A2)',
    interests: ['Head of Sports, UTC student sports association (22 clubs, 150 competing athletes)', 'Tennis lead & captain of the UTC team', 'Communications then equipment manager, student audiovisual association', 'WWOOFing in Canada (Vancouver)'],
    contact: {
      title: "Let's talk.",
      text: 'An internship, a project, a technical question about any of this work: drop me a line, I answer quickly.',
      email: 'Send an e-mail',
      linkedin: 'LinkedIn',
      github: 'GitHub',
    },
    project: {
      back: 'All projects',
      context: 'Context',
      role: 'Role',
      stack: 'Stack',
      period: 'Period',
      keyResults: 'Key results',
      source: 'Source code',
      prev: 'Previous project',
      next: 'Next project',
      readMore: 'Read the project',
      internship: 'Internship',
      project: 'Project',
      otherProjects: 'Other projects',
    },
    footer: { built: 'Static site built with Astro, hosted on GitHub Pages.', source: 'Site source code' },
  },
};
