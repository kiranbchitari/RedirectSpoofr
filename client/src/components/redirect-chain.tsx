import { type RedirectResponse } from "@shared/schema";
import { ExternalLink, ArrowDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RedirectChainProps {
  response: RedirectResponse;
}

export default function RedirectChain({ response }: RedirectChainProps) {
  return (
    <div className="space-y-6">
      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-4">
          {response.redirectChain.map((redirect, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm px-2 py-1 rounded bg-muted">
                      {redirect.statusCode}
                    </span>
                    <a
                      href={redirect.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      {redirect.url}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                  <div className="mt-2">
                    <details className="text-sm">
                      <summary className="cursor-pointer hover:text-primary">
                        Response Headers
                      </summary>
                      <div className="mt-2 font-mono text-xs bg-muted p-3 rounded">
                        {Object.entries(redirect.headers).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-primary">{key}</span>: {value}
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                </div>
              </div>
              {index < response.redirectChain.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowDown className="text-muted-foreground h-6 w-6" />
                </div>
              )}
            </div>
          ))}

          <div className="border-t pt-4">
            <div className="font-semibold mb-2">Final Destination</div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm px-2 py-1 rounded bg-muted">
                {response.finalStatusCode}
              </span>
              <a
                href={response.finalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                {response.finalUrl}
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            <div className="mt-2">
              <details className="text-sm">
                <summary className="cursor-pointer hover:text-primary">
                  Final Response Headers
                </summary>
                <div className="mt-2 font-mono text-xs bg-muted p-3 rounded">
                  {Object.entries(response.finalHeaders).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-primary">{key}</span>: {value}
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
