-- =====================================================================
-- Rumah Makan Hulonthalo - Skema Database
-- Jalankan SELURUH file ini di Supabase Dashboard > SQL Editor > New query
-- =====================================================================

-- 1. TABEL --------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  sort_order  int  not null default 0
);

create table if not exists public.menu_items (
  id            uuid primary key default gen_random_uuid(),
  category_id   uuid not null references public.categories(id) on delete restrict,
  name          text not null,
  description   text,
  price         int  not null check (price >= 0),   -- rupiah, tanpa desimal
  image_url     text,
  is_available  boolean not null default true,
  sort_order    int  not null default 0,
  created_at    timestamptz not null default now()
);
create index if not exists menu_items_category_idx on public.menu_items(category_id);

create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  customer_name  text not null,
  phone          text not null,
  note           text,
  status         text not null default 'baru'
                 check (status in ('baru','diproses','siap','selesai','dibatalkan')),
  total          int  not null default 0,
  created_at     timestamptz not null default now()
);
create index if not exists orders_created_idx on public.orders(created_at desc);

create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  menu_item_id  uuid references public.menu_items(id) on delete set null,
  name          text not null,          -- snapshot nama saat dipesan
  price         int  not null,          -- snapshot harga saat dipesan
  qty           int  not null check (qty > 0)
);
create index if not exists order_items_order_idx on public.order_items(order_id);

-- Daftar admin (user Supabase Auth yang boleh mengelola pesanan & menu)
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- 2. FUNGSI BANTU -------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$ select exists (select 1 from public.admins where user_id = auth.uid()); $$;

-- 3. ROW LEVEL SECURITY -------------------------------------------------
alter table public.categories  enable row level security;
alter table public.menu_items  enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;
alter table public.admins      enable row level security;  -- tanpa policy = tertutup

-- Menu & kategori: publik boleh membaca, hanya admin yang boleh mengubah
create policy "categories_read_all"  on public.categories for select to anon, authenticated using (true);
create policy "categories_admin_all" on public.categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "menu_read_all"  on public.menu_items for select to anon, authenticated using (true);
create policy "menu_admin_all" on public.menu_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Pesanan: pelanggan TIDAK bisa select/insert langsung (lewat fungsi di bawah).
-- Admin boleh melihat & mengubah status.
create policy "orders_admin_select" on public.orders for select to authenticated using (public.is_admin());
create policy "orders_admin_update" on public.orders for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "order_items_admin_select" on public.order_items for select to authenticated using (public.is_admin());

-- 4. FUNGSI PEMESANAN (harga dihitung di server, bukan dari browser) -----
create or replace function public.place_order(
  p_customer_name text,
  p_phone         text,
  p_note          text,
  p_items         jsonb   -- [{ "id": "<uuid>", "qty": 2 }, ...]
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

  insert into public.orders (customer_name, phone, note)
  values (trim(p_customer_name), trim(p_phone), nullif(trim(coalesce(p_note, '')), ''))
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

-- Pelacakan pesanan: siapa pun yang memegang UUID pesanan bisa melihat statusnya
create or replace function public.get_order(p_id uuid)
returns jsonb
language sql stable security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', o.id, 'status', o.status, 'total', o.total,
    'customer_name', o.customer_name, 'created_at', o.created_at,
    'items', (select coalesce(jsonb_agg(jsonb_build_object('name', i.name, 'price', i.price, 'qty', i.qty)), '[]'::jsonb)
              from public.order_items i where i.order_id = o.id)
  )
  from public.orders o where o.id = p_id;
$$;

revoke all on function public.place_order(text, text, text, jsonb) from public;
revoke all on function public.get_order(uuid) from public;
grant execute on function public.place_order(text, text, text, jsonb) to anon, authenticated;
grant execute on function public.get_order(uuid) to anon, authenticated;

-- 5. REALTIME (dashboard admin menerima pesanan baru secara langsung) ------
alter publication supabase_realtime add table public.orders;

-- 6. STORAGE (foto menu) -------------------------------------------------
insert into storage.buckets (id, name, public) values ('menu-images', 'menu-images', true)
on conflict (id) do nothing;

create policy "menu_images_public_read" on storage.objects for select
  using (bucket_id = 'menu-images');
create policy "menu_images_admin_write" on storage.objects for all to authenticated
  using (bucket_id = 'menu-images' and public.is_admin())
  with check (bucket_id = 'menu-images' and public.is_admin());

-- 7. DATA AWAL (sesuai Design Brief) -------------------------------------
insert into public.categories (name, slug, sort_order) values
  ('Makanan', 'makanan', 1),
  ('Minuman & Es', 'minuman', 2),
  ('Snack & Kue', 'kue', 3)
on conflict (slug) do nothing;

insert into public.menu_items (category_id, name, description, price, sort_order)
select c.id, m.name, m.description, m.price, m.ord
from (values
  ('makanan','Binte Biluhuta (Milu Siram)','Sup jagung khas Gorontalo dengan udang, kelapa parut, dan perasan jeruk nipis.',15000,1),
  ('makanan','Nasi Ayam Iloni + Sayur','Ayam iloni berbumbu rempah, disajikan dengan nasi dan sayur.',18000,2),
  ('makanan','Nasi Tabu Moitomo','Daging sapi berkuah hitam gurih, disajikan dengan nasi.',22000,3),
  ('makanan','Nasi Sate Tuna Gorontalo','Sate tuna dengan bumbu khas, disajikan dengan nasi.',20000,4),
  ('makanan','Nasi Bilenthango + Sayur','Nasi bilenthango dengan sayur.',20000,5),
  ('makanan','Payanga Bumbu Kuning','Hidangan payanga dengan bumbu kuning rempah.',18000,6),
  ('makanan','Ilepao (Sagu Isian Ikan/Jeroan)','Sagu dengan isian ikan atau jeroan.',12000,7),
  ('makanan','Ike Moitomo','Hidangan ike moitomo khas Gorontalo.',20000,8),
  ('makanan','Perkedel Milu (Perkedel Jagung)','Perkedel dari jagung pipil.',5000,9),
  ('makanan','Sambal Sagela / Pomaia','Sambal khas Gorontalo.',5000,10),
  ('minuman','Es Brenebon Cokelat','Es kacang merah dengan cokelat.',12000,1),
  ('minuman','Es Oji (Kelapa Muda Jeruk Nipis)','Kelapa muda segar dengan jeruk nipis.',10000,2),
  ('minuman','Kopi Pinogu Otentik','Kopi dari dataran Pinogu.',8000,3),
  ('minuman','Es Kelapa Gula Merah','Kelapa dengan sirup gula merah.',10000,4),
  ('minuman','Saraba Rempah Gorontalo','Minuman jahe hangat berempah.',8000,5),
  ('minuman','Teh Manis',null,5000,6),
  ('minuman','Teh Susu',null,7000,7),
  ('minuman','Air Mineral',null,5000,8),
  ('kue','Popaco',null,2500,1),
  ('kue','Cucur Gorontalo',null,2500,2),
  ('kue','Sabongi',null,2500,3),
  ('kue','Cara Isi',null,3000,4),
  ('kue','Kue Tobu''u',null,3000,5),
  ('kue','Kue Tolu',null,2500,6),
  ('kue','Kue Pinuku',null,2500,7),
  ('kue','Kue Kolombengi',null,2500,8)
) as m(slug, name, description, price, ord)
join public.categories c on c.slug = m.slug;
