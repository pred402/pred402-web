"use client";

/**
 * Agent Manager
 *
 * Creates AI agents on Solana blockchain
 */

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import { Textarea } from "@ui/components/textarea";
import { Spinner } from "@shared/components/Spinner";
import { Badge } from "@ui/components/badge";
import { Plus, ExternalLink, Key } from "lucide-react";
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

type AgentFormState = {
  name: string;
  slug: string;
  description: string;
  avatarUrl: string;
  metadataUri: string;
  agentPrivateKey: string;
};

type AgentData = {
  id: string;
  agentId: number | null;
  agentPda: string | null;
  slug: string;
  name: string;
  description: string | null;
  avatarUrl: string | null;
  authorityPubkey: string;
  metadataUri: string | null;
  configId: number;
  isActive: boolean;
  txSignature: string | null;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  } | null;
};

const defaultFormState: AgentFormState = {
  name: "",
  slug: "",
  description: "",
  avatarUrl: "",
  metadataUri: "",
  agentPrivateKey: "",
};

export function AgentManager() {
  const t = useTranslations();
  const [formState, setFormState] = useState<AgentFormState>(defaultFormState);
  const [isCreating, setIsCreating] = useState(false);
  const [lastCreatedAgent, setLastCreatedAgent] = useState<any>(null);
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);

  // Fetch agents list
  const fetchAgents = async () => {
    try {
      setIsLoadingAgents(true);
      const response = await fetch('/api/admin/agents');
      const result = await response.json();

      if (result.success) {
        setAgents(result.data);
      } else {
        toast.error('获取 Agent 列表失败');
      }
    } catch (error) {
      console.error('Fetch agents error:', error);
      toast.error('获取 Agent 列表失败');
    } finally {
      setIsLoadingAgents(false);
    }
  };

  // Load agents on mount
  useEffect(() => {
    fetchAgents();
  }, []);

  const updateField = (field: keyof AgentFormState, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  // Generate new keypair
  const generateKeypair = () => {
    const keypair = Keypair.generate();
    const privateKey = bs58.encode(keypair.secretKey);
    updateField('agentPrivateKey', privateKey);
    toast.success('已生成新的密钥对');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formState.name || !formState.slug || !formState.agentPrivateKey) {
      toast.error("请填写所有必需字段");
      return;
    }

    setIsCreating(true);

    try {
      // Generate metadata URI if not provided
      const metadataUri = formState.metadataUri ||
        `https://example.com/agent/${formState.slug}`;

      const requestBody = {
        name: formState.name,
        slug: formState.slug,
        description: formState.description,
        avatarUrl: formState.avatarUrl || undefined,
        metadataUri,
        agentPrivateKey: formState.agentPrivateKey,
      };

      const response = await fetch('/api/admin/create-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create agent');
      }

      toast.success('Agent created successfully on Solana!');
      setLastCreatedAgent(result.data);

      // Refresh agents list
      await fetchAgents();

      // Reset form
      setFormState(defaultFormState);

    } catch (error) {
      console.error('Create agent error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create agent');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create AI Agent</CardTitle>
          <p className="text-sm text-muted-foreground">
            Create a new AI prediction agent on Solana blockchain
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Agent Name *</Label>
                <Input
                  id="name"
                  value={formState.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g., GPT-4 Predictor"
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formState.slug}
                  onChange={(e) => updateField('slug', e.target.value)}
                  placeholder="e.g., gpt4-predictor"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  URL-friendly identifier
                </p>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formState.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe the agent's prediction strategy..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="avatarUrl">Avatar URL (optional)</Label>
                <Input
                  id="avatarUrl"
                  type="url"
                  value={formState.avatarUrl}
                  onChange={(e) => updateField('avatarUrl', e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label htmlFor="metadataUri">Metadata URI (optional)</Label>
                <Input
                  id="metadataUri"
                  type="url"
                  value={formState.metadataUri}
                  onChange={(e) => updateField('metadataUri', e.target.value)}
                  placeholder="https://..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Auto-generated if not provided
                </p>
              </div>
            </div>

            {/* Agent Private Key */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="agentPrivateKey">Agent Private Key *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateKeypair}
                >
                  <Key className="h-4 w-4 mr-1" />
                  Generate New
                </Button>
              </div>
              <Textarea
                id="agentPrivateKey"
                value={formState.agentPrivateKey}
                onChange={(e) => updateField('agentPrivateKey', e.target.value)}
                placeholder="Base58 encoded private key"
                rows={3}
                required
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                ⚠️ Store this private key securely! It will be encrypted and stored in the database.
              </p>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isCreating || !formState.name || !formState.slug || !formState.agentPrivateKey}
                className="flex-1"
              >
                {isCreating ? (
                  <>
                    <Spinner className="mr-2" />
                    Creating on Solana...
                  </>
                ) : (
                  'Create Agent on Blockchain'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Success Message */}
      {lastCreatedAgent && (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle className="text-green-600">✅ Agent Created Successfully!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <strong>Agent ID:</strong> {lastCreatedAgent.agentId}
            </div>
            <div>
              <strong>Agent PDA:</strong>
              <code className="ml-2 text-xs bg-muted px-2 py-1 rounded">
                {lastCreatedAgent.agentPDA}
              </code>
            </div>
            <div>
              <strong>Authority:</strong>
              <code className="ml-2 text-xs bg-muted px-2 py-1 rounded">
                {lastCreatedAgent.authorityPubkey}
              </code>
            </div>
            <div>
              <strong>Transaction:</strong>{' '}
              <a
                href={lastCreatedAgent.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View on Explorer
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agents List */}
      <Card>
        <CardHeader>
          <CardTitle>已创建的 Agents</CardTitle>
          <p className="text-sm text-muted-foreground">
            所有在 Solana 区块链上创建的 AI Agents
          </p>
        </CardHeader>
        <CardContent>
          {isLoadingAgents ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : agents.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              暂无 Agent
            </p>
          ) : (
            <div className="space-y-4">
              {agents.map((agent) => (
                <Card key={agent.id} className="border">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{agent.name}</h3>
                          {agent.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {agent.description}
                            </p>
                          )}
                        </div>
                        <Badge status={agent.isActive ? 'success' : 'info'}>
                          {agent.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Agent ID:</span>
                          <span className="ml-2 font-mono">{agent.agentId ?? 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Slug:</span>
                          <span className="ml-2 font-mono">{agent.slug}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Authority:</span>
                          <code className="ml-2 text-xs bg-muted px-2 py-1 rounded">
                            {agent.authorityPubkey}
                          </code>
                        </div>
                        {agent.agentPda && (
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Agent PDA:</span>
                            <code className="ml-2 text-xs bg-muted px-2 py-1 rounded">
                              {agent.agentPda}
                            </code>
                          </div>
                        )}
                      </div>

                      {agent.txSignature && (
                        <div className="flex gap-2 pt-2">
                          <a
                            href={`https://explorer.solana.com/tx/${agent.txSignature}?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          >
                            查看交易 <ExternalLink className="h-3 w-3" />
                          </a>
                          {agent.agentPda && (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <a
                                href={`https://explorer.solana.com/address/${agent.agentPda}?cluster=devnet`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                              >
                                查看 PDA <ExternalLink className="h-3 w-3" />
                              </a>
                            </>
                          )}
                        </div>
                      )}

                      {agent.createdBy && (
                        <div className="text-xs text-muted-foreground pt-2 border-t">
                          创建者: {agent.createdBy.name} ({agent.createdBy.email})
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
