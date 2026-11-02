-- Pasang foto menu. Jalankan SATU KALI di Supabase > SQL Editor.
-- Foto disimpan di folder public/menu pada project (tidak perlu upload ke Storage).

update public.menu_items set image_url = '/menu/binte-biluhuta.webp' where name = 'Binte Biluhuta (Milu Siram)';
update public.menu_items set image_url = '/menu/nasi-ayam-iloni.webp' where name = 'Nasi Ayam Iloni + Sayur';
update public.menu_items set image_url = '/menu/nasi-tabu-moitomo.webp' where name = 'Nasi Tabu Moitomo';
update public.menu_items set image_url = '/menu/nasi-sate-tuna.webp' where name = 'Nasi Sate Tuna Gorontalo';
update public.menu_items set image_url = '/menu/nasi-bilenthango.webp' where name = 'Nasi Bilenthango + Sayur';
update public.menu_items set image_url = '/menu/payanga-bumbu-kuning.webp' where name = 'Payanga Bumbu Kuning';
update public.menu_items set image_url = '/menu/ilepao.webp' where name = 'Ilepao (Sagu Isian Ikan/Jeroan)';
update public.menu_items set image_url = '/menu/ike-moitomo.webp' where name = 'Ike Moitomo';
update public.menu_items set image_url = '/menu/perkedel-milu.webp' where name = 'Perkedel Milu (Perkedel Jagung)';
update public.menu_items set image_url = '/menu/sambal-sagela.webp' where name = 'Sambal Sagela / Pomaia';
update public.menu_items set image_url = '/menu/es-brenebon-cokelat.webp' where name = 'Es Brenebon Cokelat';
update public.menu_items set image_url = '/menu/es-oji.webp' where name = 'Es Oji (Kelapa Muda Jeruk Nipis)';
update public.menu_items set image_url = '/menu/kopi-pinogu.webp' where name = 'Kopi Pinogu Otentik';
update public.menu_items set image_url = '/menu/es-kelapa-gula-merah.webp' where name = 'Es Kelapa Gula Merah';
update public.menu_items set image_url = '/menu/saraba.webp' where name = 'Saraba Rempah Gorontalo';
update public.menu_items set image_url = '/menu/teh-manis.webp' where name = 'Teh Manis';
update public.menu_items set image_url = '/menu/teh-susu.webp' where name = 'Teh Susu';
update public.menu_items set image_url = '/menu/air-mineral.webp' where name = 'Air Mineral';
update public.menu_items set image_url = '/menu/popaco.webp' where name = 'Popaco';
update public.menu_items set image_url = '/menu/cucur-gorontalo.webp' where name = 'Cucur Gorontalo';
update public.menu_items set image_url = '/menu/sabongi.webp' where name = 'Sabongi';
update public.menu_items set image_url = '/menu/cara-isi.webp' where name = 'Cara Isi';
update public.menu_items set image_url = '/menu/kue-tobuu.webp' where name = 'Kue Tobu''u';
update public.menu_items set image_url = '/menu/kue-tolu.webp' where name = 'Kue Tolu';
update public.menu_items set image_url = '/menu/kue-pinuku.webp' where name = 'Kue Pinuku';
update public.menu_items set image_url = '/menu/kue-kolombengi.webp' where name = 'Kue Kolombengi';

-- Cek: harus 26 baris terisi (Teh Manis & Teh Susu terpisah)
select count(*) as terisi from public.menu_items where image_url is not null;
