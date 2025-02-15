import type { Express } from "express";
import { createServer } from "http";
import axios from "axios";
import { redirectRequestSchema, type RedirectResponse } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express) {
  app.post("/api/analyze", async (req, res) => {
    try {
      const { url, referer } = redirectRequestSchema.parse(req.body);

      const redirectChain: RedirectResponse["redirectChain"] = [];
      let currentUrl = url;
      let finalResponse;

      // Initialize headers with our custom ones
      let currentHeaders: Record<string, string> = {
        ...(referer && { Referer: referer }),
        "User-Agent": "Mozilla/5.0 (compatible; RedirectAnalyzer/1.0)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      };

      const axiosInstance = axios.create({
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400
      });

      while (true) {
        try {
          console.log(`Making request to ${currentUrl}`);
          console.log('Current headers:', currentHeaders);

          finalResponse = await axiosInstance.get(currentUrl, { headers: currentHeaders });

          // Store the successful response
          redirectChain.push({
            url: currentUrl,
            headers: finalResponse.headers as Record<string, string>,
            statusCode: finalResponse.status
          });

          break; // No redirect, we're done
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            const resp = error.response;

            // Check if this is a redirect
            if (resp.status >= 300 && resp.status < 400 && resp.headers.location) {
              redirectChain.push({
                url: currentUrl,
                headers: resp.headers as Record<string, string>,
                statusCode: resp.status
              });

              // Clone response headers for the next request while preserving our custom headers
              currentHeaders = {
                ...currentHeaders, // Keep our custom headers
                ...Object.fromEntries(
                  Object.entries(resp.headers as Record<string, string>)
                    .filter(([key]) => {
                      // Exclude headers we don't want to forward
                      const excludedHeaders = [
                        'content-length',
                        'host',
                        'connection',
                        'content-encoding',
                        'transfer-encoding'
                      ];
                      return !excludedHeaders.includes(key.toLowerCase());
                    })
                ),
                Referer: referer || currentUrl, // Keep our custom referer or use current URL
              };

              // Update URL for next iteration
              currentUrl = new URL(resp.headers.location, currentUrl).href;
              console.log(`Following redirect to: ${currentUrl}`);
              console.log('Updated headers:', currentHeaders);
            } else {
              throw error;
            }
          } else {
            throw error;
          }
        }
      }

      const response: RedirectResponse = {
        redirectChain,
        finalUrl: currentUrl,
        finalHeaders: finalResponse.headers as Record<string, string>,
        finalStatusCode: finalResponse.status
      };

      res.json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else if (axios.isAxiosError(error)) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "An unexpected error occurred" });
      }
    }
  });

  return createServer(app);
}