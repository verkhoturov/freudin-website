"use client";

import { type DeepKeys, useForm, useStore } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  BIO_MAX_LENGTH,
  DISPLAY_NAME_MAX_LENGTH,
  type ProfileInput,
  profileInputSchema,
  SOCIAL_LINKS_MAX,
  USERNAME_MAX_LENGTH,
  usernameQueries,
  usernameSchema,
} from "@/entities/profile";
import { type SocialPlatform, socialPlatformIds, socialPlatforms } from "@/entities/social-link";
import { ApiError } from "@/shared/api";
import { siteConfig } from "@/shared/config";
import { useUnsavedChangesWarning } from "@/shared/lib/use-unsaved-changes-warning";
import { Button } from "@/shared/ui/button";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { toFieldErrors, toFormFieldName } from "../lib/field-errors";
import type { AvatarValue } from "../model/avatar-value";
import { AvatarField } from "./avatar-field";

const USERNAME_CHECK_DEBOUNCE_MS = 400;
const VALUES_CHANGE_DEBOUNCE_MS = 300;
const SITE_HOST = new URL(siteConfig.url).host;

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
  /** Фото из аккаунта провайдера входа. */
  providerAvatarUrl: string | null;
  /** Текущий адрес владельца: его не проверяем на занятость (настройки). */
  currentUsername?: string;
  submitLabel: string;
  /** Сохранение. `ApiError` с `fields` показывается у полей формы, остальные ошибки — тостом. */
  onSubmit: (values: ProfileInput, avatar: AvatarValue) => Promise<void>;
  /** Вызывается после правок с задержкой: например, для сохранения черновика. */
  onValuesChange?: (values: ProfileInput) => void;
};

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
  providerAvatarUrl,
  currentUsername,
  submitLabel,
  onSubmit,
  onValuesChange,
}: ProfileFormProps) {
  const queryClient = useQueryClient();
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
  const hasChanges = !isFormDefault || avatar !== initialAvatar;
  const isEditMode = mode === "edit";
  useUnsavedChangesWarning(isEditMode && hasChanges);

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}>
      <FieldGroup>
        <form.Subscribe selector={(state) => state.values.displayName}>
          {(displayName) => (
            <AvatarField
              value={avatar}
              onChange={setAvatar}
              displayName={displayName}
              currentAvatarUrl={currentAvatarUrl}
              providerAvatarUrl={providerAvatarUrl}
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
                {isInvalid ? <FieldError errors={toFieldErrors(field.state.meta.errors)} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field
          name="username"
          validators={{
            onChangeAsyncDebounceMs: USERNAME_CHECK_DEBOUNCE_MS,
            onChangeAsync: async ({ value }) => {
              // Формат проверяет схема формы: сюда доходит только корректный адрес
              const username = usernameSchema.safeParse(value);
              if (!username.success || username.data === currentUsername) return undefined;
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
            const isUsernameChanged = Boolean(currentUsername && username !== currentUsername);
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
                {isInvalid ? <FieldError errors={toFieldErrors(field.state.meta.errors)} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="bio">
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Bio</FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={isInvalid}
                  aria-describedby={`${field.name}-counter`}
                  maxLength={BIO_MAX_LENGTH}
                  rows={4}
                />
                <FieldDescription id={`${field.name}-counter`}>
                  {field.state.value.length} / {BIO_MAX_LENGTH}
                </FieldDescription>
                {isInvalid ? <FieldError errors={toFieldErrors(field.state.meta.errors)} /> : null}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="socialLinks" mode="array">
          {(linksField) => (
            <FieldSet>
              <FieldLegend variant="label">Social links</FieldLegend>
              {linksField.state.value.length > 0 ? (
                <ul className="flex flex-col gap-3">
                  {linksField.state.value.map((link, index) => (
                    // Поля массива в TanStack Form привязаны к индексу
                    // biome-ignore lint/suspicious/noArrayIndexKey: ключ совпадает с именем поля
                    <li key={index} className="flex items-start gap-2">
                      <form.Field name={`socialLinks[${index}].platform`}>
                        {(field) => (
                          <Select
                            value={field.state.value}
                            onValueChange={(value) => field.handleChange(value as SocialPlatform)}>
                            <SelectTrigger
                              aria-label={`Platform for link ${index + 1}`}
                              className="w-32 shrink-0">
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
                      <form.Field name={`socialLinks[${index}].url`}>
                        {(field) => {
                          const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                          return (
                            <Field data-invalid={isInvalid} className="min-w-0 flex-1">
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
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove link ${index + 1}`}
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
                    })
                  }>
                  <PlusIcon aria-hidden="true" />
                  Add link
                </Button>
              ) : null}
            </FieldSet>
          )}
        </form.Field>

        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button
              type="submit"
              size="lg"
              className="self-start"
              disabled={isSubmitting || (isEditMode && !hasChanges)}>
              {isSubmitting ? "Saving…" : submitLabel}
            </Button>
          )}
        </form.Subscribe>
      </FieldGroup>
    </form>
  );
}
