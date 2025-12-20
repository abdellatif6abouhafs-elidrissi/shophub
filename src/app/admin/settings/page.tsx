'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Settings,
  Store,
  CreditCard,
  Sparkles,
  AlertTriangle,
  Save,
  RotateCcw,
  Loader2,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SettingItem {
  key: string;
  value: unknown;
  type: string;
  description?: string;
}

interface SettingsData {
  general: SettingItem[];
  checkout: SettingItem[];
  features: SettingItem[];
  advanced: SettingItem[];
}

async function fetchSettings(): Promise<{ success: boolean; data: SettingsData }> {
  const res = await fetch('/api/admin/settings');
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

const categoryIcons: Record<string, React.ReactNode> = {
  general: <Store className="h-5 w-5" />,
  checkout: <CreditCard className="h-5 w-5" />,
  features: <Sparkles className="h-5 w-5" />,
  advanced: <AlertTriangle className="h-5 w-5" />,
};

const categoryTitles: Record<string, string> = {
  general: 'General Settings',
  checkout: 'Checkout Settings',
  features: 'Features',
  advanced: 'Advanced Settings',
};

const categoryDescriptions: Record<string, string> = {
  general: 'Basic store information and preferences',
  checkout: 'Payment and shipping configurations',
  features: 'Enable or disable store features',
  advanced: 'Advanced configuration options',
};

export default function SettingsPage() {
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: fetchSettings,
  });

  const settings = data?.data;

  // Initialize form values when settings load
  useEffect(() => {
    if (settings) {
      const values: Record<string, unknown> = {};
      Object.values(settings).flat().forEach((setting) => {
        values[setting.key] = setting.value;
      });
      setFormValues(values);
      setHasChanges(false);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      toast.success('Settings saved successfully');
      setHasChanges(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      toast.success('Settings reset to defaults');
      setHasChanges(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleChange = (key: string, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateMutation.mutate(formValues);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      resetMutation.mutate();
    }
  };

  const formatLabel = (key: string) => {
    return key
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load settings</p>
          <button
            onClick={() => window.location.reload()}
            className="text-primary-600 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500">Manage your store configuration</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            disabled={resetMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {resetMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            Reset Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || updateMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      {/* Unsaved changes notice */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3"
        >
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <p className="text-yellow-800">You have unsaved changes</p>
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : settings ? (
        <div className="space-y-6">
          {Object.entries(settings).map(([category, items], index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    {categoryIcons[category] || <Settings className="h-5 w-5" />}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {categoryTitles[category] || category}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {categoryDescriptions[category]}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {items.map((setting: SettingItem) => (
                  <div key={setting.key} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="sm:w-1/3">
                      <label
                        htmlFor={setting.key}
                        className="block text-sm font-medium text-gray-700"
                      >
                        {formatLabel(setting.key)}
                      </label>
                      {setting.description && (
                        <p className="text-xs text-gray-400 mt-1">
                          {setting.description}
                        </p>
                      )}
                    </div>
                    <div className="sm:flex-1">
                      {setting.type === 'boolean' ? (
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            id={setting.key}
                            checked={formValues[setting.key] as boolean || false}
                            onChange={(e) => handleChange(setting.key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                          <span className="ms-3 text-sm text-gray-600">
                            {formValues[setting.key] ? (
                              <span className="flex items-center gap-1 text-green-600">
                                <Check className="h-4 w-4" /> Enabled
                              </span>
                            ) : (
                              'Disabled'
                            )}
                          </span>
                        </label>
                      ) : setting.type === 'number' ? (
                        <input
                          type="number"
                          id={setting.key}
                          value={formValues[setting.key] as number || 0}
                          onChange={(e) => handleChange(setting.key, parseFloat(e.target.value) || 0)}
                          className="w-full max-w-xs px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      ) : (
                        <input
                          type="text"
                          id={setting.key}
                          value={formValues[setting.key] as string || ''}
                          onChange={(e) => handleChange(setting.key, e.target.value)}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
