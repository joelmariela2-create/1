import { desc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  CreateProductBody,
  CreateProductResponse,
  DeleteProductParams,
  ListProductsQueryParams,
  ListProductsResponse,
  UpdateProductBody,
  UpdateProductParams,
  UpdateProductResponse,
} from "@workspace/api-zod";
import { db } from "@workspace/db";
import { productsTable } from "@workspace/db/schema";
import { requireOwner } from "../middlewares/ownerAuth";

const router: IRouter = Router();

function serializeProduct(product: typeof productsTable.$inferSelect) {
  return {
    ...product,
    price: Number(product.price),
    featured: product.featured === 1,
    active: product.active === 1,
  };
}

router.get("/products", async (req, res): Promise<void> => {
  const parsedQuery = ListProductsQueryParams.safeParse(req.query);
  if (!parsedQuery.success) {
    res.status(400).json({ error: parsedQuery.error.message });
    return;
  }

  const products = await db
    .select()
    .from(productsTable)
    .where(
      parsedQuery.data.active === undefined
        ? undefined
        : eq(productsTable.active, parsedQuery.data.active ? 1 : 0),
    )
    .orderBy(desc(productsTable.createdAt));

  res.json(ListProductsResponse.parse(products.map(serializeProduct)));
});

router.post("/products", requireOwner, async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;
  const imageUrls = data.imageUrls ?? (data.imageUrl ? [data.imageUrl] : []);
  const [product] = await db
    .insert(productsTable)
    .values({
      name: data.name,
      price: String(data.price),
      description: data.description ?? null,
      category: data.category,
      imageUrl: data.imageUrl ?? imageUrls[0] ?? null,
      imageUrls,
      sizes: data.sizes,
      stock: data.stock,
      featured: data.featured ? 1 : 0,
      active: data.active === false ? 0 : 1,
    })
    .returning();

  res.status(201).json(CreateProductResponse.parse(serializeProduct(product)));
});

router.patch("/products/:id", requireOwner, async (req, res): Promise<void> => {
  const parsedParams = UpdateProductParams.safeParse(req.params);
  const parsedBody = UpdateProductBody.safeParse(req.body);
  if (!parsedParams.success) {
    res.status(400).json({ error: parsedParams.error.message });
    return;
  }
  if (!parsedBody.success) {
    res.status(400).json({ error: parsedBody.error.message });
    return;
  }

  const data = parsedBody.data;
  const patch: Partial<typeof productsTable.$inferInsert> = {
    ...data,
    price: data.price === undefined ? undefined : String(data.price),
    featured: data.featured === undefined ? undefined : data.featured ? 1 : 0,
    active: data.active === undefined ? undefined : data.active ? 1 : 0,
  };
  delete (patch as Record<string, unknown>).imageUrl;
  if (data.imageUrls !== undefined || data.imageUrl !== undefined) {
    const nextImageUrls =
      data.imageUrls ?? (data.imageUrl ? [data.imageUrl] : []);
    patch.imageUrls = nextImageUrls;
    patch.imageUrl = data.imageUrl ?? nextImageUrls[0] ?? null;
  }

  const [product] = await db
    .update(productsTable)
    .set(patch)
    .where(eq(productsTable.id, parsedParams.data.id))
    .returning();

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(UpdateProductResponse.parse(serializeProduct(product)));
});

router.delete("/products/:id", requireOwner, async (req, res): Promise<void> => {
  const parsedParams = DeleteProductParams.safeParse(req.params);
  if (!parsedParams.success) {
    res.status(400).json({ error: parsedParams.error.message });
    return;
  }

  const [product] = await db
    .delete(productsTable)
    .where(eq(productsTable.id, parsedParams.data.id))
    .returning();
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;