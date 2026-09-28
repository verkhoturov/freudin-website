"use client";

import { DOCUMENTS_MAX, type ProfileDocument } from "@/entities/profile";
import { AddDocumentDialog } from "./add-document-dialog";
import { DeleteDocumentButton } from "./delete-document-button";

type ProfileDocumentsProps = { documents: ProfileDocument[] };

/**
 * Документы психолога в настройках: список с превью, загрузка и удаление. Изменения
 * сохраняются сразу, без кнопки Save формы профиля. Заголовок даёт блок формы, внутри
 * которого стоит виджет.
 */
export function ProfileDocuments({ documents }: ProfileDocumentsProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        Diplomas and certificates, up to {DOCUMENTS_MAX} images. Everyone who visits your page can
        see them. Uploads and deletions are saved right away.
      </p>
      {documents.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {documents.map((profileDocument) => (
            <li key={profileDocument.id} className="flex items-center gap-3">
              {/* Подпись стоит рядом, поэтому alt пустой: иначе скринридер прочтёт её дважды */}
              {/* biome-ignore lint/performance/noImgElement: файл из Supabase Storage, next/image для него не настроен */}
              <img
                src={profileDocument.thumbnailUrl}
                alt=""
                width={profileDocument.width}
                height={profileDocument.height}
                loading="lazy"
                className="size-16 shrink-0 rounded-md border bg-muted object-contain"
              />
              <span className="min-w-0 flex-1 break-words text-sm">{profileDocument.title}</span>
              <DeleteDocumentButton profileDocument={profileDocument} />
            </li>
          ))}
        </ul>
      ) : null}
      {documents.length < DOCUMENTS_MAX ? <AddDocumentDialog /> : null}
    </div>
  );
}
