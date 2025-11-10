"use client";

import { Card } from "@ui/components/card";
import { Badge } from "@ui/components/badge";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface ThemeOption {
  optionIndex: number;
  label: string;
  labelUri: string;
  optionStatePda: string;
  optionVaultPda: string;
  optionVaultAuthorityPda: string;
}

interface Theme {
  id: string;
  themeId: number;
  themePda: string;
  title: string;
  description?: string;
  metadataUri: string;
  endTime: string;
  resolutionTime: string;
  totalOptions: number;
  status: string;
  txSignature: string;
  createdAt: string;
  options: ThemeOption[];
}

interface ThemeCardProps {
  theme: Theme;
}

function formatTimeRemaining(targetDate: Date): string {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();

  if (diff <= 0) {
    return "已结束";
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}天 ${hours}小时`;
  } else if (hours > 0) {
    return `${hours}小时 ${minutes}分钟`;
  } else {
    return `${minutes}分钟`;
  }
}

export function ThemeCard({ theme }: ThemeCardProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const updateTimer = () => {
      setTimeRemaining(formatTimeRemaining(new Date(theme.endTime)));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [theme.endTime]);

  if (!mounted) {
    return null; // Avoid hydration mismatch
  }

  const endTime = new Date(theme.endTime);
  const resolutionTime = new Date(theme.resolutionTime);

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">{theme.title}</h3>
            {theme.description && (
              <p className="text-sm text-muted-foreground">{theme.description}</p>
            )}
          </div>
          <Badge>
            {theme.status}
          </Badge>
        </div>

        {/* Time Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <ClockIcon className="size-4 mt-0.5 text-muted-foreground" />
            <div>
              <div className="font-medium">投注截止</div>
              <div className="text-muted-foreground">
                {endTime.toLocaleString('zh-CN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
              <div className="text-xs text-primary font-medium mt-1">
                剩余: {timeRemaining}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <CalendarIcon className="size-4 mt-0.5 text-muted-foreground" />
            <div>
              <div className="font-medium">结算时间</div>
              <div className="text-muted-foreground">
                {resolutionTime.toLocaleString('zh-CN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Options */}
        <div>
          <div className="text-sm font-medium mb-2">预测选项 ({theme.totalOptions})</div>
          <div className="space-y-2">
            {theme.options.map((option) => (
              <div
                key={option.optionIndex}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
              >
                <span className="text-sm font-medium">{option.label}</span>
                <Badge>选项 {option.optionIndex}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Theme ID and Explorer Link */}
        <div className="pt-2 border-t text-xs text-muted-foreground flex items-center justify-between">
          <span>Theme ID: {theme.themeId}</span>
          <a
            href={`https://explorer.solana.com/address/${theme.themePda}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            View on Explorer →
          </a>
        </div>
      </div>
    </Card>
  );
}
