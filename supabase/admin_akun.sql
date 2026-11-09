-- =====================================================================
-- AKUN ADMIN: buat baru ATAU reset password. Jalankan di Supabase > SQL Editor.
-- Ubah v_email dan v_password, lalu Run. Aman diulang.
-- Akun langsung aktif (email terkonfirmasi) dan terdaftar di tabel public.admins.
-- =====================================================================
create extension if not exists pgcrypto with schema extensions;

do $$
declare
  v_email    text := 'rayhand@hulonthalo.com';      -- (ubah)
  v_password text := 'hulonthalo2026';      -- (ubah)
  v_id       uuid;
begin
  v_email := lower(trim(v_email));
  select id into v_id from auth.users where email = v_email;

  if v_id is null then
    v_id := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change, email_change_token_new
    ) values (
      '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v_email,
      extensions.crypt(v_password, extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{"name":"Admin"}', now(), now(),
      '', '', '', ''
    );
    insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), v_id, v_id::text, 'email',
            jsonb_build_object('sub', v_id::text, 'email', v_email, 'email_verified', true), now(), now(), now());
  else
    -- reset password + pastikan terkonfirmasi
    update auth.users
       set encrypted_password = extensions.crypt(v_password, extensions.gen_salt('bf')),
           email_confirmed_at = coalesce(email_confirmed_at, now()),
           updated_at = now()
     where id = v_id;
  end if;

  insert into public.admins (user_id) values (v_id) on conflict do nothing;
  raise notice 'Admin siap: % (id %)', v_email, v_id;
end $$;

-- ---------------------------------------------------------------------
-- OPSIONAL
-- Jadikan akun yang SUDAH ADA sebagai admin:
--   insert into public.admins (user_id) select id from auth.users where email = 'email@anda.com' on conflict do nothing;
-- Cabut hak admin:
--   delete from public.admins where user_id = (select id from auth.users where email = 'email@anda.com');
-- Lihat daftar admin:
--   select u.email from public.admins a join auth.users u on u.id = a.user_id;
-- Konfirmasi semua akun lama yang belum terkonfirmasi:
--   update auth.users set email_confirmed_at = now() where email_confirmed_at is null;
-- =====================================================================
