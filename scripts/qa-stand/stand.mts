// Стенд приёмки для QA-агента: production-сборка с вымышленными данными, без боевой базы.
// Браузер открывает :3100. Запросы к /api/* стенд обрабатывает сам, страницы проксирует
// в `next start` на :3002, а Supabase этого процесса тоже указывает на :3100.
// Пульт: /__qa/control?…, состояние: /__qa/state. Подробности — docs/workflows/qa-subagent.md.
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
} from "node:fs";
import http from "node:http";
import { join } from "node:path";
import type { PrivateProfileDetails, PublicProfile, SavedProfile } from "@/entities/profile";
import type { Viewer } from "@/entities/viewer";
import type { ApiErrorBody } from "@/shared/api";
import type { Tables } from "@/shared/api/index.server";

const STAND_PORT = 3100;
const NEXT_PORT = 3002;
const STAND_URL = `http://localhost:${STAND_PORT}`;
const LOG_DIR = "tmp/qa-stand";
const LOG_FILE = `${LOG_DIR}/requests.jsonl`;

const baseProfile: PublicProfile = {
  username: "qa-anna",
  displayName: "Anna Example",
  professionalRole: "",
  bio: "A fictional psychologist for acceptance checks.",
  avatarUrl: null,
  socialLinks: [
    { platform: "telegram", url: "https://t.me/telegram", title: "", highlighted: false },
    { platform: "website", url: "https://example.com/", title: "Example site", highlighted: true },
  ],
  country: "GE",
  city: null,
  workFormats: ["online"],
  clientTypes: ["individuals", "couples"],
  approaches: ["cbt", "act"],
  languages: ["en", "ru"],
  currency: "USD",
  priceType: "from",
  acceptingClients: null,
  inPersonArea: "",
  price: { amount: 60, currency: "USD" },
  documents: [],
  sectionOrder: [
    "bio",
    "experience",
    "approaches",
    "client-types",
    "work-formats",
    "location",
    "languages",
    "price",
    "services",
    "education",
    "contacts",
    "links",
    "faq",
    "documents",
  ],
  practiceStartedOn: "2016-09-01",
  education: [
    { qualification: "MA in Clinical Psychology", institution: "Sample University", year: 2015 },
  ],
  // Домен example.com зарезервирован: письмо никому не уйдёт
  contacts: { email: "hello@example.com", telegram: "https://t.me/telegram" },
  preferredContact: "telegram",
  faq: [
    {
      question: "What happens in the first session?",
      answer: "We talk about what brings you here and agree on how we’ll work together.",
    },
    { question: "Do you work online?", answer: "Yes. Online sessions take place over video." },
  ],
  services: [
    {
      clientType: "individuals",
      title: "Individual session",
      description: "",
      durationMinutes: 50,
      price: { amount: 60, currency: "USD" },
      highlighted: false,
    },
    {
      clientType: "couples",
      title: "Couples session",
      description: "For partners who want to understand each other better.",
      durationMinutes: 80,
      price: { amount: 90, currency: "USD" },
      highlighted: true,
    },
  ],
  highlightedSections: [],
  cover: "classic",
  pageTheme: "classic",
  linkIcons: true,
  ctaPlacement: "inline",
  visibility: "public",
};

const basePrivateDetails: PrivateProfileDetails = {
  birthDate: null,
  gender: null,
  concerns: [],
  pagePassword: null,
};

type StandState = {
  profile: PublicProfile;
  privateDetails: PrivateProfileDetails;
  /** Версия сохранения настроек: `bumpVersion` имитирует сохранение в другой вкладке. */
  version: number;
  owner: boolean;
  delay: number;
  meError: boolean;
  saveError: boolean;
  documentError: boolean;
  /** Загруженное через UI фото; отдаётся по `/__qa/avatar`. */
  avatar: { type: string; bytes: Buffer } | null;
  /** Токен cookie доступа к странице с паролем после верного пароля. */
  accessToken: string | null;
  requests: StandRequest[];
};

/** Запрос в логе; `blocked` — у стенда нет ответа на этот запрос, и он вернул 403. */
type StandRequest = { method: string; path: string; status?: number; blocked?: true };

let state: StandState;

function reset() {
  state = {
    profile: structuredClone(baseProfile),
    privateDetails: structuredClone(basePrivateDetails),
    version: 1,
    owner: true,
    delay: 0,
    meError: false,
    saveError: false,
    documentError: false,
    avatar: null,
    accessToken: null,
    requests: [],
  };
}

reset();

