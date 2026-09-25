import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  AlertTriangle, ArrowLeft, ArrowUpLeft, Brain, CheckCircle2, CircleAlert, ClipboardCheck, Lightbulb,
  RefreshCw, Sparkles, Target, TrendingUp, WalletCards, XCircle, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DeterministicIntelligenceAssistant } from '@/components/DeterministicIntelligenceAssistant';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { SeverityBadge, PriorityBadge, ConfidenceBadge } from '@/components/ui/Badge';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/States';
import { ForecastChart } from '@/components/ui/Charts';
import {