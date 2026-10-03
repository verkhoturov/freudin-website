import type { ProfileDocument } from "@/entities/profile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";

type DocumentGalleryProps = {
  documents: ProfileDocument[];
  /** В превью страницы заголовки не нужны: у превью нет своего места в структуре страницы. */
  isPreview?: boolean;
};

/** Документы психолога: превью с подписью, по нажатию — полное изображение в диалоге. */
export function DocumentGallery({ documents, isPreview = false }: DocumentGalleryProps) {
  if (documents.length === 0) return null;
  const Title = isPreview ? "p" : "h2";

  return (
    <section aria-labelledby="profile-documents-title" className="flex w-full flex-col gap-3">
      <Title id="profile-documents-title" className="font-heading text-section-title">
        Documents
      </Title>
      <ul className="flex flex-wrap justify-center gap-3">
        {documents.map((profileDocument) => (
          <li key={profileDocument.id}>
            <DocumentPreview profileDocument={profileDocument} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function DocumentPreview({ profileDocument }: { profileDocument: ProfileDocument }) {
  const { url, thumbnailUrl, title, width, height } = profileDocument;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex w-32 flex-col gap-2 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          {/* Имя кнопки — alt превью, видимая подпись скрыта от скринридера, чтобы не читать её дважды */}
          {/* biome-ignore lint/performance/noImgElement: файл из Supabase Storage, next/image для него не настроен */}
          <img
            src={thumbnailUrl}
            alt={title}
            width={width}
            height={height}
            loading="lazy"
            className="h-24 w-full rounded-md border bg-muted object-contain"
          />
          <span
            aria-hidden="true"
            className="line-clamp-2 break-words text-muted-foreground text-xs">
            {title}
          </span>
        </button>
      </DialogTrigger>
      {/* Описания нет: всё сказано заголовком и изображением */}
      <DialogContent aria-describedby={undefined} className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="break-words pr-8">{title}</DialogTitle>
        </DialogHeader>
        {/* biome-ignore lint/performance/noImgElement: файл из Supabase Storage, next/image для него не настроен */}
        <img
          src={url}
          alt={title}
          width={width}
          height={height}
          className="max-h-[75vh] w-full rounded-md bg-muted object-contain"
        />
      </DialogContent>
    </Dialog>
  );
}
