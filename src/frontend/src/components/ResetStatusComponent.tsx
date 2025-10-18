import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw, Calendar, AlertCircle } from 'lucide-react';

interface ResetStatus {
  isResetTime: boolean;
  lastReset: string;
  nextReset: string;
  timeUntilReset: string;
}

const ResetStatusComponent: React.FC = () => {
  const [status, setStatus] = useState<ResetStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [manualResetLoading, setManualResetLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResetStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reset/status');
      if (!response.ok) throw new Error('Failed to fetch reset status');
      const data = await response.json();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const performManualReset = async () => {
    try {
      setManualResetLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('/api/reset/manual', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to perform manual reset');
      
      // Refresh status after manual reset
      await fetchResetStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setManualResetLoading(false);
    }
  };

  useEffect(() => {
    fetchResetStatus();
    // Refresh status every minute
    const interval = setInterval(fetchResetStatus, 60000);
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
          <AlertCircle className="h-4 w-4" />
          <span className="font-medium">Error loading reset status</span>
        </div>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        <button 
          onClick={fetchResetStatus}
          className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!status) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          <span>Weekly Reset Status</span>
        </h3>
        {status.isResetTime && (
          <div className="flex items-center space-x-1 text-orange-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Reset Time!</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {/* Next Reset */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-900">Next Reset</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-blue-900">
              {new Date(status.nextReset).toLocaleString()}
            </div>
            <div className="text-xs text-blue-600">
              {status.timeUntilReset} remaining
            </div>
          </div>
        </div>

        {/* Last Reset */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Last Reset</span>
          </div>
          <div className="text-sm text-gray-600">
            {new Date(status.lastReset).toLocaleString()}
          </div>
        </div>

        {/* Manual Reset Button */}
        <div className="pt-2 border-t border-gray-200">
          <button
            onClick={performManualReset}
            disabled={manualResetLoading}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              manualResetLoading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-200'
            }`}
          >
            {manualResetLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent" />
                <span>Resetting...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                <span>Manual Reset</span>
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 text-center mt-1">
            Manually refresh all character activities
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetStatusComponent;
