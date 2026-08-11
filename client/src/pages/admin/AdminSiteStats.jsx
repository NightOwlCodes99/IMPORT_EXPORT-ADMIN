import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { getSiteStats, updateSiteStats, resetSiteStats } from '../../services/operations/siteStatsAPI';

const statFields = [
  { key: 'activeUsers', icon: 'fa-users', color: 'emerald', badge: 'Live', badgeColor: 'bg-emerald-100 text-emerald-700', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-500', cardBorder: 'border-emerald-300', description: 'Total active users on the platform' },
  { key: 'countries', icon: 'fa-globe', color: 'cyan', badge: 'Global', badgeColor: 'bg-cyan-100 text-cyan-700', iconBg: 'bg-cyan-100', iconColor: 'text-cyan-500', cardBorder: 'border-cyan-300', description: 'Number of countries served' },
  { key: 'productsListed', icon: 'fa-box', color: 'amber', badge: 'Catalog', badgeColor: 'bg-amber-100 text-amber-700', iconBg: 'bg-amber-100', iconColor: 'text-amber-500', cardBorder: 'border-amber-300', description: 'Total active products listed' },
  { key: 'yearsExperience', icon: 'fa-calendar', color: 'blue', badge: 'Since 2023', badgeColor: 'bg-blue-100 text-blue-700', iconBg: 'bg-blue-100', iconColor: 'text-blue-500', cardBorder: 'border-blue-300', description: 'Years of industry experience' },
  { key: 'satisfactionRate', icon: 'fa-star', color: 'purple', badge: 'Rating', badgeColor: 'bg-purple-100 text-purple-700', iconBg: 'bg-purple-100', iconColor: 'text-purple-500', cardBorder: 'border-purple-300', description: 'Customer satisfaction percentage' },
  { key: 'verifiedSuppliers', icon: 'fa-building', color: 'orange', badge: 'Verified', badgeColor: 'bg-orange-100 text-orange-700', iconBg: 'bg-orange-100', iconColor: 'text-orange-500', cardBorder: 'border-orange-300', description: 'Number of verified trade partners' },
];

const colorMap = {
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', gradient: 'from-emerald-500 to-teal-600', light: 'bg-emerald-100', ring: 'ring-emerald-300' },
  cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-600', gradient: 'from-cyan-500 to-blue-600', light: 'bg-cyan-100', ring: 'ring-cyan-300' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', gradient: 'from-amber-500 to-orange-600', light: 'bg-amber-100', ring: 'ring-amber-300' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', gradient: 'from-blue-500 to-indigo-600', light: 'bg-blue-100', ring: 'ring-blue-300' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', gradient: 'from-purple-500 to-pink-600', light: 'bg-purple-100', ring: 'ring-purple-300' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', gradient: 'from-orange-500 to-red-600', light: 'bg-orange-100', ring: 'ring-orange-300' },
};

const normalizeTradePartnerLabel = (statKey, label) => {
  if (statKey !== 'verifiedSuppliers') return label;
  if (!label || /supplier/i.test(label)) return 'Verified Trade Partners';
  return label;
};

const AdminSiteStats = () => {
  const { token } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await getSiteStats();
      if (response.success) {
        // Initialize form data from fetched stats
        const initial = {};
        statFields.forEach(({ key }) => {
          const incomingLabel = response.data[key]?.label || '';
          initial[key] = {
            value: response.data[key]?.value || 0,
            suffix: response.data[key]?.suffix || '+',
            label: normalizeTradePartnerLabel(key, incomingLabel),
          };
        });
        setFormData(initial);
        setLastUpdated(response.data.updatedAt);
      }
    } catch {
      toast.error('Failed to load site statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (statKey, field, value) => {
    const updatedValue =
      field === 'label' ? normalizeTradePartnerLabel(statKey, value) : value;

    setFormData(prev => ({
      ...prev,
      [statKey]: {
        ...prev[statKey],
        [field]: field === 'value' ? (updatedValue === '' ? '' : Number(updatedValue)) : updatedValue,
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await updateSiteStats(formData, token);
      if (response.success) {
        setLastUpdated(response.data.updatedAt);
      }
    } catch {
      // toast already handled in API
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setResetting(true);
      const response = await resetSiteStats(token);
      if (response.success) {
        const initial = {};
        statFields.forEach(({ key }) => {
          const incomingLabel = response.data[key]?.label || '';
          initial[key] = {
            value: response.data[key]?.value || 0,
            suffix: response.data[key]?.suffix || '+',
            label: normalizeTradePartnerLabel(key, incomingLabel),
          };
        });
        setFormData(initial);
        setLastUpdated(response.data.updatedAt);
      }
    } catch {
      // toast already handled in API
    } finally {
      setResetting(false);
      setShowResetConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Loading site statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200">
              <i className="fas fa-chart-pie text-white text-lg"></i>
            </div>
            <div>
              <span className="block">Site Statistics</span>
              <span className="block text-sm font-normal text-slate-400">Manage the statistics displayed across the website</span>
            </div>
          </h1>
          {lastUpdated && (
            <p className="text-xs text-slate-400 mt-2 ml-14">
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2.5 bg-white text-slate-600 rounded-xl hover:bg-slate-50 transition-all text-sm font-semibold flex items-center gap-2 border border-slate-200 shadow-sm"
            disabled={saving || resetting}
          >
            <i className="fas fa-undo text-xs"></i>
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all text-sm font-bold shadow-lg shadow-rose-200 flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statFields.map(({ key, icon, iconBg, iconColor, badge, badgeColor, cardBorder }) => {
          const val = formData[key];
          return (
            <div
              key={key}
              className={`bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 border-2 ${cardBorder}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
                  <i className={`fas ${icon} ${iconColor} text-base`}></i>
                </div>
                <span className={`${badgeColor} text-[10px] font-bold px-2 py-0.5 rounded-md`}>
                  {badge}
                </span>
              </div>
              <p className="text-slate-500 text-xs font-medium mb-1">{val?.label || key}</p>
              <p className="text-3xl font-black text-slate-800">
                {val?.value || 0}<span className="text-lg text-slate-400">{val?.suffix || '+'}</span>
              </p>
            </div>
          );
        })}
      </div>

      {/* Edit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {statFields.map(({ key, icon, color, description }, index) => {
          const c = colorMap[color];
          const val = formData[key];
          if (!val) return null;
          
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className={`bg-white rounded-2xl border-2 ${c.border} p-5 shadow-sm hover:shadow-lg transition-all duration-300`}
            >
              {/* Card Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 bg-gradient-to-br ${c.gradient} rounded-xl flex items-center justify-center shadow-md`}>
                  <i className={`fas ${icon} text-white`}></i>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{val.label || key}</h3>
                  <p className="text-xs text-slate-400">{description}</p>
                </div>
              </div>

              {/* Fields */}
              <div className="space-y-3">
                {/* Value */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Value</label>
                  <input
                    type="number"
                    value={val.value}
                    onChange={(e) => handleChange(key, 'value', e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border-2 ${c.border} ${c.bg} text-slate-800 font-bold text-lg focus:outline-none focus:ring-2 ${c.ring} transition-all`}
                    min="0"
                  />
                </div>

                {/* Suffix */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Suffix</label>
                  <div className="flex gap-2">
                    {['+', '%', 'K+', 'M+', ''].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleChange(key, 'suffix', s)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                          val.suffix === s
                            ? `bg-gradient-to-r ${c.gradient} text-white shadow-md`
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {s || 'None'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Label */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Display Label</label>
                  <input
                    type="text"
                    value={val.label}
                    onChange={(e) => handleChange(key, 'label', e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border-2 ${c.border} ${c.bg} text-slate-700 font-medium focus:outline-none focus:ring-2 ${c.ring} transition-all text-sm`}
                    placeholder="e.g., Active Users"
                  />
                </div>

                {/* Current display preview */}
                <div className={`${c.bg} rounded-xl p-3 text-center border ${c.border}`}>
                  <span className={`text-xl font-black bg-gradient-to-r ${c.gradient} bg-clip-text text-transparent`}>
                    {val.value}{val.suffix}
                  </span>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{val.label}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <i className="fas fa-info-circle text-blue-500"></i>
          </div>
          <div>
            <h3 className="font-bold text-blue-800 text-sm mb-1">Where are these stats displayed?</h3>
            <ul className="text-blue-600 text-xs space-y-1">
              <li><i className="fas fa-check text-blue-400 mr-2"></i><strong>Home Page</strong> — Hero section stats + Growing Trade Community section</li>
              <li><i className="fas fa-check text-blue-400 mr-2"></i><strong>Login Page</strong> — Left panel stats cards</li>
              <li><i className="fas fa-check text-blue-400 mr-2"></i><strong>Signup Page</strong> — Left panel feature grid</li>
              <li><i className="fas fa-check text-blue-400 mr-2"></i><strong>About Page</strong> — Stats cards + Our Story section</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-2xl"
          >
            <div className="text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Reset to Defaults?</h3>
              <p className="text-slate-500 text-sm mb-6">
                This will reset all statistics to their default values. This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all font-semibold text-sm"
                  disabled={resetting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  disabled={resetting}
                  className="px-5 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-bold text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {resetting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Resetting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-undo text-xs"></i>
                      Reset Now
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminSiteStats;
