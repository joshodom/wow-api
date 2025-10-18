import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock, Users, CheckCircle, XCircle, Zap } from 'lucide-react';

interface RefreshStats {
  totalUsers: number;
  totalCharacters: number;
  successfulRefreshes: number;
  failedRefreshes: number;
  lastRefreshTime: string;
  nextRefreshTime: string;
  averageRefreshTimeMs: number;
}

const AutoRefreshComponent: React.FC = () => {
  const [stats, setStats] = useState<RefreshStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [manualRefreshLoading, setManualRefreshLoading] = useState(false);
  const [forceRefreshLoading, setForceRefreshLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRefreshStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/refresh/status');
      if (!response.ok) throw new Error('Failed to fetch refresh status');
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const performManualRefresh = async () => {
    try {
      setManualRefreshLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('/api/refresh/manual', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to perform manual refresh');
      
      const result = await response.json();
      setStats(result.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setManualRefreshLoading(false);
    }
  };

  const performForceRefresh = async () => {
    try {
      setForceRefreshLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('/api/refresh/force', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to perform force refresh');
      
      // Refresh stats after force refresh
      await fetchRefreshStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setForceRefreshLoading(false);
    }
  };

  useEffect(() => {
    fetchRefreshStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchRefreshStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-red-800">
          <XCircle className="h-4 w-4" />
          <span className="font-medium">Error loading refresh status</span>
        </div>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        <button 
          onClick={fetchRefreshStats}
          className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const successRate = stats.totalCharacters > 0 
    ? Math.round((stats.successfulRefreshes / stats.totalCharacters) * 100) 
    : 0;

  const timeUntilNext = new Date(stats.nextRefreshTime).getTime() - Date.now();
  const minutesUntilNext = Math.max(0, Math.floor(timeUntilNext / (1000 * 60)));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 text-blue-500" />
          <span>Auto-Refresh System</span>
        </h3>
        <div className="flex items-center space-x-1 text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Active</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center space-x-2 mb-1">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-900">Users</span>
            </div>
            <div className="text-lg font-bold text-blue-900">{stats.totalUsers}</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
            <div className="flex items-center space-x-2 mb-1">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-purple-900">Characters</span>
            </div>
            <div className="text-lg font-bold text-purple-900">{stats.totalCharacters}</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center space-x-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-green-900">Success Rate</span>
            </div>
            <div className="text-lg font-bold text-green-900">{successRate}%</div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-900">Avg Time</span>
            </div>
            <div className="text-lg font-bold text-orange-900">
              {Math.round(stats.averageRefreshTimeMs / 1000)}s
            </div>
          </div>
        </div>

        {/* Next Refresh Countdown */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-900">Next Refresh</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-blue-900">
                {minutesUntilNext > 0 ? `${minutesUntilNext}m` : 'Soon'}
              </div>
              <div className="text-xs text-blue-600">
                {new Date(stats.nextRefreshTime).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Last Refresh Info */}
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Last Refresh</span>
            </div>
            <div className="text-sm text-gray-600">
              {new Date(stats.lastRefreshTime).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={performManualRefresh}
              disabled={manualRefreshLoading}
              className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                manualRefreshLoading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200'
              }`}
            >
              {manualRefreshLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent" />
                  <span>Refreshing...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  <span>Manual Refresh</span>
                </>
              )}
            </button>

            <button
              onClick={performForceRefresh}
              disabled={forceRefreshLoading}
              className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                forceRefreshLoading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-200'
              }`}
            >
              {forceRefreshLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent" />
                  <span>Forcing...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span>Force Refresh</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            Manual refresh updates all characters • Force refresh bypasses interval
          </p>
        </div>
      </div>
    </div>
  );
};

export default AutoRefreshComponent;
