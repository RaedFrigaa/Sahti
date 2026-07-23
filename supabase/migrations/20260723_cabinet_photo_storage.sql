-- Exécutez ce fichier dans Supabase SQL Editor après la première migration.
-- Chaque cabinet ne peut envoyer et supprimer que ses propres photos.

drop policy if exists "cabinets: owner update" on public.cabinets;
create policy "cabinets: owner update"
on public.cabinets for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('cabinet-images', 'cabinet-images', true)
on conflict (id) do update set public = true;

drop policy if exists "cabinet images: public read" on storage.objects;
create policy "cabinet images: public read"
on storage.objects for select using (bucket_id = 'cabinet-images');

drop policy if exists "cabinet images: owner upload" on storage.objects;
create policy "cabinet images: owner upload"
on storage.objects for insert to authenticated
with check (bucket_id = 'cabinet-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "cabinet images: owner update" on storage.objects;
create policy "cabinet images: owner update"
on storage.objects for update to authenticated
using (bucket_id = 'cabinet-images' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'cabinet-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "cabinet images: owner delete" on storage.objects;
create policy "cabinet images: owner delete"
on storage.objects for delete to authenticated
using (bucket_id = 'cabinet-images' and (storage.foldername(name))[1] = auth.uid()::text);
