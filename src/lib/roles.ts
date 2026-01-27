export interface Role {
  id: string;
  name: string;
  title: string;
  projectRole: string;
  stance: string;
  years: number;
  age: number;
  avatar: string;
  personality: string;
  hasData: boolean;
  dataFiles?: string[];
  documents?: string[];
  knowledge: {
    surface: string;
    deeper: string;
    hidden: string;
  };
  refersTo: string[];
  unlockedInPhase?: number;
}

export interface RoleCategory {
  id: string;
  name: string;
  roles: Role[];
}

export const roles: Role[] = [
  // Management
  {
    id: "maria",
    name: "Maria Ek",
    title: "VD",
    projectRole: "Projektsponsor",
    stance: "stödjande",
    years: 5,
    age: 52,
    avatar: "👩‍💼",
    personality: "Resultatinriktad, rak, börjar tappa tålamodet. Styrelsen pressar.",
    hasData: false,
    documents: ["org_chart"],
    knowledge: {
      surface: "Reklamationer ökat dramatiskt. Styrelsen orolig. Budget 800k, deadline 6 månader.",
      deeper: "Eskalerat senaste 18 månaderna. Besparingar 2022 kanske för aggressiva.",
      hidden: "Thomas pressade leverantörskostnader hårt. Mikael har problem behålla folk på kvällen."
    },
    refersTo: ["karin", "thomas", "mikael"]
  },
  {
    id: "anna",
    name: "Anna Berg",
    title: "Ekonomichef",
    projectRole: "Styrgrupp/Budget",
    stance: "neutral",
    years: 8,
    age: 45,
    avatar: "👩‍💼",
    personality: "Saklig, sifferfokuserad. Vill se ROI på åtgärder.",
    hasData: true,
    dataFiles: ["ekonomi"],
    knowledge: {
      surface: "Kostnad 4.8 MSEK. Marginal 8%. Fortsätter trenden äter den vinsten.",
      deeper: "Kostnad per reklamation ca 5670 kr. Komponentbesparingen 2022 på 3.8 MSEK nu uppäten.",
      hidden: "Utbildningsbudget halverades 2023. Karins och Mikaels förslag avslogs av ledningen."
    },
    refersTo: ["maria", "karin"]
  },
  {
    id: "henrik",
    name: "Henrik Wallin",
    title: "Styrelserepresentant",
    projectRole: "Ägare",
    stance: "krävande",
    years: 3,
    age: 58,
    avatar: "👔",
    personality: "Investerarperspektiv. Vill ha snabba resultat och tydlig ROI.",
    hasData: false,
    knowledge: {
      surface: "Vi förvärvade bolaget för tillväxt, inte för att hantera kvalitetsproblem.",
      deeper: "Om detta inte löses inom 6 månader får vi överväga ledningsförändringar.",
      hidden: "Jag var den som drev på kostnadsnedskärningarna 2022. Kanske var det för aggressivt."
    },
    refersTo: ["maria", "anna"]
  },

  // Operations
  {
    id: "karin",
    name: "Karin Lindström",
    title: "Kvalitetschef",
    projectRole: "Projektägare",
    stance: "engagerad",
    years: 13,
    age: 47,
    avatar: "👩‍🔬",
    personality: "Metodisk, frustrerad att ingen lyssnar. Glad att konsulten är där.",
    hasData: true,
    dataFiles: ["reklamationer"],
    knowledge: {
      surface: "847 reklamationer 2024 vs 412 år 2023. Kostnad 4.8 MSEK. Slagit larm i ett år.",
      deeper: "IndustriLux 500W värst. Två leverantörer: ElektroTech (gammal) och AsiaCore (ny 2022).",
      hidden: "Kvällsskift 60% av monteringsfel! AsiaCore 78% av drivdonsfel! Ny lödstation feb 2023."
    },
    refersTo: ["thomas", "mikael", "peter"]
  },
  {
    id: "thomas",
    name: "Thomas Gren",
    title: "Inköpschef",
    projectRole: "Berörd intressent",
    stance: "defensiv",
    years: 4,
    age: 44,
    avatar: "👔",
    personality: "Defensiv, stolt över besparingar. Vill inte erkänna felbeslut.",
    hasData: true,
    dataFiles: ["leverantorer"],
    documents: ["asiacore_email"],
    knowledge: {
      surface: "Sänkt komponentkostnader 18%. ElektroTech och AsiaCore som drivdonsleverantörer.",
      deeper: "ElektroTech höjde 15% 2022. AsiaCore erbjöd 30% lägre. ISO 9001, CE-märkt.",
      hidden: "MTBF är 35000h... spec säger 50000. Kompromissade för priset. Har mejl som bevisar det."
    },
    refersTo: ["jonas", "mikael"]
  },
  {
    id: "mikael",
    name: "Mikael Ström",
    title: "Produktionschef",
    projectRole: "Resursägare",
    stance: "skeptisk",
    years: 12,
    age: 48,
    avatar: "👨‍🔧",
    personality: "Skeptisk till konsulter men ärlig. Skyddar sitt team.",
    hasData: true,
    dataFiles: ["produktion", "personal"],
    documents: ["shift_log", "training_plan", "process_map"],
    knowledge: {
      surface: "89 i produktion. Tvåskift: dag 06-14, kväll 14-22. Ny JUKI-lödstation feb 2023.",
      deeper: "Kvällsskift har lite mer omsättning. Utbildning på JUKI var 2 halvdagar. Överlappning nu 15 min.",
      hidden: "Kvällsskift har 35% omsättning. Kenneth har varnat om problem på linje 3. Utbildningen var för kort."
    },
    refersTo: ["peter", "kenneth", "emma"]
  },
  {
    id: "peter",
    name: "Peter Holm",
    title: "HR-chef",
    projectRole: "Stödfunktion",
    stance: "stödjande",
    years: 6,
    age: 41,
    avatar: "👨‍💼",
    personality: "Ser personalproblemen och vill hjälpa. Diplomatisk.",
    hasData: true,
    dataFiles: ["personal"],
    knowledge: {
      surface: "145 anställda. Personalomsättning 12% totalt. Rekrytering svårt, särskilt kväll.",
      deeper: "Kvällsskift 35% omsättning vs 8% dag. Snitt anställningstid kväll: 8 månader.",
      hidden: "Exitintervjuer: 'stressigt', 'ingen upplärning', 'dålig kommunikation mellan skift'."
    },
    refersTo: ["mikael", "anna"]
  },
  {
    id: "jonas",
    name: "Jonas Holm",
    title: "Produktutvecklingschef",
    projectRole: "Teknisk expert",
    stance: "neutral",
    years: 9,
    age: 39,
    avatar: "👨‍💻",
    personality: "Teknisk, detaljorienterad. Frustrerad över att spec inte följs.",
    hasData: false,
    knowledge: {
      surface: "IndustriLux 500W lanserades mars 2023. Designen testad och godkänd. Spec: MTBF 50000h.",
      deeper: "Spec 50000h är inköps ansvar att säkerställa. Termisk design kritisk för 500W.",
      hidden: "Visste INTE att AsiaCore har 35000h! Det är UNDER spec! 500W kräver perfekt lödning."
    },
    refersTo: ["thomas", "karin"]
  },

  // Floor
  {
    id: "kenneth",
    name: "Kenneth Johansson",
    title: "Lödoperatör (dagskift)",
    projectRole: "Informant",
    stance: "öppen",
    years: 8,
    age: 34,
    avatar: "👷",
    personality: "Erfaren, rak, ser problemen dagligen. Vill hjälpa.",
    hasData: false,
    documents: ["shift_log_excerpt"],
    knowledge: {
      surface: "Jobbar på linje 3 med JUKI-stationen. Utbildningen var kort. Kvällsgänget frågar ofta.",
      deeper: "JUKI:n är känslig. Fel inställningar ger kalla lödningar. Tar månader att lära sig.",
      hidden: "Kvällsskiftet har ingen som kan JUKI:n ordentligt. Jag har visat men de slutar innan de lärt sig."
    },
    refersTo: ["mikael", "emma"]
  },
  {
    id: "emma",
    name: "Emma Lindqvist",
    title: "Testoperatör (kvällsskift)",
    projectRole: "Informant",
    stance: "frustrerad",
    years: 1,
    age: 26,
    avatar: "👩‍🔧",
    personality: "Ny, vill göra rätt men känner sig övergiven. Frustrerad.",
    hasData: false,
    knowledge: {
      surface: "Började för ett år sedan. Testar färdiga produkter. Hittar mycket fel på kvällen.",
      deeper: "Överlämningen är kaotisk - 15 minuter räcker inte. Ingen senior på kvällen att fråga.",
      hidden: "Dagskiftet lämnar ofta problem åt oss. Tempot är för högt. Många nyanställda slutar snabbt."
    },
    refersTo: ["kenneth", "mikael"]
  },
  {
    id: "linda",
    name: "Linda Bergqvist",
    title: "Facklig representant",
    projectRole: "Bevakare",
    stance: "bevakande",
    years: 10,
    age: 44,
    avatar: "👩‍🔧",
    personality: "Konstruktiv men vaksam. Vill att personalen inte drabbas.",
    hasData: false,
    knowledge: {
      surface: "Personalen är stressad. Många klagomål om arbetstempo och bristande introduktion.",
      deeper: "Kvällsskiftet har det tuffast. De nya får ingen ordentlig upplärning.",
      hidden: "Vi har diskuterat arbetsmiljöanmälan. Om inget händer snart går vi vidare."
    },
    refersTo: ["peter", "mikael"]
  },

  // External
  {
    id: "anders",
    name: "Anders Krantz",
    title: "JUKI-tekniker/utbildare",
    projectRole: "Extern expert",
    stance: "hjälpsam",
    years: 0,
    age: 52,
    avatar: "🔧",
    personality: "Expert på JUKI-utrustning. Diplomatisk men tydlig.",
    hasData: false,
    knowledge: {
      surface: "Jag installerade stationen i februari 2023. Standardutbildning är 5 dagar.",
      deeper: "De fick bara 2 halvdagar - budgetbeslut. Jag rekommenderade mer men det avslogs.",
      hidden: "Med så kort utbildning förväntar jag mig problem. Har erbjudit tilläggsutbildning men fått nej."
    },
    refersTo: ["mikael", "anna"],
    unlockedInPhase: 2
  }
];

export const roleCategories: RoleCategory[] = [
  {
    id: "management",
    name: "Ledning",
    roles: roles.filter(r => ["maria", "anna", "henrik"].includes(r.id))
  },
  {
    id: "operations",
    name: "Operativ",
    roles: roles.filter(r => ["karin", "thomas", "mikael", "peter", "jonas"].includes(r.id))
  },
  {
    id: "floor",
    name: "Golvet",
    roles: roles.filter(r => ["kenneth", "emma", "linda"].includes(r.id))
  },
  {
    id: "external",
    name: "Externa",
    roles: roles.filter(r => ["anders"].includes(r.id))
  }
];

export function getRoleById(id: string): Role | undefined {
  return roles.find(r => r.id === id);
}

export function getRolesForPhase(phase: number): Role[] {
  return roles.filter(r => !r.unlockedInPhase || r.unlockedInPhase <= phase);
}
