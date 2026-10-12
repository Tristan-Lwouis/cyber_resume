import { TimelineEntry, toContentHtml } from './timeline.model';

// Formations, de la plus récente à la plus ancienne.
export const FORMATIONS: TimelineEntry[] = [
  {
    period: '2025',
    title: 'Concepteur Développeur d’Applications · Niveau 6 (Bac+3/4)',
    organization: 'LDNR',
    description: `Formation intensive Full Stack de 1 an préparant au métier de <strong>concepteur développeur d'applications</strong>, alliant théorie et pratique à travers des projets tutorés et un stage en entreprise. Le cursus couvre l’<strong>algorithmique</strong>, la programmation en C, C++ mais aussi <strong>Java (JSE, J2EE)</strong> et ses frameworks <strong>(Spring)</strong>, incluant une initiation au développement mobile sur <strong>Android</strong>. La formation aborde également le <strong>développement web</strong> (Angular, CSS, TypeScript), la conception et l’utilisation de <strong>bases de données</strong>, les <strong>design patterns</strong> et la modélisation via <strong>UML</strong> pour la programmation orientée objet. S’ajoutent des modules de <strong>gestion de projet</strong> et de méthodologies agiles, une introduction à la <strong>sécurité informatique</strong>, ainsi qu’au <strong>déploiement d’applications CI/CD</strong>.`
  },
  {
    period: 'En continu',
    title: 'Formation autodidacte',
    description: `Auto‑formation permanente aux métiers du dev et de la cyber via des plateformes spécialisées : <strong>Udemy</strong>, <strong>OpenClassrooms</strong>, <strong>Hack The Box</strong>, <strong>TryHackMe</strong>. Approfondissement en <strong>développement web</strong>, <strong>scripting</strong>, <strong>sécurité informatique</strong> et <strong>environnements Linux</strong>, avec une logique d’apprentissage orientée <strong>pratique</strong>, <strong>résolution de problèmes</strong> et montée en compétence continue.`
  },
  {
    period: '2020',
    title: 'DUT + Licence Infrastructure et réseaux · Bac+3',
    description: `Formation technique spécialisée en <strong>conception mécanique</strong> et le <strong>Génie Civil</strong>. Approfondissement des outils de <strong>CAO/DAO</strong>, réalisation de calculs de résistance des matériaux et mise en application de la <strong>gestion de projet</strong> appliquée au secteur industriel. Développement de la communication technique à travers la production de dossiers complets et de présentations adaptées aux différents interlocuteurs (ingénieurs, clients, production).`
  },
  {
    period: '2018',
    title: 'Baccalauréat STI2D',
    organization: 'Architecture et Construction',
    description: `Formation pluridisciplinaire en sciences et technologies industrielles avec une spécialisation en <strong>Architecture et Construction</strong>. Approfondissement des notions de <strong>conception architecturale</strong>, de <strong>modélisation numérique 2D/3D</strong> et de <strong>gestion de projet</strong>. Étude des matériaux, de l’efficacité énergétique et de la durabilité dans le cadre de projets de construction. Développement d’une approche alliant <strong>créativité, technique et respect des contraintes environnementales</strong>.`
  }
];

// Version HTML pour la fenêtre du bureau virtuel et la version mobile
export const FORMATION_CONTENT: string = toContentHtml(FORMATIONS);
