import { DiagramNode } from "@/components/writing/diagram";
import { EssayFigure } from "@/components/writing/essay";

export function NowPlayingRequestFigure() {
  return (
    <EssayFigure caption="fig. 01 — the reusable secret stays put; only temporary data crosses the boundary">
      <div
        role="img"
        aria-label="The browser polls a Vercel route handler. A short response cache can answer repeated polls. When an access token is needed, the server-held refresh token is exchanged with Spotify for a temporary access token. The route asks Spotify for the current track, caches the small response, and returns it to the footer. The refresh token never reaches the browser."
        className="border-y border-line py-5"
      >
        <div className="grid items-center gap-3 sm:grid-cols-[0.68fr_3.5rem_1.55fr_3.5rem_0.68fr] sm:gap-0">
          <DiagramNode label="browser" detail="footer polls one route" />

          <div className="flex flex-col items-center justify-center gap-1 text-center font-mono text-[9px] uppercase tracking-[0.12em] text-faint">
            <span className="sm:hidden">poll ↓</span>
            <span className="hidden sm:block">poll →</span>
            <span className="hidden h-px w-full bg-line sm:block" />
            <span className="hidden sm:block">← track</span>
          </div>

          <div className="border border-line p-4">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg">
                Vercel server boundary
              </p>
              <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-faint">
                one route
              </span>
            </div>
            <DiagramNode label="/api/now-playing" detail="small read-through proxy" strong />

            <div className="mt-3 grid grid-cols-2 gap-2">
              <DiagramNode label="response cache" detail="shares recent track data" />
              <DiagramNode
                label="refresh token"
                detail="server-held · reusable"
                dashed
              />
            </div>

            <div className="mt-3 border-t border-line pt-2 text-center font-mono text-[9px] uppercase tracking-[0.12em] text-faint">
              temporary access token returns here
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-1 text-center font-mono text-[9px] uppercase tracking-[0.12em] text-faint">
            <span className="sm:hidden">refresh / query ↓</span>
            <span className="hidden sm:block">refresh →</span>
            <span className="hidden h-px w-full bg-line sm:block" />
            <span className="hidden sm:block">← access / track</span>
          </div>

          <DiagramNode label="Spotify" detail="token + currently playing APIs" />
        </div>

        <div className="mt-3 border border-dashed border-faint px-3 py-2 text-center font-mono text-[9px] uppercase tracking-[0.12em] text-faint">
          browser can receive track fields · browser cannot receive the refresh token
        </div>
      </div>
    </EssayFigure>
  );
}
