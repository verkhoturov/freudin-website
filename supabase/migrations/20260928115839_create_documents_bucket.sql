-- Изображения документов психолога (дипломы, сертификаты). Bucket публичный, как avatars:
-- документы видны на странице пользователя всем, картинки открываются по прямой ссылке.
-- Лимиты совпадают с проверками сервера: до 2 МБ, JPEG, PNG или WebP.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents', 'documents', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']);

-- Пользователь работает только со своей папкой <user_id>/. Файлы не перезаписываются: у каждого
-- документа своё имя, поэтому политики на update нет. select нужен для удаления.
create policy "Документы: чтение своих"
on storage.objects for select
to authenticated
using (
  bucket_id = 'documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Документы: загрузка своих"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Документы: удаление своих"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
