import { z } from "zod";

export const uuidParam = z.object({ id: z.string().uuid() });
export const shopParam = z.object({ shopId: z.string().uuid() });
export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(80).optional()
});

export function offset(page: number, pageSize: number) {
  return (page - 1) * pageSize;
}
