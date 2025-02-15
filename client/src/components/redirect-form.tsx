import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { redirectRequestSchema, type RedirectRequest, type RedirectResponse } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface RedirectFormProps {
  onResponse: (response: RedirectResponse) => void;
}

export default function RedirectForm({ onResponse }: RedirectFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<RedirectRequest>({
    resolver: zodResolver(redirectRequestSchema),
    defaultValues: {
      url: "",
      referer: ""
    }
  });

  async function onSubmit(data: RedirectRequest) {
    try {
      setLoading(true);
      const res = await apiRequest("POST", "/api/analyze", data);
      const response = await res.json();
      onResponse(response);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze URL",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="referer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom Referer (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://referrer.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze Redirects"
          )}
        </Button>
      </form>
    </Form>
  );
}