/** Строка `profiles` в том виде, в каком её отдаёт Supabase серверному рендеру. */
function toRow(profile: PublicProfile) {
  const row = {
    username: profile.username,
    display_name: profile.displayName,
    professional_role: profile.professionalRole,
    bio: profile.bio,
    avatar_path: null,
    social_links: profile.socialLinks,
    country: profile.country,
    work_formats: profile.workFormats,
    client_types: profile.clientTypes,
    approaches: profile.approaches,
    languages: profile.languages,
    price_amount: profile.price?.amount ?? null,
    price_currency: profile.currency,
    documents: [],
    section_order: profile.sectionOrder,
    practice_started_on: profile.practiceStartedOn,
    education: profile.education,
    contacts: profile.contacts,
    preferred_contact: profile.preferredContact,
    faq: profile.faq,
    services: profile.services.map((service) => ({
      ...service,
      price: service.price ? { amount: service.price.amount } : null,
    })),
    highlighted_sections: profile.highlightedSections,
    cover: profile.cover,
    page_theme: profile.pageTheme,
    link_icons: profile.linkIcons,
    cta_placement: profile.ctaPlacement,
    visibility: profile.visibility,
    price_type: profile.priceType,
    accepting_clients: profile.acceptingClients,
    in_person_area: profile.inPersonArea,
  } satisfies Partial<Tables<"profiles">>;
  return { ...row, city: null };
}

function viewer(): Viewer {
  return {
    user: {
      id: "00000000-0000-4000-8000-000000000083",
      email: "anna@example.com",
      contactEmail: null,
      signInMethods: [{ provider: "google", accountLabel: "anna@example.com", avatarUrl: null }],
    },
    profile: state.profile,
    profileVersion: state.version,
    privateDetails: state.privateDetails,
    suggestions: { username: null, displayName: null, avatarUrl: null },
  };
}

function sendJson(res: http.ServerResponse, data: unknown, status = 200) {
  res.writeHead(status, { "content-type": "application/json", "cache-control": "no-store" });
  res.end(JSON.stringify(data));
}

function sendError(res: http.ServerResponse, code: string, message: string, status: number) {
  const body: ApiErrorBody = { error: { code, message } };
  sendJson(res, body, status);
}

async function readBody(req: http.IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks);
}

function handleControl(url: URL, res: http.ServerResponse) {
  const params = url.searchParams;
  if (params.has("reset")) reset();
  if (params.has("owner")) state.owner = params.get("owner") === "true";
  const visibility = params.get("visibility");
  if (visibility === "public" || visibility === "private" || visibility === "password") {
    state.profile.visibility = visibility;
  }
  if (params.has("delay")) state.delay = Number(params.get("delay")) || 0;
  if (params.has("meError")) state.meError = params.get("meError") === "true";
  if (params.has("saveError")) state.saveError = params.get("saveError") === "true";
  if (params.has("documentError")) state.documentError = params.get("documentError") === "true";
  if (params.has("bumpVersion")) state.version += 1;
  if (params.has("password")) state.privateDetails.pagePassword = params.get("password") || null;
  if (params.has("photo")) {
    state.avatar = null;
    // Файл из public/: адрес без /storage/…/avatars/, поэтому Next.js показывает его напрямую
    state.profile.avatarUrl = params.get("photo") === "true" ? "/icon-512.png" : null;
  }
  const { owner, delay, meError, saveError, documentError, version } = state;
  sendJson(res, {
    version,
    owner,
    delay,
    meError,
    saveError,
    documentError,
    visibility: state.profile.visibility,
    password: state.privateDetails.pagePassword !== null,
    photo: state.profile.avatarUrl !== null,
  });
}

