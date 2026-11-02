import { supabase } from "./supabase";
import type { Category, MenuItem, OrderDetail } from "./types";
import { fotoMenu } from "./menuImages";

export async function fetchMenu(): Promise<{ categories: Category[]; items: MenuItem[] }> {
  const [cats, items] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("menu_items").select("*").order("sort_order"),
  ]);
  if (cats.error) throw cats.error;
  if (items.error) throw items.error;
  return {
    categories: cats.data as Category[],
    items: (items.data as MenuItem[]).map((m) => ({ ...m, image_url: fotoMenu(m.name, m.image_url) })),
  };
}

export async function placeOrder(input: {
  name: string;
  phone: string;
  note: string;
  items: { id: string; qty: number }[];
}): Promise<string> {
  const { data, error } = await supabase.rpc("place_order", {
    p_customer_name: input.name,
    p_phone: input.phone,
    p_note: input.note,
    p_items: input.items,
  });
  if (error) throw new Error(error.message);
  return data as string;
}

export async function getOrder(id: string): Promise<OrderDetail | null> {
  const { data, error } = await supabase.rpc("get_order", { p_id: id });
  if (error) throw new Error(error.message);
  return (data as OrderDetail) ?? null;
}
