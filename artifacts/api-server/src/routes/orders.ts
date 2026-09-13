import { desc, eq, sql } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  CreateOrderBody,
  CreateOrderResponse,
  ListOrdersResponse,
  UpdateOrderBody,
  UpdateOrderParams,
  UpdateOrderResponse,
} from "@workspace/api-zod";
import { db } from "@workspace/db";
import { ordersTable } from "@workspace/db/schema";
import { requireOwner } from "../middlewares/ownerAuth";

const router: IRouter = Router();

function serializeOrder(order: typeof ordersTable.$inferSelect) {
  return {
    ...order,
    total: Number(order.total),
  };
}

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;
  const [order] = await db
    .insert(ordersTable)
    .values({
      customerName: data.customerName,
      phone: data.phone,
      country: data.country,
      city: data.city,
      items: data.items,
      total: String(data.total),
      status: "pending",
    })
    .returning();

  res.status(201).json(CreateOrderResponse.parse(serializeOrder(order)));
});

router.get("/orders", requireOwner, async (_req, res): Promise<void> => {
  const orders = await db
    .select()
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt));
  res.json(ListOrdersResponse.parse(orders.map(serializeOrder)));
});

router.patch("/orders/:id", requireOwner, async (req, res): Promise<void> => {
  const parsedParams = UpdateOrderParams.safeParse(req.params);
  const parsedBody = UpdateOrderBody.safeParse(req.body);
  if (!parsedParams.success) {
    res.status(400).json({ error: parsedParams.error.message });
    return;
  }
  if (!parsedBody.success) {
    res.status(400).json({ error: parsedBody.error.message });
    return;
  }

  const [order] = await db
    .update(ordersTable)
    .set({ status: parsedBody.data.status })
    .where(eq(ordersTable.id, parsedParams.data.id))
    .returning();

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(UpdateOrderResponse.parse(serializeOrder(order)));
});

export default router;