async function handleApi(req: http.IncomingMessage, url: URL, res: http.ServerResponse) {
  const path = url.pathname;
  const method = req.method ?? "GET";
  const body = await readBody(req);
  const entry: StandRequest = { method, path };
  state.requests.push(entry);
  res.on("finish", () => {
    entry.status = res.statusCode;
    appendFileSync(LOG_FILE, `${JSON.stringify(entry)}\n`);
  });

  // Supabase REST для серверного рендера страницы /<username>
  if (path === "/rest/v1/profiles") {
    const username = url.searchParams.get("username")?.replace(/^eq\./, "");
    const visible = username === state.profile.username && state.profile.visibility === "public";
    return sendJson(res, visible ? [toRow(state.profile)] : []);
  }
  if (path === "/rest/v1/rpc/get_profile_visibility") {
    const { p_username } = JSON.parse(body.toString() || "{}") as { p_username?: string };
    return sendJson(res, p_username === state.profile.username ? state.profile.visibility : null);
  }
  if (path === "/rest/v1/rpc/get_unlocked_profile") {
    const { p_username, p_token } = JSON.parse(body.toString() || "{}") as {
      p_username?: string;
      p_token?: string;
    };
    const unlocked =
      p_username === state.profile.username &&
      state.profile.visibility === "password" &&
      state.accessToken !== null &&
      p_token === state.accessToken;
    return sendJson(res, unlocked ? [toRow(state.profile)] : []);
  }

  // Наш API для браузера
  if (path === "/api/me") {
    if (state.delay) await new Promise((resolve) => setTimeout(resolve, state.delay));
    if (state.meError) return sendError(res, "internal_error", "Fictional viewer failure", 500);
    if (!state.owner) return sendError(res, "unauthorized", "Sign in required.", 401);
    return sendJson(res, viewer());
  }
  if (path.startsWith("/api/usernames/")) return sendJson(res, { available: true });
  const access = path.match(/^\/api\/profiles\/([^/]+)\/access$/);
  if (access && method === "POST") {
    const { password } = JSON.parse(body.toString() || "{}") as { password?: string };
    const correct =
      access[1].toLowerCase() === state.profile.username &&
      state.profile.visibility === "password" &&
      state.privateDetails.pagePassword !== null &&
      password === state.privateDetails.pagePassword;
    if (!correct) {
      const wrong: ApiErrorBody = {
        error: {
          code: "validation_error",
          message: "Wrong password.",
          fields: { password: "Wrong password" },
        },
      };
      return sendJson(res, wrong, 400);
    }
    // Как setPageAccessCookie: своя httpOnly-cookie у каждой страницы
    state.accessToken = randomUUID();
    const cookie = `freudin-page-access-${state.profile.username}=${state.accessToken}`;
    res.writeHead(204, { "set-cookie": `${cookie}; Path=/; HttpOnly; SameSite=Lax` });
    return res.end();
  }
  if (path.startsWith("/api/profiles/")) {
    const visible =
      path.split("/")[3] === state.profile.username && state.profile.visibility === "public";
    if (!visible) return sendError(res, "not_found", "Page unavailable.", 404);
    return sendJson(res, state.profile);
  }
  if (path === "/api/profile" && method === "PATCH") {
    if (state.saveError) {
      return sendError(res, "internal_error", "Fictional save failure. Please try again.", 500);
    }
    const { expectedVersion, ...changes } = JSON.parse(body.toString()) as Record<string, unknown>;
    if (expectedVersion !== state.version) {
      return sendError(res, "version_conflict", "Fictional save in another tab.", 409);
    }
    const details = state.privateDetails as Record<string, unknown>;
    const profile = state.profile as Record<string, unknown>;
    for (const [key, value] of Object.entries(changes)) {
      if (key in details) details[key] = value;
      else if (key in profile) {
        profile[key] = key === "username" ? String(value).trim().toLowerCase() : value;
      }
    }
    state.version += 1;
    return sendJson(res, {
      profile: state.profile,
      contactEmail: null,
      privateDetails: state.privateDetails,
      version: state.version,
    } satisfies SavedProfile);
  }
  if (path === "/api/profile/avatar" && method === "POST") {
    if (req.headers["content-type"]?.startsWith("multipart/form-data")) {
      const form = await new Request("http://localhost", {
        method: "POST",
        headers: { "content-type": req.headers["content-type"] },
        body,
      }).formData();
      const file = form.get("file");
      if (!(file instanceof Blob)) {
        return sendError(res, "validation_error", "Fictional photo is missing.", 400);
      }
      state.avatar = {
        type: file.type || "image/jpeg",
        bytes: Buffer.from(await file.arrayBuffer()),
      };
      state.profile.avatarUrl = `/__qa/avatar?v=${Date.now()}`;
    } else {
      // Фото из аккаунта провайдера
      state.avatar = null;
      state.profile.avatarUrl = "/icon-512.png";
    }
    return sendJson(res, state.profile);
  }
  if (path === "/api/profile/avatar" && method === "DELETE") {
    state.avatar = null;
    state.profile.avatarUrl = null;
    return sendJson(res, state.profile);
  }
  if (path === "/api/profile/documents" && method === "POST") {
    if (state.documentError) {
      return sendError(res, "internal_error", "Fictional document upload failure.", 500);
    }
    const form = await new Request("http://localhost", {
      method: "POST",
      headers: { "content-type": req.headers["content-type"] ?? "" },
      body,
    }).formData();
    state.profile.documents.push({
      id: "00000000-0000-4000-8000-000000000082",
      title: String(form.get("title")),
      url: "/demo-certificate.svg",
      thumbnailUrl: "/demo-certificate.svg",
      width: 1400,
      height: 1000,
    });
    return sendJson(res, state.profile);
  }
  if (path.startsWith("/api/profile/documents/") && method === "DELETE") {
    if (state.documentError) {
      return sendError(res, "internal_error", "Fictional document deletion failure.", 500);
    }
    state.profile.documents = [];
    return sendJson(res, state.profile);
  }
  if (path === "/api/auth/sign-out") {
    state.owner = false;
    return sendJson(res, {});
  }
  if (path === "/api/auth/identities") return sendJson(res, { url: `${STAND_URL}/__qa/provider` });

  // Ни один неизвестный запрос к API, Supabase или входу не уходит дальше стенда
  entry.blocked = true;
  console.warn(`QA stand: no response for ${method} ${path}, blocked with 403`);
  return sendError(res, "forbidden", "Blocked by the QA stand.", 403);
}

