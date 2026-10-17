"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  BarChart3,
  Clock,
  Database,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Timer,
  Users,
  MessageSquare,
  ThumbsUp,
  Flag,
} from 'lucide-react';

interface PerformanceMetrics {
  tables: {
    reviews: number;
    votes: number;
    replies: number;
    reports: number;
  };
  averageReviewsPerCourse: number;
  slowestQueries: Array<{
    query: string;
    calls: number;
    total_time: number;
    mean_time: number;
  }>;
  lastChecked: string;
  queryDuration: number;
}

interface CacheStats {
  totalCacheKeys: number;
  breakdown: Record<string, number>;
  lastUpdated: string;
}

interface HealthCheck {
  status: 'healthy' | 'warning' | 'error';
  checks: Array<{
    name: string;
    status: 'pass' | 'fail' | 'warning';
    duration: number;
    details?: string;
  }>;
  totalDuration: number;
  timestamp: string;
}

interface Recommendation {
  type: 'index' | 'query' | 'cache' | 'maintenance';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  sql?: string;
}

export function ReviewPerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [healthCheck, setHealthCheck] = useState<HealthCheck | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const loadData = async () => {
    setLoading(true);
    try {
      const [metricsRes, cacheRes, healthRes, recommendationsRes] = await Promise.all([
        fetch('/api/admin/reviews/performance/metrics'),
        fetch('/api/admin/reviews/performance/cache-stats'),
        fetch('/api/admin/reviews/performance/health'),
        fetch('/api/admin/reviews/performance/recommendations'),
      ]);

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);
      }

      if (cacheRes.ok) {
        const cacheData = await cacheRes.json();
        setCacheStats(cacheData);
      }

      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setHealthCheck(healthData);
      }

      if (recommendationsRes.ok) {
        const recommendationsData = await recommendationsRes.json();
        setRecommendations(recommendationsData);
      }
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    try {
      const response = await fetch('/api/admin/reviews/performance/clear-cache', {
        method: 'POST',
      });
      if (response.ok) {
        await loadData(); // Reload data after clearing cache
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  useEffect(() => {
    // Fetch after mount; state updates happen in the async callback.
    queueMicrotask(() => {
      void loadData();
    });
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'fail':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Monitor</h2>
          <p className="text-muted-foreground">
            Monitor and optimize review system performance
          </p>
        </div>
        <Button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Health Status */}
          {healthCheck && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(healthCheck.status)}
                  System Health
                </CardTitle>
                <CardDescription>
                  Overall system health and diagnostic checks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {healthCheck.status === 'healthy' && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle>System Healthy</AlertTitle>
                      <AlertDescription>
                        All systems are operating normally. Last checked:{' '}
                        {new Date(healthCheck.timestamp).toLocaleString()}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid gap-4">
                    {healthCheck.checks.map((check, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(check.status)}
                          <div>
                            <div className="font-medium">{check.name}</div>
                            {check.details && (
                              <div className="text-sm text-muted-foreground">
                                {check.details}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Timer className="h-3 w-3" />
                          {check.duration}ms
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          {metrics && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.tables.reviews.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Helpful Votes</CardTitle>
                  <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.tables.votes.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Instructor Replies</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.tables.replies.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reports</CardTitle>
                  <Flag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.tables.reports.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {metrics && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Query Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Query Performance
                  </CardTitle>
                  <CardDescription>Database query metrics and statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Average Reviews per Course</span>
                      <span className="font-medium">
                        {metrics.averageReviewsPerCourse.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Last Query Duration</span>
                      <span className="font-medium">{metrics.queryDuration}ms</span>
                    </div>
                    <Separator />
                    <div>
                      <div className="text-sm font-medium mb-2">Database Performance</div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Query Speed</span>
                          <span className="text-green-600">Good</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Slowest Queries */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Slowest Queries
                  </CardTitle>
                  <CardDescription>Most time-consuming database queries</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {metrics.slowestQueries.length > 0 ? (
                        metrics.slowestQueries.map((query, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline">{query.calls} calls</Badge>
                              <span className="text-sm text-muted-foreground">
                                {query.mean_time.toFixed(2)}ms avg
                              </span>
                            </div>
                            <code className="text-xs bg-muted p-2 rounded block">
                              {query.query.length > 80
                                ? `${query.query.substring(0, 80)}...`
                                : query.query}
                            </code>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted-foreground py-8">
                          No slow queries detected
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="cache" className="space-y-6">
          {cacheStats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Cache Statistics
                </CardTitle>
                <CardDescription>
                  Review system cache usage and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">
                        {cacheStats.totalCacheKeys}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total cache keys
                      </div>
                    </div>
                    <Button onClick={clearCache} variant="outline" size="sm">
                      Clear Cache
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Cache Breakdown</h4>
                    <div className="grid gap-3">
                      {Object.entries(cacheStats.breakdown).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm capitalize">
                            {type.replace(/[_:]/g, ' ').trim()}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{count}</span>
                            <div className="w-24 bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{
                                  width: `${(count / cacheStats.totalCacheKeys) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Last updated: {new Date(cacheStats.lastUpdated).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Optimization Recommendations
              </CardTitle>
              <CardDescription>
                Suggested improvements for better performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant={getPriorityColor(rec.priority)}>
                          {rec.priority}
                        </Badge>
                        <div className="text-sm text-muted-foreground capitalize">
                          {rec.type}
                        </div>
                      </div>
                    </div>
                    <h4 className="font-medium mb-2">{rec.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {rec.description}
                    </p>
                    {rec.sql && (
                      <div className="mt-3">
                        <div className="text-xs font-medium mb-1">SQL Command:</div>
                        <code className="text-xs bg-muted p-2 rounded block whitespace-pre-wrap">
                          {rec.sql}
                        </code>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}