import { cn } from "cn";
import { clientTypeLabels, formatPrice, type ProfileService } from "@/entities/profile";

type ServiceListProps = {
  services: ProfileService[];
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
 * оплату. Своей кнопки связи у карточек нет: она повторяла бы главную кнопку страницы.
 */
export function ServiceList({ services, isPreview = false }: ServiceListProps) {
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
          </li>
        ))}
      </ul>
    </section>
  );
}