function proxyToNext(req: http.IncomingMessage, res: http.ServerResponse) {
  const upstream = http.request(
    {
      hostname: "127.0.0.1",
      port: NEXT_PORT,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: `localhost:${STAND_PORT}` },
    },
    (response) => {
      res.writeHead(response.statusCode ?? 502, response.headers);
      response.pipe(res);
    },
  );
  upstream.on("error", (error) => sendError(res, "bad_gateway", error.message, 502));
  req.pipe(upstream);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", STAND_URL);
    const path = url.pathname;
    if (path === "/__qa/control") return handleControl(url, res);
    if (path === "/__qa/state") {
      const { avatar, ...rest } = state;
      return sendJson(res, { ...rest, avatar: avatar !== null });
    }
    if (path === "/__qa/avatar") {
      if (!state.avatar) return sendError(res, "not_found", "No fictional photo.", 404);
      res.writeHead(200, { "content-type": state.avatar.type, "cache-control": "no-store" });
      return res.end(state.avatar.bytes);
    }
    if (path === "/__qa/provider") {
      res.writeHead(200, { "content-type": "text/html" });
      return res.end("<h1>Fictional sign-in provider</h1>");
    }
    if (path.startsWith("/api/") || path.startsWith("/rest/") || path.startsWith("/auth/")) {
      return await handleApi(req, url, res);
    }
    proxyToNext(req, res);
  } catch (error) {
    sendError(res, "internal_error", error instanceof Error ? error.message : "Stand error", 500);
  }
});

/** Время последнего изменения среди файлов каталога. */
function newestMtime(dir: string): number {
  return readdirSync(dir, { withFileTypes: true }).reduce((newest, entry) => {
    const path = join(dir, entry.name);
    const mtime = entry.isDirectory() ? newestMtime(path) : statSync(path).mtimeMs;
    return Math.max(newest, mtime);
  }, 0);
}

/**
 * Окружение для `next start`: вымышленные ключи и пустые значения всех остальных переменных
 * из `.env`. Next.js не перезаписывает уже заданные переменные, поэтому настоящие секреты
 * в процесс не попадают. Из `.env` читаются только имена.
 */
function standEnv(): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env, NODE_ENV: "production" };
  const envFile = existsSync(".env") ? readFileSync(".env", "utf8") : "";
  for (const [, name] of envFile.matchAll(/^\s*(?:export\s+)?([A-Za-z_][\w.]*)\s*=/gm)) {
    env[name] = "";
  }
  return {
    ...env,
    SUPABASE_URL: `http://127.0.0.1:${STAND_PORT}`,
    SUPABASE_PUBLISHABLE_KEY: "qa-stand-publishable",
    SUPABASE_SECRET_KEY: "qa-stand-secret",
    GOOGLE_CLIENT_ID: "qa-stand",
    GOOGLE_CLIENT_SECRET: "qa-stand",
    TELEGRAM_CLIENT_ID: "qa-stand",
    TELEGRAM_CLIENT_SECRET: "qa-stand",
  };
}

if (!existsSync(".next/BUILD_ID") || newestMtime("src") > statSync(".next/BUILD_ID").mtimeMs) {
  console.error("The production build is missing or older than src/. Run `npm run build` first.");
  process.exit(1);
}

mkdirSync(LOG_DIR, { recursive: true });
const next = spawn("node_modules/.bin/next", ["start", "-p", String(NEXT_PORT)], {
  env: standEnv(),
  stdio: "inherit",
});
next.on("exit", (code) => {
  server.close();
  process.exit(code ?? 1);
});
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => next.kill(signal));
}

server.listen(STAND_PORT, "127.0.0.1", () => {
  console.log(`QA stand: ${STAND_URL} → next start :${NEXT_PORT}. Requests: ${LOG_FILE}`);
});
