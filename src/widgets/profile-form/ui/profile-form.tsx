"use client";

import { type DeepKeys, useForm, useStore } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "cn";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  EyeIcon,
  EyeOffIcon,
  MonitorIcon,
  PlusIcon,
  SmartphoneIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import type { City } from "@/entities/location";
import {
  type AcceptingClients,
  APPROACHES_MAX,
  acceptingClientsIds,
  acceptingClientsLabels,
  approachIds,
  approachLabels,
  BIO_MAX_LENGTH,
  CONTACT_EMAIL_MAX_LENGTH,
  type ContactType,
  clientTypeIds,
  clientTypeLabels,
  contactTypeIds,
  contactTypeLabels,
  DISPLAY_NAME_MAX_LENGTH,
  EDUCATION_MAX,
  EDUCATION_TEXT_MAX_LENGTH,
  FAQ_ANSWER_MAX_LENGTH,
  FAQ_MAX,
  FAQ_QUESTION_MAX_LENGTH,
  type Gender,
  genderIds,
  genderLabels,
  getCurrencyName,
  hiddenVisibilityLabels,
  IN_PERSON_AREA_MAX_LENGTH,
  LANGUAGES_MAX,
  MIN_AGE,
  normalizeSectionOrder,
  PAGE_PASSWORD_MAX_LENGTH,
  PHONE_MAX_LENGTH,
  PRICE_AMOUNT_MAX,
  PROFESSIONAL_ROLE_MAX_LENGTH,
  type ProfileInput,
  type ProfileSection,
  type ProfileVisibility,
  type PublicProfile,
  profileInputSchema,
  SERVICE_DESCRIPTION_MAX_LENGTH,
  SERVICE_DURATION_MAX,
  SERVICE_TITLE_MAX_LENGTH,
  SERVICES_MAX,
  SOCIAL_LINKS_MAX,
  toPreviewProfile,
  USERNAME_MAX_LENGTH,
  usernameQueries,
  usernameSchema,
  workFormatIds,
  workFormatLabels,
} from "@/entities/profile";
import {
  SOCIAL_LINK_TITLE_MAX_LENGTH,
  type SocialPlatform,
  socialPlatformIds,
  socialPlatforms,
} from "@/entities/social-link";
import type { AccountPhoto } from "@/entities/viewer";
import { ApiError } from "@/shared/api";
import { routes, siteConfig } from "@/shared/config";
import { toFieldErrors, toFormFieldName } from "@/shared/lib/field-errors";
import { useUnsavedChangesWarning } from "@/shared/lib/use-unsaved-changes-warning";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/shared/ui/input-group";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { toast } from "@/shared/ui/sonner";
import { Spinner } from "@/shared/ui/spinner";
import { Textarea } from "@/shared/ui/textarea";
import { getBlockSummary } from "../lib/block-summary";
import { getPreferredContactOptions } from "../lib/preferred-contact-options";
import { type AvatarValue, getAvatarUrl } from "../model/avatar-value";
import { AppearanceBlock } from "./appearance-block";
import { AvatarField } from "./avatar-field";
import { CheckboxGroup } from "./checkbox-group";
import { ConcernsField } from "./concerns-field";
import { HighlightCheckbox } from "./highlight-checkbox";
import { CitySelect, CountrySelect, CurrencySelect, LanguagesSelect } from "./practice-selects";
import { SortableBlocks } from "./sortable-blocks";

const USERNAME_CHECK_DEBOUNCE_MS = 400;
const VALUES_CHANGE_DEBOUNCE_MS = 300;
const SITE_HOST = new URL(siteConfig.url).host;
const PRICE_AMOUNT_MAX_LENGTH = String(PRICE_AMOUNT_MAX).length;

const workFormatOptions = workFormatIds.map((id) => ({ value: id, label: workFormatLabels[id] }));
const clientTypeOptions = clientTypeIds.map((id) => ({ value: id, label: clientTypeLabels[id] }));
const approachOptions = approachIds.map((id) => ({ value: id, label: approachLabels[id] }));

// Пустое значение в Select нельзя: «не выбрано» — отдельный пункт
const NOT_SELECTED = "none";

const contactInputProps: Record<ContactType, React.ComponentProps<typeof Input>> = {
  email: {
    type: "email",
    inputMode: "email",
    autoComplete: "email",
    maxLength: CONTACT_EMAIL_MAX_LENGTH,
  },
  phone: {
    type: "tel",
    inputMode: "tel",
    autoComplete: "tel",
    placeholder: "+995 555 123 456",
    maxLength: PHONE_MAX_LENGTH,
  },
  whatsapp: {
    type: "tel",
    inputMode: "tel",
    autoComplete: "tel",
    placeholder: "+995 555 123 456",
    maxLength: PHONE_MAX_LENGTH,
  },
  telegram: { placeholder: "@username or t.me link", autoComplete: "off" },
};

/** Сегодня и дата `years` лет назад по UTC, `YYYY-MM-DD`: границы полей дат, как в схемах. */
function utcDateYearsAgo(years: number): string {
  const today = new Date().toISOString().slice(0, 10);
  return `${Number(today.slice(0, 4)) - years}${today.slice(4)}`;
}

// Блоки с данными психолога: в онбординге их нет
const practiceSections = new Set<ProfileSection>([
  "experience",
  "approaches",
  "client-types",
  "work-formats",
  "location",
  "languages",
  "price",
  "education",
  "contacts",
  "services",
  "faq",
]);

// Примеры вопросов: психолог добавляет вопрос и пишет ответ сам
const faqSuggestions = [
  "What happens in the first session?",
  "Do you work online?",
  "How long is a session?",
  "What is your cancellation policy?",
];

/** Раздел настроек: Account, Public profile или Search details. */
export type ProfileFormSection = "account" | "profile" | "search";

export const profileFormSectionLabels: Record<ProfileFormSection, string> = {
  account: "Account",
  profile: "Public profile",
  search: "Search details",
};

// Поля разделов Account и Search details, остальные — в Public profile
const accountFields = new Set<string>([
  "username",
  "contactEmail",
  "country",
  "cityId",
  "currency",
  "visibility",
  "pagePassword",
]);
const searchFields = new Set<string>(["birthDate", "gender", "concerns"]);

function getFieldSection(field: string): ProfileFormSection {
  if (accountFields.has(field)) return "account";
  return searchFields.has(field) ? "search" : "profile";
}

// Подпись поля для сообщения об ошибке в другом разделе и блок, в котором оно стоит: его
// разворачиваем, если в поле ошибка. Тип требует указать их для каждого поля схемы, поэтому
// новое поле не забудется
const fieldInfo: Record<keyof ProfileInput, { label: string; block: string | null }> = {
  username: { label: "Username", block: null },
  displayName: { label: "Name", block: null },
  professionalRole: { label: "Professional role", block: null },
  acceptingClients: { label: "New clients", block: null },
  contactEmail: { label: "Email", block: null },
  sectionOrder: { label: "Block order", block: null },
  bio: { label: "Bio", block: "bio" },
  socialLinks: { label: "Social links", block: "links" },
  practiceStartedOn: { label: "Practicing since", block: "experience" },
  approaches: { label: "Approaches", block: "approaches" },
  clientTypes: { label: "Works with", block: "client-types" },
  workFormats: { label: "Work format", block: "work-formats" },
  country: { label: "Country", block: null },
  cityId: { label: "City", block: null },
  languages: { label: "Languages", block: "languages" },
  priceAmount: { label: "Price per session", block: "price" },
  priceType: { label: "Fixed price", block: "price" },
  inPersonArea: { label: "Area for in-person sessions", block: "work-formats" },
  currency: { label: "Currency", block: null },
  education: { label: "Education", block: "education" },
  contacts: { label: "Contacts", block: "contacts" },
  preferredContact: { label: "Preferred way to contact", block: "contacts" },
  faq: { label: "FAQ", block: "faq" },
  services: { label: "Services", block: "services" },
  highlightedSections: { label: "Highlighted blocks", block: null },
  cover: { label: "Cover", block: "appearance" },
  pageTheme: { label: "Theme", block: "appearance" },
  linkIcons: { label: "Show icons on buttons", block: "appearance" },
  ctaPlacement: { label: "Contact button on phones", block: "appearance" },
  visibility: { label: "Hide my page", block: null },
  pagePassword: { label: "Password", block: null },
  birthDate: { label: "Date of birth", block: null },
  gender: { label: "Gender", block: null },
  concerns: { label: "Client concerns", block: null },
};

// Поля, на которые ставим фокус при переходе к блоку или полю
const FOCUSABLE = "input:not([type=file]), textarea, button:not(:disabled)";

// Ширина превью в редакторе: Phone — ширина iPhone, на ней видна страница с телефона
type PreviewWidth = "desktop" | "phone";

const previewWidths = [
  { id: "desktop", label: "Desktop", Icon: MonitorIcon },
  { id: "phone", label: "Phone", Icon: SmartphoneIcon },
] as const;

/** Элемент, к которому прокрутить и на который поставить фокус после отрисовки. */
type RevealTarget = { selector: string };

