import type { ClientType } from "./practice";

/**
 * Запросы клиентов, с которыми работает психолог (список пользователя от 29.09.2026). На странице
 * их нет: они нужны для поиска и подбора. Хранятся в `profile_private.concerns`, БД проверяет только
 * формат, поэтому список меняется без миграции. Группа с `clientTypes` доступна, только если психолог
 * работает хотя бы с одним из них: запросы пар — при «Couples», детские — при «Children» или «Teens».
 */
export const concernGroups = [
  {
    id: "states",
    label: "Emotional state",
    concerns: {
      stress: "Stress",
      "low-energy": "Low energy",
      "self-esteem": "Unstable self-esteem",
      anxiety: "Fear and anxiety attacks",
      "mood-swings": "Mood swings",
      irritability: "Irritability",
      loneliness: "Loneliness",
      adhd: "ADHD",
      concentration: "Trouble concentrating",
      "emotional-dependency": "Emotional dependency",
      sleep: "Sleep problems",
      "eating-disorders": "Eating disorders",
      "panic-attacks": "Panic attacks",
      "health-anxiety": "Obsessive thoughts about health",
      "substance-use": "Alcohol or drug problems",
      "emotional-distress": "Severe emotional distress",
    },
  },
  {
    id: "relationships",
    label: "Relationships",
    concerns: {
      "partner-relationships": "With a partner",
      "social-relationships": "With people in general",
      "parent-relationships": "With parents",
      "child-relationships": "With children",
      "sexual-relationships": "Sexual relationships",
      "sexual-orientation": "Questions about sexual orientation",
    },
  },
  {
    id: "work",
    label: "Work and study",
    concerns: {
      "low-motivation": "Lack of motivation",
      burnout: "Burnout",
      "career-uncertainty": "“I don’t know what I want to do”",
      procrastination: "Procrastination",
      "lack-of-purpose": "Lack of purpose",
      "job-change": "Job change or job loss",
    },
  },
  {
    id: "life-events",
    label: "Life events",
    concerns: {
      relocation: "Relocation or emigration",
      pregnancy: "Pregnancy or a new baby",
      breakup: "Breakup or divorce",
      "financial-changes": "Financial changes",
      bereavement: "Loss of a loved one",
      illness: "Illness, their own or a loved one’s",
      abuse: "Violence and abuse",
    },
  },
  {
    id: "couples",
    label: "Couples",
    clientTypes: ["couples"],
    concerns: {
      "couple-difficulties": "Relationship difficulties",
      "couple-codependency": "Codependency",
      "couple-divorce": "Divorce",
      "couple-infidelity": "Infidelity",
      "couple-having-children": "Having children",
      "couple-adoption": "Adoption",
      "couple-sexual-relationships": "Sexual relationships",
      "couple-parent-child": "Parent–child relationships (16+)",
    },
  },
  // Детские запросы (список пользователя от 29.09.2026): при «Children» или «Teens»
  {
    id: "children-emotions",
    label: "Children and teens: emotional states",
    clientTypes: ["children", "teens"],
    concerns: {
      "child-anxiety": "Anxiety",
      "child-phobias": "Phobias and fears",
      "child-depression": "Depressive states",
      "child-self-esteem": "Low self-esteem",
      "child-emotionality": "Heightened emotionality",
      "child-withdrawal": "Being withdrawn",
      "child-mood-swings": "Mood swings",
    },
  },
  {
    id: "children-behavior",
    label: "Children and teens: behavior",
    clientTypes: ["children", "teens"],
    concerns: {
      "child-aggression": "Aggression",
      "child-conflict": "Getting into conflicts",
      "child-adhd": "ADHD",
      "child-obsessions": "Obsessive behavior",
      "child-shyness": "Shyness",
      "child-defiance": "Defiant behavior",
    },
  },
  {
    id: "children-school",
    label: "Children and teens: school and development",
    clientTypes: ["children", "teens"],
    concerns: {
      "child-learning": "Learning difficulties",
      "child-motivation": "Low motivation",
      "child-career-guidance": "Career guidance",
      "child-age-crises": "Age-related crises",
      "child-developmental-disorders": "Developmental disorders",
    },
  },
  {
    id: "children-social",
    label: "Children and teens: relationships and social life",
    clientTypes: ["children", "teens"],
    concerns: {
      "child-bullying": "Bullying",
      "child-classmates": "Problems with classmates",
      "child-communication": "Communication skills",
      "child-loneliness": "Loneliness",
      "child-friends": "“I can’t make friends”",
    },
  },
  {
    id: "children-crisis",
    label: "Children and teens: crisis situations",
    clientTypes: ["children", "teens"],
    concerns: {
      "child-self-harm": "Self-harm",
      "child-suicidal-behavior": "Suicidal behavior",
      "child-addictions": "Addictions: screens, phone, smoking, alcohol, drugs",
      "child-abuse": "Abuse, including domestic and sexual abuse",
      "child-grief": "Loss and grief",
      "child-parents-divorce": "Parents’ divorce",
      "child-relocation": "Relocation",
    },
  },
  {
    id: "children-physical",
    label: "Children and teens: physical symptoms",
    clientTypes: ["children", "teens"],
    concerns: {
      "child-sleep": "Sleep problems",
      "child-eating": "Eating disorders",
      "child-psychosomatic": "Psychosomatic problems",
      "child-tics": "Tics and stuttering",
    },
  },
] as const satisfies readonly {
  id: string;
  label: string;
  clientTypes?: readonly ClientType[];
  concerns: Record<string, string>;
}[];

// Ключи каждой группы по отдельности: `keyof` от объединения групп дал бы только общие ключи
export type Concern = (typeof concernGroups)[number] extends infer Group
  ? Group extends { concerns: infer Concerns }
    ? keyof Concerns
    : never
  : never;

const concernLabels = Object.assign({}, ...concernGroups.map((group) => group.concerns)) as Record<
  Concern,
  string
>;

/** Все запросы в порядке справочника. */
export const concernIds = Object.keys(concernLabels) as [Concern, ...Concern[]];

/** Доступна ли группа запросов при выбранных «Works with». */
export function isConcernGroupAvailable(
  group: (typeof concernGroups)[number],
  clientTypes: readonly ClientType[],
): boolean {
  if (!("clientTypes" in group)) return true;
  return group.clientTypes.some((type: ClientType) => clientTypes.includes(type));
}

/** Запросы, доступные при выбранных «Works with»: остальные при сохранении отбрасываются. */
export function getAvailableConcerns(
  concerns: readonly Concern[],
  clientTypes: readonly ClientType[],
): Concern[] {
  const unavailable = new Set<string>(
    concernGroups
      .filter((group) => !isConcernGroupAvailable(group, clientTypes))
      .flatMap((group) => Object.keys(group.concerns)),
  );
  return concerns.filter((concern) => !unavailable.has(concern));
}
