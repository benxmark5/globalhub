import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const USD_TO_KES = 129.5;

type TicketRow = {
  ticket_number: string;
  order_id: string;
  user_id: string;
  event_id: string;
  tier_id: string;
  section: string;
  row_number: string;
  seat_number: string;
  gate: string;
  qr_data: string;
  barcode_data: string;
  status: string;
};

function generateQrData(ticketNum: string): string {
  return `GH-TKT-${ticketNum}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

async function issueTickets(
  supabase: any,
  order: any,
  tier: any
) {
  const tickets: any[] = [];
  for (let i = 0; i < order.quantity; i++) {
    const ticketSeq = Date.now() + i;
    const ticketNum = `GH-${new Date().getFullYear()}-${String(ticketSeq).slice(-6)}`;
    tickets.push({
      ticket_number: ticketNum,
      order_id: order.id,
      user_id: order.user_id,
      event_id: order.event_id,
      tier_id: order.tier_id,
      section: tier?.section || "General",
      row_number: tier?.is_seated ? `Row ${String.fromCharCode(65 + Math.floor(Math.random() * 20))}` : "GA",
      seat_number: tier?.is_seated ? String(Math.floor(Math.random() * 50) + 1) : "GA",
      gate: `Gate ${Math.floor(Math.random() * 8) + 1}`,
      qr_data: `GH-TKT-${ticketNum}-${Date.now()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`,
      barcode_data: `${order.order_number}-${String(i+1).padStart(3,"0")}`,
      status: "valid",
    });
  }
  await supabase.from("tickets").insert(tickets);
  const { data: tierData } = await supabase.from("ticket_tiers").select("sold_quantity").eq("id", order.tier_id).single();
  if (tierData) {
    await supabase.from("ticket_tiers").update({ sold_quantity: (tierData.sold_quantity || 0) + order.quantity }).eq("id", order.tier_id);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, eventId, tierId, quantity, paymentMethod, buyerName, buyerEmail, buyerPhone, unitPriceUsd } = await req.json();
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
    const totalUsd = unitPriceUsd * quantity;

    if (paymentMethod === "wallet") {
      const { data: wallet } = await supabase.from("wallets").select("*").eq("user_id", userId).single();
      if (!wallet || wallet.available_balance < totalUsd) {
        return Response.json({ error: "Insufficient wallet balance" }, { status: 400 });
      }
      await supabase.from("wallets").update({ available_balance: wallet.available_balance - totalUsd, updated_at: new Date().toISOString() }).eq("user_id", userId);
      const ref = `TKT-WLT-${Date.now()}`;
      await supabase.from("wallet_transactions").insert({ user_id: userId, type: "purchase", amount: totalUsd, currency: "USD", status: "completed", reference: ref, description: `Ticket purchase (${quantity} ticket${quantity > 1 ? "s" : ""})` });
      const { data: order, error } = await supabase.from("ticket_orders").insert({ user_id: userId, event_id: eventId, tier_id: tierId, quantity, unit_price_usd: unitPriceUsd, total_price_usd: totalUsd, payment_method: "wallet", payment_reference: ref, payment_status: "completed", buyer_name: buyerName, buyer_email: buyerEmail, buyer_phone: buyerPhone, status: "confirmed", completed_at: new Date().toISOString() }).select().single();
      if (error) throw error;
      const { data: tierData } = await supabase.from("ticket_tiers").select("*").eq("id", tierId).single();
      await issueTickets(supabase, { ...order, user_id: userId }, tierData || { section: "General", is_seated: false });
      await supabase.from("notifications").insert({ user_id: userId, type: "purchase_success", title: "Tickets Confirmed!", message: `Your ${quantity} ticket${quantity > 1 ? "s" : ""} have been issued.`, metadata: { orderId: order.id, quantity } });
      return Response.json({ success: true, method: "wallet", orderId: order.id });
    }

    const secret = process.env.PAYSTACK_SECRET_KEY!;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
    const amountKES = Math.ceil(totalUsd * USD_TO_KES);
    const reference = `TKT-PS-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const { data: order } = await supabase.from("ticket_orders").insert({ user_id: userId, event_id: eventId, tier_id: tierId, quantity, unit_price_usd: unitPriceUsd, total_price_usd: totalUsd, payment_method: "paystack", payment_reference: reference, payment_status: "pending", buyer_name: buyerName, buyer_email: buyerEmail, buyer_phone: buyerPhone, status: "pending" }).select().single();
    const res = await fetch("https://api.paystack.co/transaction/initialize", { method: "POST", headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" }, body: JSON.stringify({ email: buyerEmail, amount: amountKES * 100, currency: "KES", reference, callback_url: `${appUrl}/my-tickets?verify=${reference}`, metadata: { type: "ticket_purchase", orderId: order?.id, userId, eventId, tierId, quantity, totalUsd, amountKES } }) });
    const data = await res.json();
    if (!data.status) throw new Error(data.message);
    return Response.json({ success: true, method: "paystack", authorizationUrl: data.data.authorization_url, reference, orderId: order?.id });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}