type ProfileFormProps = {
  /**
   * `edit` — редактирование готового профиля: кнопка сохранения активна только при изменениях,
   * а уход со страницы с несохранёнными изменениями нужно подтвердить.
   */
  mode?: "create" | "edit";
  defaultValues: ProfileInput;
  defaultAvatar: AvatarValue;
  /** Фото, которое уже есть в профиле (настройки). */
  currentAvatarUrl?: string | null;
  /** Фото из аккаунтов привязанных провайдеров входа. */
  accountPhotos: AccountPhoto[];
  /** Текущий адрес владельца: его не проверяем на занятость (настройки). */
  currentUsername?: string;
  /**
   * Показывать необязательное поле контактной почты: у аккаунта нет email от провайдера
   * или контакт уже сохранён.
   */
  showContactEmail?: boolean;
  /** Блоки с данными психолога: подходы, с кем работает, формат, место, языки, цена. */
  showPractice?: boolean;
  /** Город из профиля: подпись для `cityId` из значений формы. */
  currentCity?: City | null;
  /**
   * Конструктор страницы: блоки в рамках, их порядок (как на личной странице) меняют
   * перетаскиванием и стрелками. Без него блоки идут в порядке по умолчанию: онбординг.
   */
  showSectionOrder?: boolean;
  /**
   * Блок документов (`profile-documents`): сохраняется сам, без кнопки формы, а в форме
   * занимает своё место в порядке блоков.
   */
  documentsBlock?: ReactNode;
  /** Сводка свёрнутого блока документов: их форма не знает. */
  documentsSummary?: string;
  /**
   * Свёрнутые блоки конструктора (`ProfileSection`). Без `onCollapsedChange`
   * блоки не сворачиваются. Ссылка `/settings#block-<id>` разворачивает блок и ведёт к нему.
   */
  collapsedBlocks?: readonly string[];
  onCollapsedChange?: (blockId: string, collapsed: boolean) => void;
  /**
   * Раздел настроек: часть формы монтируется при первом открытии, затем скрывается через `hidden`. Форма
   * при смене раздела остаётся: правки всех разделов сохраняются вместе по Save. В Account
   * кнопка Save стоит под полями, в остальных разделах — в липкой панели. Без раздела видна
   * вся форма: онбординг.
   */
  section?: ProfileFormSection;
  /**
   * `inline` — превью колонкой рядом с формой (онбординг). `workspace` — редактор на весь экран
   * (настройки): колонка формы фиксированной ширины и холст превью на всю остальную ширину.
   * В Search details превью нет: закрытые данные на странице не видны, форма занимает всю ширину.
   */
  layout?: "inline" | "workspace";
  /** Шапка над формой в её колонке: заголовок и подпись раздела. */
  header?: ReactNode;
  /** Блок под полями раздела Account вне `<form>`: способы входа, выход, удаление аккаунта. */
  accountBlock?: ReactNode | ((beforeLeave: (action: () => void) => void) => ReactNode);
  /**
   * Превью страницы из несохранённых значений формы (без закрытых данных и документов):
   * на широком экране — рядом с формой, на телефоне — вместо неё по кнопке Preview.
   */
  renderPreview?: (profile: PublicProfile) => ReactNode;
  submitLabel: string;
  /** Сохранение. `ApiError` с `fields` показывается у полей формы, остальные ошибки — тостом. */
  onSubmit: (values: ProfileInput, avatar: AvatarValue) => Promise<void>;
  /** Вызывается после правок с задержкой: например, для сохранения черновика. */
  onValuesChange?: (values: ProfileInput) => void;
  /** Несохранённые значения, оставшиеся с прошлого открытия: форма подставит их поверх сохранённых. */
  draftValues?: ProfileInput | null;
  /**
   * Форма закрывается: несохранённые значения или `null`, если правок нет или они сохранены.
   * Так правки переживают уход со страницы кнопкой «Назад», которую нельзя перехватить.
   */
  onDraftChange?: (values: ProfileInput | null) => void;
};

// Раскладки формы и превью. Колонка редактора — 28rem: длинные тексты на компьютере шире,
// чем на телефоне. Фон холста превью задаёт страница
const layoutClasses = {
  inline: {
    root: "@container flex flex-col gap-6",
    columns:
      "@3xl:grid @3xl:grid-cols-[minmax(0,1fr)_var(--container-profile)] @3xl:items-start @3xl:gap-8",
    formColumn: "flex flex-col gap-10",
    preview:
      "rounded-xl border p-4 @3xl:sticky @3xl:top-6 @3xl:max-h-[calc(100svh-3rem)] @3xl:overflow-y-auto",
    previewCard: "flex flex-col gap-4",
    previewBar: "flex items-center",
    previewBody: "flex flex-col",
    bar: "border-t bg-background py-3",
  },
  workspace: {
    // Превью высотой в экран растягивает строку сетки: колонка формы не короче экрана
    root: "@container flex grow flex-col",
    columns: "@3xl:grid @3xl:grid-cols-[--spacing(112)_minmax(0,1fr)]",
    formColumn: "flex flex-col gap-10 bg-background px-4 py-6 sm:px-6 @3xl:border-r",
    // Рамка превью — вся область справа, как окно браузера: панель с подписью и выбором ширины,
    // под ней холст страницы, карточка в нём сама держит ширину личной страницы. Прокручивается
    // холст под панелью. overflow-clip, а не hidden: не мешает sticky внутри страницы.
    // На телефоне рамки и полей вокруг нет: превью шириной с экран, как сама страница.
    // Закреплённая главная кнопка страницы встаёт над панелью Save (61px: py-3, кнопка, рамка)
    preview:
      "@max-3xl:[--page-cta-offset:61px] @3xl:sticky @3xl:top-0 @3xl:h-svh @3xl:self-start @3xl:p-6",
    previewCard:
      "flex w-full flex-col overflow-clip bg-background @3xl:h-full @3xl:rounded-xl @3xl:border",
    previewBar: "flex min-h-11 items-center justify-between gap-2 border-b px-4 py-1.5",
    previewBody: "flex flex-1 flex-col @3xl:overflow-y-auto",
    bar: "border-t bg-background px-4 py-3 sm:px-6 @3xl:border-r",
  },
} as const;

// Строка ссылки. Узкая форма (настройки рядом с превью, телефон): платформа и × в первой строке,
// адрес и заголовок — во всю ширину под ними
const linkRowClassName =
  "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 @md/field-group:grid-cols-[--spacing(32)_minmax(0,1fr)_auto]";

// Следующая ещё не добавленная платформа, чтобы новая строка не повторяла прежние
function getNextPlatform(links: ProfileInput["socialLinks"]): SocialPlatform {
  const used = new Set(links.map((link) => link.platform));
  return socialPlatformIds.find((platform) => !used.has(platform)) ?? "website";
}

type UsernameHintProps = {
  username: string;
  isChecking: boolean;
  /** Адрес, который проверял валидатор поля; `null` — проверять нечего. */
  checkedUsername: string | null;
};

// «Свободен» показываем только по ответу сервера для этого адреса. Запрос делает валидатор
// поля, здесь только читаем кеш: при сбое сети ответа нет, и подсказка молчит
function UsernameHint({ username, isChecking, checkedUsername }: UsernameHintProps) {
  const availability = useQuery({
    ...usernameQueries.availability(checkedUsername ?? ""),
    enabled: false,
  });
  if (isChecking) return "Checking availability…";

  const url = `${SITE_HOST}/${username || "username"}`;
  return checkedUsername && availability.data?.available ? `${url} — available` : url;
}

