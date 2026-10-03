import { clientTypeLabels, formatPrice, type ProfileService } from "@/entities/profile";
import { cn } from "@/shared/lib/utils";
import { type ContactAction, ContactActionButton } from "./preferred-contact-button";

type ServiceListProps = {
  services: ProfileService[];
  /** Кнопка связи в карточке: тот же способ, что у главной кнопки страницы. */
  contactAction: ContactAction | null;
  isPreview?: boolean;
};

function getServiceMeta(service: ProfileService): string {
  const parts: string[] = [clientTypeLabels[service.clientType]];
  if (service.durationMinutes) parts.push(`${service.durationMinutes} min`);
  if (service.price) parts.push(formatPrice(service.price));
  return parts.join(" · ");
}

/**
 * Карточки услуг для разных категорий «Works with». Freudin не записывает и не принимает
 * оплату: кнопка ведёт к выбранному психологом способу связи.
 */
export function ServiceList({ services, contactAction, isPreview = false }: ServiceListProps) {
  const Title = isPreview ? "p" : "h2";
  const CardTitle = isPreview ? "p" : "h3";
  return (
    <section aria-labelledby="profile-services-title" className="flex w-full flex-col gap-3">
      <Title id="profile-services-title" className="font-heading text-section-title">
        Services
      </Title>
      <ul className="flex flex-col gap-3 text-left">
        {services.map((service, index) => (
          <li
            // Названия могут совпадать у разных категорий
            // biome-ignore lint/suspicious/noArrayIndexKey: список только для чтения
            key={index}
            className={cn(
              "flex flex-col gap-2 rounded-xl border p-4",
              service.highlighted && "border-transparent bg-accent",
            )}>
            <CardTitle className="break-words font-medium">{service.title}</CardTitle>
            <p className="text-muted-foreground text-sm">{getServiceMeta(service)}</p>
            {service.description ? (
              <p className="whitespace-pre-line break-words text-sm">{service.description}</p>
            ) : null}
            {contactAction ? (
              <ContactActionButton
                action={contactAction}
                variant="outline"
                className="max-w-full self-start"
              />
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
