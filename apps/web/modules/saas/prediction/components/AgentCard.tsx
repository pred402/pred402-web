"use client";

import { Card } from "@ui/components/card";
import { Badge } from "@ui/components/badge";
import { BotIcon } from "lucide-react";

interface Agent {
  id: string;
  agentId: number;
  agentPda: string;
  slug: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  authorityPubkey: string;
  createdAt: string;
}

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {agent.avatarUrl ? (
            <img
              src={agent.avatarUrl}
              alt={agent.name}
              className="size-12 rounded-full object-cover"
            />
          ) : (
            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
              <BotIcon className="size-6 text-primary" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold truncate">{agent.name}</h4>
            <Badge className="text-xs">
              ID: {agent.agentId}
            </Badge>
          </div>

          {agent.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {agent.description}
            </p>
          )}

          <a
            href={`https://explorer.solana.com/address/${agent.agentPda}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
          >
            View on Explorer →
          </a>
        </div>
      </div>
    </Card>
  );
}