export function ProfileForm({
  mode = "create",
  defaultValues,
  defaultAvatar,
  currentAvatarUrl = null,
  accountPhotos,
  currentUsername,
  showContactEmail = false,
  showPractice = false,
  currentCity = null,
  showSectionOrder = false,
  documentsBlock,
  documentsSummary,
  collapsedBlocks = [],
  onCollapsedChange,
  section,
  layout = "inline",
  header,
  accountBlock,
  renderPreview,
  submitLabel,
  onSubmit,
  onValuesChange,
  draftValues,
  onDraftChange,
}: ProfileFormProps) {
  const formId = useId();
  const router = useRouter();
  const previewBodyRef = useRef<HTMLDivElement>(null);
  // Результат последнего сохранения: Save and continue уводит со страницы только после успеха
  const isSavedRef = useRef(false);
  // Адрес ссылки, переход по которой ждёт ответа в диалоге несохранённых правок
  const [leaveUrl, setLeaveUrl] = useState<URL | null>(null);
  const [leaveAction, setLeaveAction] = useState<(() => void) | null>(null);
  // Блок, который выбрали в форме последним: к нему прокручивается превью
  const selectedBlockRef = useRef<string | null>(null);
  const pendingPreviewBlockRef = useRef<string | null>(null);
  // Положение прокрутки формы и превью на телефоне: у каждого своё
  const scrollPositionsRef = useRef<{ form: number; preview: number | null }>({
    form: 0,
    preview: null,
  });
  const rootRef = useRef<HTMLDivElement>(null);
  const [reveal, setReveal] = useState<RevealTarget | null>(null);
  // Превью на телефоне: форма прячется, но остаётся в DOM, и введённое не теряется
  const [isPreviewShown, setIsPreviewShown] = useState(false);
  const [isWidePreview, setIsWidePreview] = useState(false);
  // Открытые разделы оставляем смонтированными: метаданные и async-валидаторы полей сохраняются.
  const [visitedSections, setVisitedSections] = useState(() => new Set([section]));
  useEffect(() => {
    setVisitedSections((visited) =>
      visited.has(section) ? visited : new Set([...visited, section]),
    );
  }, [section]);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    // Тот же порог 48rem, что у @3xl container query: сайдбар не входит в ширину редактора.
    const observer = new ResizeObserver(([entry]) => {
      setIsWidePreview(
        entry.contentRect.width >=
          48 * Number.parseFloat(getComputedStyle(document.documentElement).fontSize),
      );
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);
  const [previewWidth, setPreviewWidth] = useState<PreviewWidth>("desktop");
  const [isPagePasswordShown, setIsPagePasswordShown] = useState(false);
  const queryClient = useQueryClient();
  // В форме только id города, а на кнопке списка нужны название и регион: берём их у города,
  // выбранного здесь, или у города из профиля. Профиль после сохранения приходит позже,
  // чем пересоздаётся форма, поэтому подпись не храним в состоянии, а находим по id
  const [pickedCity, setPickedCity] = useState<City | null>(null);
  const findCity = (id: number | null): City | null => {
    if (id === null) return null;
    if (pickedCity?.id === id) return pickedCity;
    return currentCity?.id === id ? currentCity : null;
  };
  // Первое значение храним: проп может приходить новым объектом на каждом рендере
  const [initialAvatar] = useState(defaultAvatar);
  const [avatar, setAvatar] = useState<AvatarValue>(initialAvatar);

  // Превью нового фото — object URL: освобождаем, когда фото сменилось
  useEffect(() => {
    if (avatar.type !== "file") return;
    const { previewUrl } = avatar;
    return () => URL.revokeObjectURL(previewUrl);
  }, [avatar]);

  const form = useForm({
    defaultValues,
    validators: { onChange: profileInputSchema },
    listeners: {
      onChange: ({ formApi }) => onValuesChange?.(formApi.state.values),
      onChangeDebounceMs: VALUES_CHANGE_DEBOUNCE_MS,
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        await onSubmit(value, avatar);
        isSavedRef.current = true;
      } catch (error) {
        if (!(error instanceof ApiError)) {
          toast.error("Couldn’t save. Please try again.");
          return;
        }

        // Ошибки по полям показываем у полей; они пропадут, как только поле исправят
        let isShownInFields = false;
        for (const [path, message] of Object.entries(error.fields ?? {})) {
          const name = toFormFieldName(path) as DeepKeys<ProfileInput>;
          if (!formApi.getFieldMeta(name)) continue;
          formApi.setFieldMeta(name, (meta) => ({
            ...meta,
            errorMap: { ...meta.errorMap, onSubmit: message },
          }));
          isShownInFields = true;
        }
        if (!isShownInFields) toast.error(error.message);
      }
    },
  });

  // Любой выбор фото создаёт новый объект, поэтому изменение фото — это смена ссылки
  const isFormDefault = useStore(form.store, (state) => state.isDefaultValue);
  // Пока идёт сохранение, поля недоступны: после ответа форма пересоздаётся, и ввод за время
  // запроса пропал бы (шаг 81)
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const hasChanges = !isFormDefault || avatar !== initialAvatar;
  const isEditMode = mode === "edit";
  useUnsavedChangesWarning(isEditMode && hasChanges, setLeaveUrl);

  // Черновик с прошлого открытия — поверх сохранённых значений, при закрытии формы — обратно.
  // Только при монтировании: форма пересоздаётся после каждого сохранения
  // biome-ignore lint/correctness/useExhaustiveDependencies: черновик подставляем один раз
  useEffect(() => {
    if (draftValues) {
      for (const key of Object.keys(draftValues) as (keyof ProfileInput)[]) {
        if (JSON.stringify(draftValues[key]) !== JSON.stringify(form.state.values[key])) {
          form.setFieldValue(key, draftValues[key]);
        }
      }
    }
    return () => {
      const isDraft = !isSavedRef.current && !form.state.isDefaultValue;
      onDraftChange?.(isDraft ? form.state.values : null);
    };
  }, []);

  // Шапка блока в конструкторе уже называет его: совпадающую подпись поля оставляем только
  // для скринридера
  const titleClassName = showSectionOrder ? "sr-only" : undefined;

  const isCollapsed = (blockId: string) =>
    Boolean(onCollapsedChange) && collapsedBlocks.includes(blockId);
  const isSectionHidden = (id: ProfileFormSection) => section !== undefined && section !== id;
  const isSectionMounted = (id: ProfileFormSection) =>
    section === undefined || section === id || visitedSections.has(id);
  // В онбординге и разделе Public profile превью есть всегда, в редакторе на весь экран — во всех
  // разделах, кроме Search details: его закрытых данных на странице нет
  const hasPreview =
    Boolean(renderPreview) &&
    (layout === "workspace" ? section !== "search" : !isSectionHidden("profile"));
  const isPreviewOpen = hasPreview && isPreviewShown;
  const avatarUrl = getAvatarUrl(avatar, currentAvatarUrl, accountPhotos);
  const getPreview = (values: ProfileInput) =>
    toPreviewProfile(values, { avatarUrl, city: findCity(values.cityId) });

  // Прокрутка и фокус — после отрисовки: развёрнутого блока, другого раздела или формы вместо
  // превью. Поля скрытых разделов пропускаем: цель ждёт, пока её раздел откроется
  // biome-ignore lint/correctness/useExhaustiveDependencies: после смены раздела цель становится видна
  useEffect(() => {
    if (!reveal) return;
    const candidates = rootRef.current?.querySelectorAll<HTMLElement>(reveal.selector) ?? [];
    const target = Array.from(candidates).find((element) => element.getClientRects().length > 0);
    if (!target) return;
    target.scrollIntoView({ block: "center" });
    target.focus({ preventScroll: true });
    setReveal(null);
  }, [reveal, section]);

  // Ссылки чек-листа на странице владельца: `/settings#block-contacts` разворачивает блок
  // и ставит фокус на первое поле, `/settings#photo` — на поле с этим id. Хеш убираем, чтобы
  // форма, пересозданная после сохранения, не прыгала снова
  useEffect(() => {
    if (!onCollapsedChange) return;
    const hash = decodeURIComponent(window.location.hash.slice(1));
    const element = hash ? document.getElementById(hash) : null;
    if (!element || !rootRef.current?.contains(element)) return;
    const block = element.closest<HTMLElement>("[data-block]");
    if (block?.dataset.block) onCollapsedChange(block.dataset.block, false);
    const id = `#${CSS.escape(hash)}`;
    // Фокус — на самом поле или на первом поле внутри: у блока — внутри содержимого, не на шапке
    const scope = element === block ? `${id} fieldset` : id;
    setReveal({ selector: element.matches(FOCUSABLE) ? id : `${scope} :is(${FOCUSABLE})` });
    const { pathname, search } = window.location;
    window.history.replaceState(window.history.state, "", pathname + search);
  }, [onCollapsedChange]);

  // Ведёт к полю: разворачивает его блок, открывает раздел и ставит фокус
  const revealField = (selector: string, blockId: string | null, target?: ProfileFormSection) => {
    if (blockId && isCollapsed(blockId)) onCollapsedChange?.(blockId, false);
    if (target && target !== section) router.push(routes.settingsSection(target));
    setIsPreviewShown(false);
    setReveal({ selector });
  };

  /** Сохраняет форму; `true` — сохранение прошло. */
  const submit = async (): Promise<boolean> => {
    isSavedRef.current = false;
    await form.handleSubmit();
    // Неверное поле может оказаться в свёрнутом блоке, в другом разделе, под превью или далеко
    // от панели Save: разворачиваем такие блоки и ведём к первому неверному полю
    const invalidFields = Object.entries(form.state.fieldMeta).filter(
      ([, meta]) => meta && !meta.isValid,
    );
    if (invalidFields.length === 0) return isSavedRef.current;
    const invalid: { field: keyof ProfileInput; section: ProfileFormSection }[] = [];
    for (const [name] of invalidFields) {
      // Ошибка связанного поля (город при очном формате, пароль для режима password) могла
      // появиться без касания поля: TanStack Form тогда не отправляет форму и не показывает её
      form.setFieldMeta(name as DeepKeys<ProfileInput>, (meta) => ({ ...meta, isTouched: true }));
      const field = name.split(/[.[]/)[0] as keyof ProfileInput;
      invalid.push({ field, section: getFieldSection(field) });
      const blockId = fieldInfo[field].block;
      if (blockId && isCollapsed(blockId)) onCollapsedChange?.(blockId, false);
    }
    const other = invalid.find((item) => item.section !== section);
    if (section && other && !invalid.some((item) => item.section === section)) {
      // Ошибка только в скрытом разделе: называем поле и даём перейти к нему, правки остаются
      const { label, block } = fieldInfo[other.field];
      toast.error(`Couldn’t save. Check ${label} in ${profileFormSectionLabels[other.section]}.`, {
        action: {
          label: "Go to field",
          onClick: () => revealField('[aria-invalid="true"]', block, other.section),
        },
      });
      return false;
    }
    setIsPreviewShown(false);
    setReveal({ selector: '[aria-invalid="true"]' });
    return false;
  };

  const leave = (url: URL) => {
    setLeaveUrl(null);
    if (url.origin === window.location.origin) router.push(url.pathname + url.search + url.hash);
    else window.location.assign(url);
  };

  const discardAndLeave = (url: URL) => {
    form.reset();
    setAvatar(initialAvatar);
    leave(url);
  };

  const saveAndLeave = async (url: URL) => {
    const submittedUsername = form.state.values.username;
    setLeaveUrl(null);
    if (await submit()) {
      if (
        currentUsername &&
        url.origin === window.location.origin &&
        url.pathname === routes.profile(currentUsername)
      ) {
        url.pathname = routes.profile(usernameSchema.parse(submittedUsername));
      }
      leave(url);
    }
  };

  const beforeLeave = (action: () => void) => {
    if (hasChanges) setLeaveAction(() => action);
    else action();
  };

  const finishAccountAction = async (save: boolean) => {
    const action = leaveAction;
    setLeaveAction(null);
    if (!action) return;
    if (save) {
      if (!(await submit())) return;
    } else {
      form.reset();
      setAvatar(initialAvatar);
    }
    action();
  };

  // Прокрутка превью к блоку на странице: на широком экране прокручивается холст превью, на
  // телефоне — вся страница. Пустого блока на странице нет, тогда превью остаётся на месте
  const scrollPreviewTo = (blockId: string) => {
    const body = previewBodyRef.current;
    const anchor = body?.querySelector<HTMLElement>(
      `[data-preview-section="${CSS.escape(blockId)}"]`,
    );
    // У обёртки `display: contents` нет своей рамки: меряем первый элемент блока
    const target = anchor?.getClientRects().length ? anchor : anchor?.firstElementChild;
    if (!body || !target) return false;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
    const offset = 16;
    if (getComputedStyle(body).overflowY === "auto") {
      const top = target.getBoundingClientRect().top - body.getBoundingClientRect().top;
      body.scrollTo({ top: body.scrollTop + top - offset, behavior });
    } else {
      window.scrollTo({ top: window.scrollY + target.getBoundingClientRect().top - offset });
    }
    return true;
  };

  // Выбор поля или кнопки блока, раскрытие его шапки — превью показывает этот блок.
  // Ввод внутри того же блока превью не двигает
  const selectBlock = (event: React.SyntheticEvent, reselect = false) => {
    // Фокус на кнопке сворачивания не выбирает блок: раскрытие обрабатываем по клику.
    if (
      !reselect &&
      event.target instanceof Element &&
      event.target.closest("[data-block] h2 button[aria-expanded]")
    ) {
      return;
    }
    const blockId =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>("[data-block]")?.dataset.block
        : undefined;
    if (!blockId || (!reselect && blockId === selectedBlockRef.current)) return;
    selectedBlockRef.current = blockId;
    // Превью рядом с формой видно сразу; на телефоне оно откроется по кнопке Preview
    if (previewBodyRef.current?.getClientRects().length) scrollPreviewTo(blockId);
    else pendingPreviewBlockRef.current = blockId;
  };

  const togglePreview = () => {
    scrollPositionsRef.current[isPreviewOpen ? "preview" : "form"] = window.scrollY;
    setIsPreviewShown(!isPreviewOpen);
  };

  // Переключение Preview ↔ Edit на телефоне: форма возвращается туда, где её оставили, превью —
  // к выбранному с прошлого раза блоку или на прежнее место
  const wasPreviewOpenRef = useRef(isPreviewOpen);
  // biome-ignore lint/correctness/useExhaustiveDependencies: только при переключении
  useEffect(() => {
    if (wasPreviewOpenRef.current === isPreviewOpen) return;
    wasPreviewOpenRef.current = isPreviewOpen;
    // Ошибка при сохранении сама ведёт к неверному полю
    if (reveal) return;
    const positions = scrollPositionsRef.current;
    if (!isPreviewOpen) {
      window.scrollTo({ top: positions.form });
      return;
    }
    const blockId =
      pendingPreviewBlockRef.current ??
      (positions.preview === null ? selectedBlockRef.current : null);
    pendingPreviewBlockRef.current = null;
    if (blockId && scrollPreviewTo(blockId)) return;
    if (positions.preview === null) rootRef.current?.scrollIntoView({ block: "start" });
    else window.scrollTo({ top: positions.preview });
  }, [isPreviewOpen]);

  const renderSummary = (section: ProfileSection): ReactNode => (
    <form.Subscribe selector={(state) => state.values}>
      {(values) => (
        <>
          {values.highlightedSections.includes(section) ? (
            <span className="font-medium text-foreground">Highlighted · </span>
          ) : null}
          {section === "documents"
            ? (documentsSummary ?? "Not filled")
            : getBlockSummary(section, getPreview(values))}
        </>
      )}
    </form.Subscribe>
  );

  const isBlockShown = (section: ProfileSection) => {
    if (practiceSections.has(section)) return showPractice;
    return section === "documents" ? Boolean(documentsBlock) : true;
  };

  const renderBlock = (section: ProfileSection): ReactNode => {
    switch (section) {
      case "bio":
        return (
          <form.Field name="bio">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name} className={titleClassName}>
                    Bio
                  </FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={isInvalid}
                    aria-describedby={`${field.name}-description ${field.name}-counter`}
                    maxLength={BIO_MAX_LENGTH}
                    rows={4}
                  />
                  <FieldDescription id={`${field.name}-description`}>
                    You could describe who you help, the concerns you work with, and what clients
                    can expect when working with you.
                  </FieldDescription>
                  <FieldDescription id={`${field.name}-counter`}>
                    {field.state.value.length} / {BIO_MAX_LENGTH}
                  </FieldDescription>
                  {isInvalid ? (
                    <FieldError errors={toFieldErrors(field.state.meta.errors)} />
                  ) : null}
                </Field>
              );
            }}
          </form.Field>
        );
      case "links":
        return (
          <form.Field name="socialLinks" mode="array">
            {(linksField) => (
              <FieldSet>
                <FieldLegend variant="label" className={titleClassName}>
                  Social links
                </FieldLegend>
                {linksField.state.value.length > 0 ? (
                  <ul className="flex flex-col gap-3">
                    {linksField.state.value.map((link, index) => (
                      // Поля массива в TanStack Form привязаны к индексу
                      // biome-ignore lint/suspicious/noArrayIndexKey: ключ совпадает с именем поля
                      <li key={index} className={linkRowClassName}>
                        <form.Field name={`socialLinks[${index}].platform`}>
                          {(field) => (
                            <Select
                              value={field.state.value}
                              onValueChange={(value) =>
                                field.handleChange(value as SocialPlatform)
                              }>
                              <SelectTrigger
                                aria-label={`Platform for link ${index + 1}`}
                                className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {socialPlatformIds.map((platform) => (
                                  <SelectItem key={platform} value={platform}>
                                    {socialPlatforms[platform].label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </form.Field>
                        <div className="col-span-2 row-start-2 flex min-w-0 flex-col gap-2 @md/field-group:col-span-1 @md/field-group:row-start-auto">
                          <form.Field name={`socialLinks[${index}].url`}>
                            {(field) => {
                              const isInvalid =
                                field.state.meta.isTouched && !field.state.meta.isValid;
                              return (
                                <Field data-invalid={isInvalid}>
                                  <Input
                                    name={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(event) => field.handleChange(event.target.value)}
                                    aria-invalid={isInvalid}
                                    aria-label={`Link ${index + 1}`}
                                    placeholder={socialPlatforms[link.platform].placeholder}
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    spellCheck={false}
                                  />
                                  {isInvalid ? (
                                    <FieldError errors={toFieldErrors(field.state.meta.errors)} />
                                  ) : null}
                                </Field>
                              );
                            }}
                          </form.Field>
                          <form.Field name={`socialLinks[${index}].title`}>
                            {(field) => {
                              const isInvalid =
                                field.state.meta.isTouched && !field.state.meta.isValid;
                              return (
                                <Field data-invalid={isInvalid}>
                                  <Input
                                    name={field.name}
                                    // Черновик онбординга мог сохраниться до появления заголовков
                                    value={field.state.value ?? ""}
                                    onBlur={field.handleBlur}
                                    onChange={(event) => field.handleChange(event.target.value)}
                                    aria-invalid={isInvalid}
                                    aria-label={`Title for link ${index + 1}`}
                                    placeholder="Title (optional)"
                                    maxLength={SOCIAL_LINK_TITLE_MAX_LENGTH}
                                  />
                                  {isInvalid ? (
                                    <FieldError errors={toFieldErrors(field.state.meta.errors)} />
                                  ) : null}
                                </Field>
                              );
                            }}
                          </form.Field>
                          {showSectionOrder ? (
                            <form.Field name={`socialLinks[${index}].highlighted`}>
                              {(field) => (
                                <HighlightCheckbox
                                  id={`socialLinks-${index}-highlighted`}
                                  label={`Highlight link ${index + 1}`}
                                  checked={field.state.value ?? false}
                                  onChange={field.handleChange}
                                />
                              )}
                            </form.Field>
                          ) : null}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove link ${index + 1}`}
                          className="col-start-2 row-start-1 @md/field-group:col-start-3"
                          onClick={() => linksField.removeValue(index)}>
                          <XIcon aria-hidden="true" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {linksField.state.meta.isTouched && !linksField.state.meta.isValid ? (
                  <FieldError errors={toFieldErrors(linksField.state.meta.errors)} />
                ) : null}
                {linksField.state.value.length < SOCIAL_LINKS_MAX ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="self-start"
                    onClick={() =>
                      linksField.pushValue({
                        platform: getNextPlatform(linksField.state.value),
                        url: "",
                        title: "",
                        highlighted: false,
                      })
                    }>
                    <PlusIcon aria-hidden="true" />
                    Add link
                  </Button>
                ) : null}
              </FieldSet>
            )}
          </form.Field>
        );
      case "approaches":
        return (
          <form.Field name="approaches">
            {(field) => (
              <CheckboxGroup
                name={field.name}
                legend="Approaches"
                description={`Up to ${APPROACHES_MAX}.`}
                legendClassName={titleClassName}
                options={approachOptions}
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                max={APPROACHES_MAX}
                className="sm:grid sm:grid-cols-2"
                errors={field.state.meta.isTouched ? toFieldErrors(field.state.meta.errors) : []}
              />
            )}
          </form.Field>
        );
      case "client-types":
        return (
          <form.Field name="clientTypes">
            {(field) => (
              <CheckboxGroup
                name={field.name}
                legend="Works with"
                legendClassName={titleClassName}
                options={clientTypeOptions}
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                errors={field.state.meta.isTouched ? toFieldErrors(field.state.meta.errors) : []}
              />
            )}
          </form.Field>
        );
      case "work-formats":
        return (
          <form.Field name="workFormats">
            {(field) => {
              // Город выбирают в Account: без него очный формат не выбрать
              const hasCity = form.getFieldValue("cityId") !== null;
              return (
                <div className="flex flex-col gap-4">
                  <CheckboxGroup
                    name={field.name}
                    legend="Work format"
                    legendClassName={titleClassName}
                    options={workFormatOptions.map((option) => ({
                      ...option,
                      disabled: option.value === "in-person" && !hasCity,
                    }))}
                    description={
                      hasCity ? undefined : (
                        <>
                          To offer in-person sessions, add your city in{" "}
                          <Link href={routes.settingsSection("account")}>Account</Link>.
                        </>
                      )
                    }
                    value={field.state.value}
                    onChange={field.handleChange}
                    onBlur={field.handleBlur}
                    errors={
                      field.state.meta.isTouched ? toFieldErrors(field.state.meta.errors) : []
                    }
                  />
                  {field.state.value.includes("in-person") ? (
                    <form.Field name="inPersonArea">
                      {(areaField) => {
                        const isInvalid =
                          areaField.state.meta.isTouched && !areaField.state.meta.isValid;
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={areaField.name}>
                              Area for in-person sessions
                            </FieldLabel>
                            <Input
                              id={areaField.name}
                              name={areaField.name}
                              value={areaField.state.value}
                              onBlur={areaField.handleBlur}
                              onChange={(event) => areaField.handleChange(event.target.value)}
                              aria-invalid={isInvalid}
                              aria-describedby={`${areaField.name}-description`}
                              placeholder="Vake, near the metro"
                              maxLength={IN_PERSON_AREA_MAX_LENGTH}
                            />
                            <FieldDescription id={`${areaField.name}-description`}>
                              Optional and shown on your page. Don’t enter your exact address.
                            </FieldDescription>
                            {isInvalid ? (
                              <FieldError errors={toFieldErrors(areaField.state.meta.errors)} />
                            ) : null}
                          </Field>
                        );
                      }}
                    </form.Field>
                  ) : null}
                </div>
              );
            }}
          </form.Field>
        );
      case "location":
        // Страну и город выбирают в Account: блок здесь — только место на странице
        return (
          <form.Subscribe
            selector={(state) => getBlockSummary("location", getPreview(state.values))}>
            {(summary) => (
              <FieldDescription>
                {summary}. Change it in{" "}
                <Link href={routes.settingsSection("account")}>Account</Link>.
              </FieldDescription>
            )}
          </form.Subscribe>
        );
      case "languages":
        return (
          <form.Field name="languages">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name} className={titleClassName}>
                    Languages
                  </FieldLabel>
                  <LanguagesSelect
                    id={field.name}
                    value={field.state.value}
                    aria-invalid={isInvalid}
                    aria-describedby={`${field.name}-description`}
                    onChange={(languages) => {
                      field.handleChange(languages);
                      field.handleBlur();
                    }}
                  />
                  <FieldDescription id={`${field.name}-description`}>
                    Up to {LANGUAGES_MAX}.
                  </FieldDescription>
                  {isInvalid ? (
                    <FieldError errors={toFieldErrors(field.state.meta.errors)} />
                  ) : null}
                </Field>
              );
            }}
          </form.Field>
        );
      case "price":
        return (
          <form.Field name="priceAmount">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              const currency = form.getFieldValue("currency");
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Price per session</FieldLabel>
                  {/* Поле узкое: Field растягивает прямых потомков на всю ширину */}
                  <div>
                    <InputGroup className="w-36">
                      <InputGroupInput
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        aria-invalid={isInvalid}
                        aria-describedby={`${field.name}-description`}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="off"
                        maxLength={PRICE_AMOUNT_MAX_LENGTH}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupText>{currency}</InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                  </div>
                  <FieldDescription id={`${field.name}-description`}>
                    In {getCurrencyName(currency)}. Change the currency in{" "}
                    <Link href={routes.settingsSection("account")}>Account</Link>.
                  </FieldDescription>
                  {isInvalid ? (
                    <FieldError errors={toFieldErrors(field.state.meta.errors)} />
                  ) : null}
                  <form.Field name="priceType">
                    {(typeField) => (
                      <Field orientation="horizontal">
                        <Checkbox
                          id={typeField.name}
                          checked={typeField.state.value === "fixed"}
                          onCheckedChange={(checked) => {
                            typeField.handleChange(checked === true ? "fixed" : "from");
                            typeField.handleBlur();
                          }}
                        />
                        <FieldLabel htmlFor={typeField.name} className="font-normal">
                          Fixed price. Without it, your page shows “From”
                        </FieldLabel>
                      </Field>
                    )}
                  </form.Field>
                </Field>
              );
            }}
          </form.Field>
        );
      case "experience":
        return (
          <form.Field name="practiceStartedOn">
            {(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Practicing since</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="date"
                    max={utcDateYearsAgo(0)}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    aria-invalid={isInvalid}
                    aria-describedby={`${field.name}-description`}
                    className="w-auto"
                  />
                  <FieldDescription id={`${field.name}-description`}>
                    Your page shows your years of experience.
                  </FieldDescription>
                  {isInvalid ? (
                    <FieldError errors={toFieldErrors(field.state.meta.errors)} />
                  ) : null}
                </Field>
              );
            }}
          </form.Field>
        );
      case "education":
        return (
          <form.Field name="education" mode="array">
            {(educationField) => (
              <FieldSet>
                <FieldLegend variant="label" className={titleClassName}>
                  Education
                </FieldLegend>
                <FieldDescription>
                  For a long program, add its length to the qualification, like “Gestalt therapy,
                  3-year program, 600 hours”.
                </FieldDescription>
                {educationField.state.value.length > 0 ? (
                  <ul className="flex flex-col gap-4">
                    {educationField.state.value.map((_, index) => (
                      // Поля массива в TanStack Form привязаны к индексу
                      // biome-ignore lint/suspicious/noArrayIndexKey: ключ совпадает с именем поля
                      <li key={index} className="flex items-start gap-2">
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                          <form.Field name={`education[${index}].qualification`}>
                            {(field) => {
                              const isInvalid =
                                field.state.meta.isTouched && !field.state.meta.isValid;
                              return (
                                <Field data-invalid={isInvalid}>
                                  <FieldLabel htmlFor={field.name}>
                                    Degree or qualification
                                  </FieldLabel>
                                  <Input
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(event) => field.handleChange(event.target.value)}
                                    aria-invalid={isInvalid}
                                    aria-label={`Degree or qualification ${index + 1}`}
                                    placeholder="Degree or qualification"
                                    maxLength={EDUCATION_TEXT_MAX_LENGTH}
                                  />
                                  {isInvalid ? (
                                    <FieldError errors={toFieldErrors(field.state.meta.errors)} />
                                  ) : null}
                                </Field>
                              );
                            }}
                          </form.Field>
                          <div className="flex items-start gap-2">
                            <form.Field name={`education[${index}].institution`}>
                              {(field) => {
                                const isInvalid =
                                  field.state.meta.isTouched && !field.state.meta.isValid;
                                return (
                                  <Field data-invalid={isInvalid} className="min-w-0 flex-1">
                                    <FieldLabel htmlFor={field.name}>
                                      School or institution
                                    </FieldLabel>
                                    <Input
                                      id={field.name}
                                      name={field.name}
                                      value={field.state.value}
                                      onBlur={field.handleBlur}
                                      onChange={(event) => field.handleChange(event.target.value)}
                                      aria-invalid={isInvalid}
                                      aria-label={`School or institution ${index + 1}`}
                                      placeholder="School or institution"
                                      maxLength={EDUCATION_TEXT_MAX_LENGTH}
                                    />
                                    {isInvalid ? (
                                      <FieldError errors={toFieldErrors(field.state.meta.errors)} />
                                    ) : null}
                                  </Field>
                                );
                              }}
                            </form.Field>
                            <form.Field name={`education[${index}].year`}>
                              {(field) => {
                                const isInvalid =
                                  field.state.meta.isTouched && !field.state.meta.isValid;
                                return (
                                  <Field data-invalid={isInvalid} className="w-20 shrink-0">
                                    <FieldLabel htmlFor={field.name}>Year</FieldLabel>
                                    <Input
                                      id={field.name}
                                      name={field.name}
                                      value={field.state.value}
                                      onBlur={field.handleBlur}
                                      onChange={(event) => field.handleChange(event.target.value)}
                                      aria-invalid={isInvalid}
                                      aria-label={`Year ${index + 1}`}
                                      placeholder="Year"
                                      inputMode="numeric"
                                      pattern="[0-9]*"
                                      autoComplete="off"
                                      maxLength={4}
                                    />
                                  </Field>
                                );
                              }}
                            </form.Field>
                          </div>
                          {/* Ошибку года показываем под строкой: в узком поле она не поместится */}
                          <form.Subscribe
                            selector={(state) =>
                              state.fieldMeta[`education[${index}].year`] ?? null
                            }>
                            {(meta) =>
                              meta?.isTouched && !meta.isValid ? (
                                <FieldError errors={toFieldErrors(meta.errors)} />
                              ) : null
                            }
                          </form.Subscribe>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove education ${index + 1}`}
                          onClick={() => educationField.removeValue(index)}>
                          <XIcon aria-hidden="true" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {educationField.state.meta.isTouched && !educationField.state.meta.isValid ? (
                  <FieldError errors={toFieldErrors(educationField.state.meta.errors)} />
                ) : null}
                {educationField.state.value.length < EDUCATION_MAX ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="self-start"
                    onClick={() =>
                      educationField.pushValue({ qualification: "", institution: "", year: "" })
                    }>
                    <PlusIcon aria-hidden="true" />
                    Add education
                  </Button>
                ) : null}
              </FieldSet>
            )}
          </form.Field>
        );
      case "contacts":
        return (
          <FieldGroup>
            <FieldDescription>Shown on your page so clients can reach you.</FieldDescription>
            {contactTypeIds.map((type) => (
              <form.Field key={type} name={`contacts.${type}`}>
                {(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>{contactTypeLabels[type]}</FieldLabel>
                      <Input
                        {...contactInputProps[type]}
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        aria-invalid={isInvalid}
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                      />
                      {isInvalid ? (
                        <FieldError errors={toFieldErrors(field.state.meta.errors)} />
                      ) : null}
                    </Field>
                  );
                }}
              </form.Field>
            ))}
            <form.Field name="preferredContact">
              {(field) => (
                <form.Subscribe
                  selector={(state) => [state.values.contacts, state.values.socialLinks] as const}>
                  {([contacts, socialLinks]) => {
                    const options = getPreferredContactOptions(contacts, socialLinks);
                    // Способ, которого больше нет, схема сбросит при сохранении
                    const value = options.some((option) => option.value === field.state.value)
                      ? field.state.value
                      : NOT_SELECTED;
                    return (
                      <Field>
                        <FieldLabel htmlFor={field.name}>Preferred way to contact</FieldLabel>
                        <Select
                          value={value}
                          onValueChange={(next) => {
                            // Пустую строку присылает скрытый <select> Radix, а не выбор
                            // пользователя: «не выбрано» — это NOT_SELECTED
                            if (!next) return;
                            field.handleChange(next === NOT_SELECTED ? "" : next);
                            field.handleBlur();
                          }}>
                          <SelectTrigger
                            id={field.name}
                            aria-describedby={`${field.name}-description`}
                            className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NOT_SELECTED}>Not selected</SelectItem>
                            {options.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldDescription id={`${field.name}-description`}>
                          The main button on your page. Choose from your contacts and links.
                        </FieldDescription>
                      </Field>
                    );
                  }}
                </form.Subscribe>
              )}
            </form.Field>
          </FieldGroup>
        );
      case "faq":
        return (
          <form.Field name="faq" mode="array">
            {(faqField) => {
              const count = faqField.state.value.length;
              const questions = new Set(faqField.state.value.map((item) => item.question.trim()));
              const suggestions = faqSuggestions.filter((question) => !questions.has(question));
              return (
                <FieldSet>
                  <FieldLegend variant="label" className={titleClassName}>
                    FAQ
                  </FieldLegend>
                  <FieldDescription>
                    Answers to questions clients often ask. Visitors open each answer on your page.
                  </FieldDescription>
                  {count > 0 ? (
                    <ol className="flex flex-col gap-4">
                      {faqField.state.value.map((_, index) => (
                        // Поля массива в TanStack Form привязаны к индексу
                        // biome-ignore lint/suspicious/noArrayIndexKey: ключ совпадает с именем поля
                        <li key={index} className="flex items-start gap-2">
                          <div className="flex min-w-0 flex-1 flex-col gap-2">
                            <form.Field name={`faq[${index}].question`}>
                              {(field) => {
                                const isInvalid =
                                  field.state.meta.isTouched && !field.state.meta.isValid;
                                return (
                                  <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={field.name}>Question</FieldLabel>
                                    <Input
                                      id={field.name}
                                      name={field.name}
                                      value={field.state.value}
                                      onBlur={field.handleBlur}
                                      onChange={(event) => field.handleChange(event.target.value)}
                                      aria-invalid={isInvalid}
                                      aria-label={`Question ${index + 1}`}
                                      placeholder="Question"
                                      maxLength={FAQ_QUESTION_MAX_LENGTH}
                                    />
                                    {isInvalid ? (
                                      <FieldError errors={toFieldErrors(field.state.meta.errors)} />
                                    ) : null}
                                  </Field>
                                );
                              }}
                            </form.Field>
                            <form.Field name={`faq[${index}].answer`}>
                              {(field) => {
                                const isInvalid =
                                  field.state.meta.isTouched && !field.state.meta.isValid;
                                return (
                                  <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={field.name}>Answer</FieldLabel>
                                    <Textarea
                                      id={field.name}
                                      name={field.name}
                                      value={field.state.value}
                                      onBlur={field.handleBlur}
                                      onChange={(event) => field.handleChange(event.target.value)}
                                      aria-invalid={isInvalid}
                                      aria-label={`Answer ${index + 1}`}
                                      placeholder="Your answer"
                                      maxLength={FAQ_ANSWER_MAX_LENGTH}
                                      rows={3}
                                    />
                                    {isInvalid ? (
                                      <FieldError errors={toFieldErrors(field.state.meta.errors)} />
                                    ) : null}
                                  </Field>
                                );
                              }}
                            </form.Field>
                          </div>
                          <div className="flex flex-col">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={`Move question ${index + 1} up`}
                              disabled={index === 0}
                              onClick={() => faqField.moveValue(index, index - 1)}>
                              <ArrowUpIcon aria-hidden="true" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={`Move question ${index + 1} down`}
                              disabled={index === count - 1}
                              onClick={() => faqField.moveValue(index, index + 1)}>
                              <ArrowDownIcon aria-hidden="true" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={`Remove question ${index + 1}`}
                              onClick={() => faqField.removeValue(index)}>
                              <XIcon aria-hidden="true" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : null}
                  {faqField.state.meta.isTouched && !faqField.state.meta.isValid ? (
                    <FieldError errors={toFieldErrors(faqField.state.meta.errors)} />
                  ) : null}
                  {count < FAQ_MAX ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        className="self-start"
                        onClick={() => faqField.pushValue({ question: "", answer: "" })}>
                        <PlusIcon aria-hidden="true" />
                        Add question
                      </Button>
                      {suggestions.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          <p className="text-muted-foreground text-sm">Common questions</p>
                          <ul className="flex flex-wrap gap-2">
                            {suggestions.map((question) => (
                              <li key={question} className="max-w-full">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-auto max-w-full whitespace-normal py-1 text-left"
                                  onClick={() => faqField.pushValue({ question, answer: "" })}>
                                  <PlusIcon aria-hidden="true" />
                                  {question}
                                </Button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </FieldSet>
              );
            }}
          </form.Field>
        );
      case "services":
        return (
          <form.Field name="services" mode="array">
            {(servicesField) => (
              <form.Subscribe selector={(state) => state.values.clientTypes}>
                {(clientTypes) => {
                  const count = servicesField.state.value.length;
                  const canAdd = clientTypes.length > 0 && count < SERVICES_MAX;
                  return (
                    <FieldSet>
                      <FieldLegend variant="label" className={titleClassName}>
                        Services
                      </FieldLegend>
                      <FieldDescription>
                        {clientTypes.length > 0
                          ? "A card for each service, with its own client group, price and duration. A group can have several services."
                          : "Choose who you work with in Works with to add services."}
                      </FieldDescription>
                      {count > 0 ? (
                        <ul className="flex flex-col gap-4">
                          {servicesField.state.value.map((_, index) => (
                            // Поля массива в TanStack Form привязаны к индексу
                            // biome-ignore lint/suspicious/noArrayIndexKey: ключ совпадает с именем поля
                            <li key={index} className="flex flex-col gap-2 rounded-lg border p-3">
                              <div className="flex items-start gap-2">
                                <form.Field name={`services[${index}].clientType`}>
                                  {(field) => {
                                    // Категорию сняли в «Works with»: карточку не удаляем, а просим
                                    // выбрать другую группу
                                    const isStale = !clientTypes.includes(field.state.value);
                                    const options = isStale
                                      ? [...clientTypes, field.state.value]
                                      : clientTypes;
                                    return (
                                      <Field data-invalid={isStale} className="min-w-0 flex-1">
                                        <FieldLabel htmlFor={field.name}>Client group</FieldLabel>
                                        <Select
                                          value={field.state.value}
                                          onValueChange={(next) => {
                                            if (!next) return;
                                            field.handleChange(next as typeof field.state.value);
                                            field.handleBlur();
                                          }}>
                                          <SelectTrigger
                                            id={field.name}
                                            aria-label={`Client group for service ${index + 1}`}
                                            aria-invalid={isStale}
                                            className="w-full sm:w-48">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {options.map((type) => (
                                              <SelectItem key={type} value={type}>
                                                {clientTypeLabels[type]}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        {isStale ? (
                                          <FieldError>
                                            {clientTypeLabels[field.state.value]} isn’t selected in
                                            Works with. Choose another group or remove this card.
                                          </FieldError>
                                        ) : null}
                                      </Field>
                                    );
                                  }}
                                </form.Field>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  aria-label={`Remove service ${index + 1}`}
                                  onClick={() => servicesField.removeValue(index)}>
                                  <XIcon aria-hidden="true" />
                                </Button>
                              </div>
                              <form.Field name={`services[${index}].title`}>
                                {(field) => {
                                  const isInvalid =
                                    field.state.meta.isTouched && !field.state.meta.isValid;
                                  return (
                                    <Field data-invalid={isInvalid}>
                                      <FieldLabel htmlFor={field.name}>Service name</FieldLabel>
                                      <Input
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(event) => field.handleChange(event.target.value)}
                                        aria-invalid={isInvalid}
                                        aria-label={`Service name ${index + 1}`}
                                        placeholder="Service name"
                                        maxLength={SERVICE_TITLE_MAX_LENGTH}
                                      />
                                      {isInvalid ? (
                                        <FieldError
                                          errors={toFieldErrors(field.state.meta.errors)}
                                        />
                                      ) : null}
                                    </Field>
                                  );
                                }}
                              </form.Field>
                              <form.Field name={`services[${index}].description`}>
                                {(field) => {
                                  const isInvalid =
                                    field.state.meta.isTouched && !field.state.meta.isValid;
                                  return (
                                    <Field data-invalid={isInvalid}>
                                      <FieldLabel htmlFor={field.name}>
                                        Description (optional)
                                      </FieldLabel>
                                      <Textarea
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(event) => field.handleChange(event.target.value)}
                                        aria-invalid={isInvalid}
                                        aria-label={`Service description ${index + 1}`}
                                        placeholder="Description (optional)"
                                        maxLength={SERVICE_DESCRIPTION_MAX_LENGTH}
                                        rows={2}
                                      />
                                      {isInvalid ? (
                                        <FieldError
                                          errors={toFieldErrors(field.state.meta.errors)}
                                        />
                                      ) : null}
                                    </Field>
                                  );
                                }}
                              </form.Field>
                              <div className="flex flex-wrap items-start gap-2">
                                <form.Field name={`services[${index}].durationMinutes`}>
                                  {(field) => (
                                    <Field className="w-28 shrink-0">
                                      <FieldLabel htmlFor={field.name}>Duration (min)</FieldLabel>
                                      <Input
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(event) => field.handleChange(event.target.value)}
                                        aria-invalid={
                                          field.state.meta.isTouched && !field.state.meta.isValid
                                        }
                                        aria-label={`Duration in minutes, service ${index + 1}`}
                                        placeholder="Minutes"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        autoComplete="off"
                                        maxLength={String(SERVICE_DURATION_MAX).length}
                                      />
                                    </Field>
                                  )}
                                </form.Field>
                                <form.Field name={`services[${index}].priceAmount`}>
                                  {(field) => (
                                    <Field className="w-32 shrink-0">
                                      <FieldLabel htmlFor={field.name}>Price</FieldLabel>
                                      <InputGroup>
                                        <InputGroupInput
                                          id={field.name}
                                          name={field.name}
                                          value={field.state.value}
                                          onBlur={field.handleBlur}
                                          onChange={(event) =>
                                            field.handleChange(event.target.value)
                                          }
                                          aria-invalid={
                                            field.state.meta.isTouched && !field.state.meta.isValid
                                          }
                                          aria-label={`Price in ${form.getFieldValue("currency")}, service ${index + 1}`}
                                          placeholder="Price"
                                          inputMode="numeric"
                                          pattern="[0-9]*"
                                          autoComplete="off"
                                          maxLength={PRICE_AMOUNT_MAX_LENGTH}
                                        />
                                        <InputGroupAddon align="inline-end">
                                          <InputGroupText>
                                            {form.getFieldValue("currency")}
                                          </InputGroupText>
                                        </InputGroupAddon>
                                      </InputGroup>
                                    </Field>
                                  )}
                                </form.Field>
                              </div>
                              {/* Ошибки узких полей — под строкой: в самих полях они не поместятся */}
                              <form.Subscribe
                                selector={(state) =>
                                  (["durationMinutes", "priceAmount"] as const)
                                    .map((key) => state.fieldMeta[`services[${index}].${key}`])
                                    .flatMap((meta) =>
                                      meta?.isTouched && !meta.isValid ? meta.errors : [],
                                    )
                                }>
                                {(errors) =>
                                  errors.length > 0 ? (
                                    <FieldError errors={toFieldErrors(errors)} />
                                  ) : null
                                }
                              </form.Subscribe>
                              <form.Field name={`services[${index}].highlighted`}>
                                {(field) => (
                                  <HighlightCheckbox
                                    id={`services-${index}-highlighted`}
                                    label={`Highlight service ${index + 1}`}
                                    checked={field.state.value}
                                    onChange={field.handleChange}
                                  />
                                )}
                              </form.Field>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      {servicesField.state.meta.isTouched && !servicesField.state.meta.isValid ? (
                        <FieldError errors={toFieldErrors(servicesField.state.meta.errors)} />
                      ) : null}
                      {canAdd ? (
                        <Button
                          type="button"
                          variant="outline"
                          className="self-start"
                          onClick={() =>
                            servicesField.pushValue({
                              clientType: clientTypes[0],
                              title: "",
                              description: "",
                              durationMinutes: "",
                              priceAmount: "",
                              highlighted: false,
                            })
                          }>
                          <PlusIcon aria-hidden="true" />
                          Add service
                        </Button>
                      ) : null}
                    </FieldSet>
                  );
                }}
              </form.Subscribe>
            )}
          </form.Field>
        );
      case "documents":
        return documentsBlock;
    }
  };

  // В конструкторе у каждого блока — галочка выделения на странице
  const renderEditableBlock = (section: ProfileSection): ReactNode =>
    showSectionOrder ? (
      <div className="flex flex-col gap-4">
        {renderBlock(section)}
        <form.Field name="highlightedSections">
          {(field) => (
            <HighlightCheckbox
              id={`highlight-block-${section}`}
              label="Highlight this block on your page"
              checked={field.state.value.includes(section)}
              onChange={(checked) =>
                field.handleChange(
                  checked
                    ? [...field.state.value, section]
                    : field.state.value.filter((id) => id !== section),
                )
              }
            />
          )}
        </form.Field>
      </div>
    ) : (
      renderBlock(section)
    );

  // Превью встаёт рядом с формой, когда хватает ширины самой формы (container query), иначе
  // открывается кнопкой Preview
  const classes = layoutClasses[layout];
  const columnsClassName = hasPreview ? classes.columns : undefined;
  // Без превью колонка формы — на всю ширину и высоту, но строки полей не растягиваются
  // на весь экран
  const isFormWide = layout === "workspace" && !hasPreview;

  const saveButton = (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button
          type="submit"
          form={formId}
          size="lg"
          disabled={isSubmitting || (isEditMode && !hasChanges)}>
          {isSubmitting ? <Spinner /> : null}
          {isSubmitting ? "Saving…" : submitLabel}
        </Button>
      )}
    </form.Subscribe>
  );
  const status =
    isEditMode && hasChanges ? (
      <p aria-live="polite" className="text-muted-foreground text-sm">
        Unsaved changes
      </p>
    ) : null;

  return (
    <div ref={rootRef} className={classes.root}>
      <div className={isFormWide ? "flex grow flex-col" : columnsClassName}>
        <div
          className={cn(
            classes.formColumn,
            isFormWide && "grow @3xl:*:max-w-4xl",
            isPreviewOpen && "@max-3xl:hidden",
          )}>
          {header}
          <form
            id={formId}
            noValidate
            onFocus={selectBlock}
            onClickCapture={(event) => {
              // Повторное раскрытие — явный выбор блока, даже если фокус уже внутри него.
              if (
                event.target instanceof Element &&
                event.target.closest('[data-block] h2 button[aria-expanded="false"]')
              ) {
                selectBlock(event, true);
              }
            }}
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}>
            <fieldset disabled={isSubmitting} className="contents">
              <FieldGroup>
                {/* Скрытые разделы — `contents`: поля остаются прямыми детьми FieldGroup */}
                {isSectionMounted("profile") ? (
                  <div hidden={isSectionHidden("profile")} className="contents">
                    <form.Subscribe selector={(state) => state.values.displayName}>
                      {(displayName) => (
                        <AvatarField
                          value={avatar}
                          onChange={setAvatar}
                          displayName={displayName}
                          currentAvatarUrl={currentAvatarUrl}
                          accountPhotos={accountPhotos}
                        />
                      )}
                    </form.Subscribe>

                    <form.Field name="displayName">
                      {(field) => {
                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(event) => field.handleChange(event.target.value)}
                              aria-invalid={isInvalid}
                              autoComplete="name"
                              maxLength={DISPLAY_NAME_MAX_LENGTH}
                            />
                            {isInvalid ? (
                              <FieldError errors={toFieldErrors(field.state.meta.errors)} />
                            ) : null}
                          </Field>
                        );
                      }}
                    </form.Field>

                    {showPractice ? (
                      <>
                        <form.Field name="professionalRole">
                          {(field) => {
                            const isInvalid =
                              field.state.meta.isTouched && !field.state.meta.isValid;
                            return (
                              <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>Professional role</FieldLabel>
                                <Input
                                  id={field.name}
                                  name={field.name}
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(event) => field.handleChange(event.target.value)}
                                  aria-invalid={isInvalid}
                                  aria-describedby={`${field.name}-description`}
                                  placeholder="Clinical psychologist"
                                  maxLength={PROFESSIONAL_ROLE_MAX_LENGTH}
                                />
                                <FieldDescription id={`${field.name}-description`}>
                                  Shown under your name, in your own words. Freudin doesn’t verify
                                  qualifications.
                                </FieldDescription>
                                {isInvalid ? (
                                  <FieldError errors={toFieldErrors(field.state.meta.errors)} />
                                ) : null}
                              </Field>
                            );
                          }}
                        </form.Field>

                        <form.Field name="acceptingClients">
                          {(field) => (
                            <Field>
                              <FieldLabel htmlFor={field.name}>New clients</FieldLabel>
                              <Select
                                value={field.state.value || NOT_SELECTED}
                                onValueChange={(next) => {
                                  field.handleChange(
                                    next === NOT_SELECTED ? "" : (next as AcceptingClients),
                                  );
                                  field.handleBlur();
                                }}>
                                <SelectTrigger
                                  id={field.name}
                                  aria-describedby={`${field.name}-description`}
                                  className="w-full sm:w-72">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={NOT_SELECTED}>Don’t show</SelectItem>
                                  {acceptingClientsIds.map((id) => (
                                    <SelectItem key={id} value={id}>
                                      {acceptingClientsLabels[id]}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FieldDescription id={`${field.name}-description`}>
                                Shown under your name. Your page and contact button stay available.
                              </FieldDescription>
                            </Field>
                          )}
                        </form.Field>
                      </>
                    ) : null}
                  </div>
                ) : null}

                {isSectionMounted("account") ? (
                  <div hidden={isSectionHidden("account")} className="contents">
                    <form.Field
                      name="username"
                      validators={{
                        onChangeAsyncDebounceMs: USERNAME_CHECK_DEBOUNCE_MS,
                        onChangeAsync: async ({ value }) => {
                          // Формат проверяет схема формы: сюда доходит только корректный адрес
                          const username = usernameSchema.safeParse(value);
                          if (!username.success || username.data === currentUsername)
                            return undefined;
                          try {
                            const { available } = await queryClient.fetchQuery(
                              usernameQueries.availability(username.data),
                            );
                            return available ? undefined : "This username is already taken";
                          } catch {
                            // Без связи не блокируем форму: занятый адрес всё равно отклонит сервер
                            return undefined;
                          }
                        },
                      }}>
                      {(field) => {
                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                        const username = field.state.value.trim().toLowerCase();
                        const isUsernameChanged = Boolean(
                          currentUsername && username !== currentUsername,
                        );
                        const parsedUsername = usernameSchema.safeParse(field.state.value);
                        const checkedUsername =
                          field.state.meta.isValid &&
                          parsedUsername.success &&
                          parsedUsername.data !== currentUsername
                            ? parsedUsername.data
                            : null;
                        const describedBy = isUsernameChanged
                          ? `${field.name}-description ${field.name}-warning`
                          : `${field.name}-description`;
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(event) => field.handleChange(event.target.value)}
                              aria-invalid={isInvalid}
                              aria-describedby={describedBy}
                              autoComplete="off"
                              autoCapitalize="none"
                              autoCorrect="off"
                              spellCheck={false}
                              maxLength={USERNAME_MAX_LENGTH}
                            />
                            <FieldDescription id={`${field.name}-description`} aria-live="polite">
                              <UsernameHint
                                username={username}
                                isChecking={field.state.meta.isValidating}
                                checkedUsername={checkedUsername}
                              />
                            </FieldDescription>
                            {isUsernameChanged ? (
                              <FieldDescription id={`${field.name}-warning`}>
                                The old link {SITE_HOST}/{currentUsername} will stop working.
                              </FieldDescription>
                            ) : null}
                            {isInvalid ? (
                              <FieldError errors={toFieldErrors(field.state.meta.errors)} />
                            ) : null}
                          </Field>
                        );
                      }}
                    </form.Field>
                  </div>
                ) : null}

                {isSectionMounted("profile") ? (
                  <div hidden={isSectionHidden("profile")} className="contents">
                    {showSectionOrder ? (
                      <form.Field name="pageTheme">
                        {(themeField) => (
                          <form.Field name="cover">
                            {(coverField) => (
                              <form.Field name="linkIcons">
                                {(linkIconsField) => (
                                  <form.Field name="ctaPlacement">
                                    {(ctaField) => (
                                      <form.Subscribe
                                        selector={(state) =>
                                          Boolean(state.values.preferredContact)
                                        }>
                                        {(hasPreferredContact) => (
                                          <AppearanceBlock
                                            theme={themeField.state.value}
                                            onThemeChange={(theme) => {
                                              themeField.handleChange(theme);
                                              themeField.handleBlur();
                                            }}
                                            cover={coverField.state.value}
                                            onCoverChange={(cover) => {
                                              coverField.handleChange(cover);
                                              coverField.handleBlur();
                                            }}
                                            linkIcons={linkIconsField.state.value}
                                            onLinkIconsChange={(linkIcons) => {
                                              linkIconsField.handleChange(linkIcons);
                                              linkIconsField.handleBlur();
                                            }}
                                            ctaPlacement={
                                              hasPreferredContact ? ctaField.state.value : null
                                            }
                                            onChooseMainButton={() =>
                                              revealField("#preferredContact", "contacts")
                                            }
                                            onCtaPlacementChange={(placement) => {
                                              ctaField.handleChange(placement);
                                              ctaField.handleBlur();
                                            }}
                                            collapsed={isCollapsed("appearance")}
                                            onCollapsedChange={
                                              onCollapsedChange
                                                ? (collapsed) =>
                                                    onCollapsedChange("appearance", collapsed)
                                                : undefined
                                            }
                                          />
                                        )}
                                      </form.Subscribe>
                                    )}
                                  </form.Field>
                                )}
                              </form.Field>
                            )}
                          </form.Field>
                        )}
                      </form.Field>
                    ) : null}

                    <form.Field name="sectionOrder">
                      {(field) => (
                        <SortableBlocks
                          order={normalizeSectionOrder(field.state.value).filter(isBlockShown)}
                          onChange={showSectionOrder ? field.handleChange : undefined}
                          renderBlock={renderEditableBlock}
                          collapsedBlocks={collapsedBlocks}
                          onCollapsedChange={showSectionOrder ? onCollapsedChange : undefined}
                          renderSummary={renderSummary}
                        />
                      )}
                    </form.Field>
                  </div>
                ) : null}

                {showPractice && isSectionMounted("search") ? (
                  <div hidden={isSectionHidden("search")} className="contents">
                    <form.Field name="birthDate">
                      {(field) => {
                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>Date of birth</FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              type="date"
                              max={utcDateYearsAgo(MIN_AGE)}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(event) => field.handleChange(event.target.value)}
                              aria-invalid={isInvalid}
                              autoComplete="bday"
                              className="w-auto"
                            />
                            {isInvalid ? (
                              <FieldError errors={toFieldErrors(field.state.meta.errors)} />
                            ) : null}
                          </Field>
                        );
                      }}
                    </form.Field>
                    <form.Field name="gender">
                      {(field) => (
                        <Field>
                          <FieldLabel htmlFor={field.name}>Gender</FieldLabel>
                          <Select
                            value={field.state.value || NOT_SELECTED}
                            onValueChange={(next) => {
                              if (!next) return;
                              field.handleChange(next === NOT_SELECTED ? "" : (next as Gender));
                              field.handleBlur();
                            }}>
                            <SelectTrigger id={field.name} className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={NOT_SELECTED}>Not specified</SelectItem>
                              {genderIds.map((gender) => (
                                <SelectItem key={gender} value={gender}>
                                  {genderLabels[gender]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                      )}
                    </form.Field>
                    <form.Field name="concerns">
                      {(field) => (
                        <form.Subscribe selector={(state) => state.values.clientTypes}>
                          {(clientTypes) => (
                            <ConcernsField
                              value={field.state.value}
                              onChange={field.handleChange}
                              onBlur={field.handleBlur}
                              clientTypes={clientTypes}
                              errors={
                                field.state.meta.isTouched && !field.state.meta.isValid
                                  ? toFieldErrors(field.state.meta.errors)
                                  : []
                              }
                            />
                          )}
                        </form.Subscribe>
                      )}
                    </form.Field>
                  </div>
                ) : null}

                {showContactEmail && isSectionMounted("account") ? (
                  <div hidden={isSectionHidden("account")} className="contents">
                    <form.Field name="contactEmail">
                      {(field) => {
                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>Email (optional)</FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              type="email"
                              inputMode="email"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(event) => field.handleChange(event.target.value)}
                              aria-invalid={isInvalid}
                              aria-describedby={`${field.name}-description`}
                              autoComplete="email"
                              autoCapitalize="none"
                              autoCorrect="off"
                              spellCheck={false}
                              maxLength={CONTACT_EMAIL_MAX_LENGTH}
                            />
                            <FieldDescription id={`${field.name}-description`}>
                              Your sign-in account didn’t share an email address. Add one if you’d
                              like us to be able to contact you about your account. It isn’t shown
                              on your page.
                            </FieldDescription>
                            {isInvalid ? (
                              <FieldError errors={toFieldErrors(field.state.meta.errors)} />
                            ) : null}
                          </Field>
                        );
                      }}
                    </form.Field>
                  </div>
                ) : null}

                {/* Место и валюта — данные практики: в онбординге их нет */}
                {showPractice && isSectionMounted("account") ? (
                  <div hidden={isSectionHidden("account")} className="contents">
                    <FieldGroup>
                      <form.Field name="country">
                        {(field) => {
                          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>Country</FieldLabel>
                              <CountrySelect
                                id={field.name}
                                value={field.state.value}
                                aria-invalid={isInvalid}
                                onChange={(country) => {
                                  // Город выбирается внутри страны: при смене страны он сбрасывается
                                  if (country !== field.state.value)
                                    form.setFieldValue("cityId", null);
                                  field.handleChange(country);
                                  field.handleBlur();
                                }}
                              />
                              {isInvalid ? (
                                <FieldError errors={toFieldErrors(field.state.meta.errors)} />
                              ) : null}
                            </Field>
                          );
                        }}
                      </form.Field>
                      <form.Field name="cityId">
                        {(field) => {
                          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>City</FieldLabel>
                              <form.Subscribe selector={(state) => state.values.country}>
                                {(country) => (
                                  <CitySelect
                                    id={field.name}
                                    country={country}
                                    value={findCity(field.state.value)}
                                    aria-invalid={isInvalid}
                                    aria-describedby={`${field.name}-description`}
                                    onChange={(next) => {
                                      if (next) setPickedCity(next);
                                      field.handleChange(next?.id ?? null);
                                      field.handleBlur();
                                    }}
                                  />
                                )}
                              </form.Subscribe>
                              <FieldDescription id={`${field.name}-description`}>
                                Required for in-person sessions.
                              </FieldDescription>
                              {isInvalid ? (
                                <FieldError errors={toFieldErrors(field.state.meta.errors)} />
                              ) : null}
                            </Field>
                          );
                        }}
                      </form.Field>
                    </FieldGroup>
                    <form.Field name="currency">
                      {(field) => {
                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>Currency</FieldLabel>
                            <CurrencySelect
                              id={field.name}
                              value={field.state.value}
                              aria-invalid={isInvalid}
                              aria-describedby={`${field.name}-description`}
                              onChange={(currency) => {
                                field.handleChange(currency);
                                field.handleBlur();
                              }}
                            />
                            <FieldDescription id={`${field.name}-description`}>
                              For the price per session and service prices on your page.
                            </FieldDescription>
                            {isInvalid ? (
                              <FieldError errors={toFieldErrors(field.state.meta.errors)} />
                            ) : null}
                          </Field>
                        );
                      }}
                    </form.Field>
                  </div>
                ) : null}

                {/* Скрыть страницу можно только в настройках: в онбординге её ещё нет */}
                {isEditMode && isSectionMounted("account") ? (
                  <div hidden={isSectionHidden("account")} className="contents">
                    <form.Field name="visibility">
                      {(field) => {
                        const isHidden = field.state.value !== "public";
                        return (
                          <div className="flex flex-col gap-3">
                            <Field orientation="horizontal">
                              <Checkbox
                                id="hide-page"
                                aria-describedby="hide-page-description"
                                checked={isHidden}
                                onCheckedChange={(checked) => {
                                  field.handleChange(checked === true ? "private" : "public");
                                  field.handleBlur();
                                }}
                              />
                              <FieldLabel htmlFor="hide-page" className="font-normal">
                                Hide my page
                              </FieldLabel>
                            </Field>
                            <FieldDescription id="hide-page-description">
                              This setting takes effect after Save. Hiding your page doesn’t revoke
                              access to photos or documents through previously saved direct image
                              links.
                            </FieldDescription>
                            {isHidden ? (
                              <RadioGroup
                                value={field.state.value}
                                onValueChange={(next) => {
                                  field.handleChange(next as ProfileVisibility);
                                  field.handleBlur();
                                }}
                                aria-label="Who can see your page"
                                className="pl-6">
                                {(["private", "password"] as const).map((value) => (
                                  <Field key={value} orientation="horizontal">
                                    <RadioGroupItem id={`visibility-${value}`} value={value} />
                                    <FieldLabel
                                      htmlFor={`visibility-${value}`}
                                      className="font-normal">
                                      {hiddenVisibilityLabels[value]}
                                    </FieldLabel>
                                  </Field>
                                ))}
                              </RadioGroup>
                            ) : null}
                          </div>
                        );
                      }}
                    </form.Field>
                    {/* Поле смонтировано всегда: ошибку схемы «нужен пароль» форма кладёт в него
                      сразу при выборе режима */}
                    <form.Subscribe selector={(state) => state.values.visibility}>
                      {(visibility) => (
                        <div hidden={visibility !== "password"} className="contents">
                          <form.Field name="pagePassword">
                            {(field) => {
                              const isInvalid =
                                field.state.meta.isTouched && !field.state.meta.isValid;
                              return (
                                <Field data-invalid={isInvalid}>
                                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                                  <InputGroup>
                                    {/* Не type="password": с ним браузер при каждом Save предлагает
                                      сохранить пароль страницы как пароль от аккаунта. Символы
                                      скрывает стиль */}
                                    <InputGroupInput
                                      id={field.name}
                                      name={field.name}
                                      type="text"
                                      className={
                                        isPagePasswordShown
                                          ? undefined
                                          : "[-webkit-text-security:disc]"
                                      }
                                      value={field.state.value}
                                      onBlur={field.handleBlur}
                                      onChange={(event) => field.handleChange(event.target.value)}
                                      aria-invalid={isInvalid}
                                      aria-describedby={`${field.name}-description`}
                                      autoComplete="off"
                                      autoCapitalize="none"
                                      autoCorrect="off"
                                      spellCheck={false}
                                      maxLength={PAGE_PASSWORD_MAX_LENGTH}
                                    />
                                    <InputGroupAddon align="inline-end">
                                      <InputGroupButton
                                        size="icon-xs"
                                        aria-label="Show password"
                                        aria-pressed={isPagePasswordShown}
                                        onClick={() =>
                                          setIsPagePasswordShown(!isPagePasswordShown)
                                        }>
                                        {isPagePasswordShown ? (
                                          <EyeOffIcon aria-hidden="true" />
                                        ) : (
                                          <EyeIcon aria-hidden="true" />
                                        )}
                                      </InputGroupButton>
                                    </InputGroupAddon>
                                  </InputGroup>
                                  <FieldDescription id={`${field.name}-description`}>
                                    4 to 8 characters. Share it with people who should see your
                                    page. It isn’t used to sign in, so don’t reuse a password from
                                    other accounts. A new password or another mode closes access for
                                    everyone who entered the old one. If you switch modes, the
                                    password is kept for later.
                                  </FieldDescription>
                                  {isInvalid ? (
                                    <FieldError errors={toFieldErrors(field.state.meta.errors)} />
                                  ) : null}
                                </Field>
                              );
                            }}
                          </form.Field>
                        </div>
                      )}
                    </form.Subscribe>
                  </div>
                ) : null}

                {section === "account" ? (
                  // Без кнопки Preview: на телефоне она спрятала бы форму вместе с собой
                  <div className="flex flex-wrap items-center gap-3">
                    {saveButton}
                    {status}
                  </div>
                ) : null}
              </FieldGroup>
            </fieldset>
          </form>
          {accountBlock && isSectionMounted("account") ? (
            <div hidden={isSectionHidden("account")}>
              {typeof accountBlock === "function" ? accountBlock(beforeLeave) : accountBlock}
            </div>
          ) : null}
        </div>
        {renderPreview && hasPreview && (isWidePreview || isPreviewOpen) ? (
          <section
            aria-labelledby={`${formId}-preview-title`}
            hidden={!hasPreview}
            className={cn(classes.preview, !isPreviewOpen && "@max-3xl:hidden")}>
            <div className={classes.previewCard}>
              <div className={classes.previewBar}>
                <p id={`${formId}-preview-title`} className="text-muted-foreground text-sm">
                  Preview
                </p>
                {/* На узком экране превью и так шириной с телефон */}
                {layout === "workspace" ? (
                  <fieldset className="hidden gap-1 @3xl:flex">
                    <legend className="sr-only">Preview width</legend>
                    {previewWidths.map(({ id, label, Icon }) => (
                      <Button
                        key={id}
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={label}
                        aria-pressed={previewWidth === id}
                        onClick={() => setPreviewWidth(id)}
                        className="aria-pressed:bg-accent aria-pressed:text-accent-foreground">
                        <Icon aria-hidden="true" />
                      </Button>
                    ))}
                  </fieldset>
                ) : null}
              </div>
              <div
                ref={previewBodyRef}
                className={cn(
                  classes.previewBody,
                  layout === "workspace" && previewWidth === "phone" && "@3xl:bg-muted",
                )}>
                <div
                  className={cn(
                    "flex flex-1 flex-col",
                    layout === "workspace" &&
                      previewWidth === "phone" &&
                      "@3xl:mx-auto @3xl:w-full @3xl:max-w-[390px]",
                  )}>
                  <form.Subscribe selector={(state) => state.values}>
                    {(values) => renderPreview(getPreview(values))}
                  </form.Subscribe>
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </div>

      {/* Панель видна при прокрутке длинной формы. Кнопка — вне <form>: в режиме превью
          на телефоне форма спрятана, а сохранить можно. В Account кнопка стоит под полями */}
      {section === "account" ? null : (
        <div
          data-sticky-actions
          className={cn("pointer-events-none sticky bottom-0 z-10", columnsClassName)}>
          <div className={cn("pointer-events-auto flex flex-wrap items-center gap-3", classes.bar)}>
            {saveButton}
            {hasPreview ? (
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="@3xl:hidden"
                onClick={togglePreview}>
                {isPreviewOpen ? "Edit" : "Preview"}
              </Button>
            ) : null}
            {status}
          </div>
        </div>
      )}

      <AlertDialog
        open={leaveUrl !== null || leaveAction !== null}
        onOpenChange={(open) => {
          if (!open) {
            setLeaveUrl(null);
            setLeaveAction(null);
          }
        }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save your changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes on this page. Save them before you leave, or discard them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <Button
              variant="outline"
              onClick={() =>
                leaveUrl ? discardAndLeave(leaveUrl) : void finishAccountAction(false)
              }>
              Discard changes
            </Button>
            <Button
              onClick={() =>
                leaveUrl ? void saveAndLeave(leaveUrl) : void finishAccountAction(true)
              }>
              Save and continue
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
