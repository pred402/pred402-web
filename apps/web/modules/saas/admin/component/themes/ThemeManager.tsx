"use client";

/**
 * Theme Manager (Unified Events + Markets)
 *
 * Creates themes with options on Solana blockchain
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
import { Plus, Trash2, ExternalLink } from "lucide-react";

type OptionFormState = {
  label: string;
  labelUri: string;
};

type ThemeFormState = {
  title: string;
  description: string;
  metadataUri: string;
  endTime: string; // 用户投注结束时间 (datetime-local format)
  resolutionTime: string; // 结算时间 (datetime-local format)
  options: OptionFormState[];
};

type ThemeData = {
  id: string;
  themeId: number;
  themePda: string;
  title: string;
  description: string | null;
  metadataUri: string;
  endTime: string;
  resolutionTime: string;
  totalOptions: number;
  status: string;
  txSignature: string;
  createdAt: string;
  options: Array<{
    id: string;
    optionIndex: number;
    label: string;
    labelUri: string;
    optionStatePda: string;
    optionVaultPda: string;
  }>;
  createdBy: {
    id: string;
    name: string;
    email: string;
  } | null;
};

const defaultFormState: ThemeFormState = {
  title: "",
  description: "",
  metadataUri: "",
  endTime: "",
  resolutionTime: "",
  options: [
    { label: "Option A", labelUri: "" },
    { label: "Option B", labelUri: "" },
  ],
};

export function ThemeManager() {
  const t = useTranslations();
  const [formState, setFormState] = useState<ThemeFormState>(defaultFormState);
  const [isCreating, setIsCreating] = useState(false);
  const [lastCreatedTheme, setLastCreatedTheme] = useState<any>(null);
  const [themes, setThemes] = useState<ThemeData[]>([]);
  const [isLoadingThemes, setIsLoadingThemes] = useState(true);

  // Fetch themes list
  const fetchThemes = async () => {
    try {
      setIsLoadingThemes(true);
      const response = await fetch('/api/admin/themes');
      const result = await response.json();

      if (result.success) {
        setThemes(result.data);
      } else {
        toast.error('获取主题列表失败');
      }
    } catch (error) {
      console.error('Fetch themes error:', error);
      toast.error('获取主题列表失败');
    } finally {
      setIsLoadingThemes(false);
    }
  };

  // Load themes on mount
  useEffect(() => {
    fetchThemes();
  }, []);

  const updateField = (field: keyof ThemeFormState, value: any) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const addOption = () => {
    if (formState.options.length >= 10) {
      toast.error("Maximum 10 options allowed");
      return;
    }
    setFormState(prev => ({
      ...prev,
      options: [...prev.options, { label: "", labelUri: "" }],
    }));
  };

  const removeOption = (index: number) => {
    if (formState.options.length <= 2) {
      toast.error("Minimum 2 options required");
      return;
    }
    setFormState(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const updateOption = (index: number, field: keyof OptionFormState, value: string) => {
    setFormState(prev => ({
      ...prev,
      options: prev.options.map((opt, i) =>
        i === index ? { ...opt, [field]: value } : opt
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate dates
    if (!formState.endTime || !formState.resolutionTime) {
      toast.error("请选择投注结束时间和结算时间");
      return;
    }

    setIsCreating(true);

    try {
      // Generate theme ID (timestamp-based)
      const themeId = Math.floor(Date.now() / 1000);

      // Generate metadata URI if not provided
      const metadataUri = formState.metadataUri ||
        `https://example.com/theme/${themeId}`;

      // Generate option URIs if not provided
      const options = formState.options.map((opt, idx) => ({
        label: opt.label || `Option ${String.fromCharCode(65 + idx)}`,
        labelUri: opt.labelUri || `https://example.com/option/${themeId}/${idx}`,
      }));

      // Convert datetime-local string to seconds timestamp
      const endTimeTimestamp = Math.floor(new Date(formState.endTime).getTime() / 1000);
      const resolutionTimeTimestamp = Math.floor(new Date(formState.resolutionTime).getTime() / 1000);

      const requestBody = {
        themeId,
        title: formState.title,
        description: formState.description,
        metadataUri,
        totalOptions: options.length,
        options,
        endTime: endTimeTimestamp,
        resolutionTime: resolutionTimeTimestamp,
      };

      const response = await fetch('/api/admin/create-theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create theme');
      }

      toast.success('Theme created successfully on Solana!');
      setLastCreatedTheme(result.data);

      // Refresh themes list
      await fetchThemes();

      // Reset form
      setFormState(defaultFormState);

    } catch (error) {
      console.error('Create theme error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create theme');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Prediction Theme</CardTitle>
          <p className="text-sm text-muted-foreground">
            Create a new prediction market theme with options on Solana blockchain
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Theme Title *</Label>
                <Input
                  id="title"
                  value={formState.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="e.g., Who will win the 2024 election?"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formState.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe the prediction market..."
                  rows={3}
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

            {/* Time Settings */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="endTime">投注结束时间 *</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formState.endTime}
                  onChange={(e) => updateField('endTime', e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  用户停止投注的时间
                </p>
              </div>

              <div>
                <Label htmlFor="resolutionTime">结算时间 *</Label>
                <Input
                  id="resolutionTime"
                  type="datetime-local"
                  value={formState.resolutionTime}
                  onChange={(e) => updateField('resolutionTime', e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  确定结果并开始结算的时间
                </p>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Options ({formState.options.length})</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  disabled={formState.options.length >= 10}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Option
                </Button>
              </div>

              <div className="space-y-3">
                {formState.options.map((option, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="flex gap-2">
                        <div className="flex-1 space-y-2">
                          <Input
                            placeholder={`Option ${String.fromCharCode(65 + index)} label`}
                            value={option.label}
                            onChange={(e) => updateOption(index, 'label', e.target.value)}
                          />
                          <Input
                            type="url"
                            placeholder="Label URI (optional)"
                            value={option.labelUri}
                            onChange={(e) => updateOption(index, 'labelUri', e.target.value)}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(index)}
                          disabled={formState.options.length <= 2}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isCreating || !formState.title || !formState.endTime || !formState.resolutionTime}
                className="flex-1"
              >
                {isCreating ? (
                  <>
                    <Spinner className="mr-2" />
                    Creating on Solana...
                  </>
                ) : (
                  'Create Theme on Blockchain'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Success Message */}
      {lastCreatedTheme && (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle className="text-green-600">✅ Theme Created Successfully!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <strong>Theme ID:</strong> {lastCreatedTheme.themeId}
            </div>
            <div>
              <strong>Theme PDA:</strong>
              <code className="ml-2 text-xs bg-muted px-2 py-1 rounded">
                {lastCreatedTheme.themePDA}
              </code>
            </div>
            <div>
              <strong>Transaction:</strong>{' '}
              <a
                href={lastCreatedTheme.explorerUrl}
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

      {/* Themes List */}
      <Card>
        <CardHeader>
          <CardTitle>已创建的主题</CardTitle>
          <p className="text-sm text-muted-foreground">
            所有在 Solana 区块链上创建的预测主题
          </p>
        </CardHeader>
        <CardContent>
          {isLoadingThemes ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : themes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              暂无主题
            </p>
          ) : (
            <div className="space-y-4">
              {themes.map((theme) => (
                <Card key={theme.id} className="border">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{theme.title}</h3>
                          {theme.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {theme.description}
                            </p>
                          )}
                        </div>
                        <Badge status={theme.status === 'ACTIVE' ? 'success' : 'info'}>
                          {theme.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Theme ID:</span>
                          <span className="ml-2 font-mono">{theme.themeId}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">选项数:</span>
                          <span className="ml-2">{theme.totalOptions}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">投注结束:</span>
                          <span className="ml-2">
                            {new Date(theme.endTime).toLocaleString('zh-CN')}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">结算时间:</span>
                          <span className="ml-2">
                            {new Date(theme.resolutionTime).toLocaleString('zh-CN')}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <p className="text-xs text-muted-foreground mb-2">选项列表:</p>
                        <div className="flex flex-wrap gap-2">
                          {theme.options.map((option) => (
                            <Badge key={option.id} status="info">
                              {option.optionIndex}: {option.label}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <a
                          href={`https://explorer.solana.com/tx/${theme.txSignature}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                        >
                          查看交易 <ExternalLink className="h-3 w-3" />
                        </a>
                        <span className="text-xs text-muted-foreground">•</span>
                        <a
                          href={`https://explorer.solana.com/address/${theme.themePda}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                        >
                          查看 PDA <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>

                      {theme.createdBy && (
                        <div className="text-xs text-muted-foreground pt-2 border-t">
                          创建者: {theme.createdBy.name} ({theme.createdBy.email})
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
