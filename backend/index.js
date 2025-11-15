import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";
import { supabaseAdmin } from "./supabaseClient.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// GET PRODUCTS
app.get("/api/products", async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: "Failed to fetch products" });
  res.json(data);
});

// CREATE CHECKOUT SESSION
app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { items, user } = req.body;

    const ids = items.map((i) => i.productId);
    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .in("id", ids);

    if (error) throw error;

    const lineItems = items.map((item) => {
      const p = products.find((x) => x.id === item.productId);

      return {
        price_data: {
          currency: "thb",
          product_data: { name: p.name },
          unit_amount: p.price * 100,
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `${process.env.FRONTEND_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// CONFIRM ORDER
app.post("/api/confirm-order", async (req, res) => {
  try {
    const { sessionId, items, user } = req.body;

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment not completed" });
    }

    // Fetch products again
    const ids = items.map((i) => i.productId);
    const { data: products } = await supabaseAdmin
      .from("products")
      .select("*")
      .in("id", ids);

    let total = 0;
    items.forEach((item) => {
      const p = products.find((x) => x.id === item.productId);
      total += p.price * item.quantity;
    });

    // Insert order
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: user.id,
        email: user.email,
        full_name: user.fullName,
        address_line1: user.address_line1,
        city: user.city,
        province: user.province,
        postal_code: user.postal_code,
        phone: user.phone,
        total_amount: total,
        status: "paid",
        payment_provider: "stripe",
        payment_session_id: session.id,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const orderId = orderData.id;

    // Insert order items WITH product_name only
    const orderItems = items.map((item) => {
      const p = products.find((x) => x.id === item.productId);
      return {
        order_id: orderId,
        product_id: p.id,
        product_name: p.name, // ← IMPORTANT
        quantity: item.quantity,
        unit_price: p.price,
      };
    });

    const { error: oiError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems);

    if (oiError) throw oiError;

    res.json({ orderId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to confirm order" });
  }
});

app.listen(PORT, () => {
  console.log(`Cho backend listening on http://localhost:${PORT}`);
});
