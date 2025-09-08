import { BarChart3, Database, Edit3, Activity, TrendingUp } from 'lucide-react';
import { useCacheStatistics } from '../../hooks/useCache';
import { Badge } from '../ui/Badge';

export const CacheStats = () => {
  const {
    totalProviders,
    totalEntries,
    modifiedEntries,
    modificationRate,
    providersWithModifications,
    averageEntriesPerProvider,
  } = useCacheStatistics();
  
  const stats = [
    {
      label: 'Providers',
      value: totalProviders,
      icon: Database,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      label: 'Total Entries',
      value: totalEntries,
      icon: BarChart3,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      label: 'Modified',
      value: modifiedEntries,
      icon: Edit3,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      badge: modificationRate > 0 ? `${modificationRate.toFixed(1)}%` : undefined,
    },
    {
      label: 'Active Providers',
      value: providersWithModifications,
      icon: Activity,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
  ];
  
  return (
    <div className="p-4 border-b border-border">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-medium text-sm">Cache Statistics</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`p-3 rounded-lg ${stat.bgColor} transition-colors`}
            >
              <div className="flex items-center justify-between mb-1">
                <Icon className={`w-4 h-4 ${stat.color}`} />
                {stat.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {stat.badge}
                  </Badge>
                )}
              </div>
              
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              
              <div className="text-xs text-muted-foreground">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Additional Insights */}
      {totalProviders > 0 && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <div className="text-xs text-muted-foreground space-y-1">
            <div>
              Avg entries per provider: {averageEntriesPerProvider.toFixed(1)}
            </div>
            {modificationRate > 0 && (
              <div>
                {modificationRate < 10 ? '🟢' : modificationRate < 30 ? '🟡' : '🔴'} 
                {' '}Modification rate: {modificationRate.toFixed(1)}%
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};