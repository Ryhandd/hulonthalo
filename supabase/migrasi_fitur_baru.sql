-- =====================================================================
-- MIGRASI: layanan (dine-in / take-away) + metode pembayaran
-- Jalankan di (aman diulang) Supabase Dashboard > SQL Editor (setelah schema.sql).
-- =====================================================================

-- 1. Kolom baru di tabel orders
alter table public.orders
  add column if not exists order_type     text not null default 'takeaway'
    check (order_type in ('dinein','takeaway')),
  add column if not exists table_no       text,
  add column if not exists payment_method text not null default 'cash'
    check (payment_method in ('qris','bank_bca','bank_mandiri','bank_bni','bank_bri','cash')),
  add column if not exists payment_status text not null default 'belum_bayar'
    check (payment_status in ('belum_bayar','lunas')),
  add column if not exists proof_url      text;

-- 2. Ganti fungsi place_order dengan versi baru (parameter tambahan)
drop function if exists public.place_order(text, text, text, jsonb);

create or replace function public.place_order(
  p_customer_name  text,
  p_phone          text,
  p_note           text,
  p_items          jsonb,
  p_order_type     text default 'takeaway',
  p_table_no       text default null,
  p_payment_method text default 'cash'
)
returns uuid
language plpgsql security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_total    int := 0;
  v_elem     jsonb;
  v_item     public.menu_items%rowtype;
  v_qty      int;
begin
  if coalesce(length(trim(p_customer_name)), 0) < 2 then
    raise exception 'Nama pelanggan wajib diisi';
  end if;
  if coalesce(length(trim(p_phone)), 0) < 8 then
    raise exception 'Nomor WhatsApp tidak valid';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Keranjang kosong';
  end if;
  if p_order_type not in ('dinein','takeaway') then
    raise exception 'Jenis pesanan tidak valid';
  end if;
  if p_order_type = 'dinein' and coalesce(length(trim(p_table_no)), 0) = 0 then
    raise exception 'Nomor meja wajib diisi untuk Dine-in';
  end if;
  if p_payment_method not in ('qris','bank_bca','bank_mandiri','bank_bni','bank_bri','cash') then
    raise exception 'Metode pembayaran tidak valid';
  end if;

  insert into public.orders (customer_name, phone, note, order_type, table_no, payment_method)
  values (
    trim(p_customer_name), trim(p_phone), nullif(trim(coalesce(p_note, '')), ''),
    p_order_type,
    case when p_order_type = 'dinein' then left(trim(p_table_no), 10) else null end,
    p_payment_method
  )
  returning id into v_order_id;

  for v_elem in select * from jsonb_array_elements(p_items) loop
    v_qty := least(greatest((v_elem->>'qty')::int, 1), 50);

    select * into v_item from public.menu_items where id = (v_elem->>'id')::uuid;
    if not found or not v_item.is_available then
      raise exception 'Menu tidak tersedia';
    end if;

    insert into public.order_items (order_id, menu_item_id, name, price, qty)
    values (v_order_id, v_item.id, v_item.name, v_item.price, v_qty);

    v_total := v_total + v_item.price * v_qty;
  end loop;

  update public.orders set total = v_total where id = v_order_id;
  return v_order_id;
end;
$$;

-- 3. get_order: tambahkan info layanan & pembayaran
create or replace function public.get_order(p_id uuid)
returns jsonb
language sql stable security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', o.id, 'status', o.status, 'total', o.total,
    'customer_name', o.customer_name, 'created_at', o.created_at,
    'order_type', o.order_type, 'table_no', o.table_no,
    'payment_method', o.payment_method, 'payment_status', o.payment_status,
    'has_proof', o.proof_url is not null,
    'items', (select coalesce(jsonb_agg(jsonb_build_object('name', i.name, 'price', i.price, 'qty', i.qty)), '[]'::jsonb)
              from public.order_items i where i.order_id = o.id)
  )
  from public.orders o where o.id = p_id;
$$;

-- 4. Lampirkan bukti transfer ke pesanan
create or replace function public.attach_payment_proof(p_id uuid, p_url text)
returns void
language sql security definer
set search_path = public
as $$
  update public.orders set proof_url = p_url
  where id = p_id and payment_status = 'belum_bayar' and payment_method like 'bank_%';
$$;

revoke all on function public.place_order(text, text, text, jsonb, text, text, text) from public;
revoke all on function public.attach_payment_proof(uuid, text) from public;
grant execute on function public.place_order(text, text, text, jsonb, text, text, text) to anon, authenticated;
grant execute on function public.attach_payment_proof(uuid, text) to anon, authenticated;

-- 5. Storage bukti pembayaran (publik baca, siapa pun boleh unggah gambar)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('payment-proofs', 'payment-proofs', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

drop policy if exists "proofs_public_read" on storage.objects;
drop policy if exists "proofs_public_insert" on storage.objects;
create policy "proofs_public_read" on storage.objects for select
  using (bucket_id = 'payment-proofs');
create policy "proofs_public_insert" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'payment-proofs');

-- 6. Muat ulang schema cache API (mengatasi "Could not find the function ... in the schema cache")
notify pgrst, 'reload schema';

-- =====================================================================
-- AKUN PELANGGAN: memakai Supabase Auth bawaan.
-- Dashboard > Authentication > Providers > Email:
--   matikan "Confirm email" agar pendaftaran langsung masuk (opsional).
-- =====================================================================
