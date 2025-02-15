import { z } from "zod";

export const redirectRequestSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  referer: z.string().optional(),
});

export const redirectResponseSchema = z.object({
  redirectChain: z.array(z.object({
    url: z.string(),
    headers: z.record(z.string()),
    statusCode: z.number()
  })),
  finalUrl: z.string(),
  finalHeaders: z.record(z.string()),
  finalStatusCode: z.number()
});

export type RedirectRequest = z.infer<typeof redirectRequestSchema>;
export type RedirectResponse = z.infer<typeof redirectResponseSchema>;
