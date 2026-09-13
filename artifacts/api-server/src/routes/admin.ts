import { count, eq, sql } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { GetAdminSummaryResponse } from "@workspace/api-zod";
import { db } from "@workspace/db";
import { ordersTable, productsTable } from "@workspace/db/schema";
import { requireOwner } from "../middlewares/ownerAuth";

const router: IRouter = Router();

router.get("/admin/summary", requireOwner, async (_req, res): Promise<void> => {
  const [productCount] = await db
    .select({ value: count() })
    .from(productsTable)
    .where(eq(productsTable.active, 1));
  const [lowStockCount] = await db
    .select({ value: count() })
    .from(productsTable)
    .where(sql`${productsTable.stock} <= 3 AND ${productsTable.active} = 1`);
  const [orderCount] = await db.select({ value: count() }).from(ordersTable);
  const [pendingOrderCount] = await db
    .select({ value: count() })
    .from(ordersTable)
    .where(eq(ordersTable.status, "pending"));
  const [revenue] = await db
    .select({ value: sql<string>`coalesce(sum(${ordersTable.total}), 0)` })
    .from(ordersTable)
    .where(sql`${ordersTable.status} <> 'cancelled'`);

  res.json(
    GetAdminSummaryResponse.parse({
      productCount: Number(productCount?.value ?? 0),
      lowStockCount: Number(lowStockCount?.value ?? 0),
      orderCount: Number(orderCount?.value ?? 0),
      pendingOrderCount: Number(pendingOrderCount?.value ?? 0),
      revenue: Number(revenue?.value ?? 0),
    }),
  );
});

export default router;