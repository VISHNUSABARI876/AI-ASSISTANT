import { useState } from 'react'
import {
  RiUserLine,
  RiLockLine,
  RiSettings4Line,
  RiMoonLine,
  RiSunLine,
  RiBellLine,
  RiNotificationOffFill,
  RiSettings3Line,
  RiShieldKeyholeLine,
  RiSaveLine,
  RiCheckLine,
} from 'react-icons/ri'

const ToggleSwitch = ({ enabled, onChange }) => (
  <button
    onClick={() => onChange(!enabled)}
    className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors focus:outline-none ${enabled ? 'bg-primary-500' : 'bg-slate-200 dark:bg-dark-500'
      }`}
  >
    <span
      className={`inline-block w-4 h-4 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
    />
  </button>
)

const SectionCard = ({ title, icon: Icon, children }) => (
  <div className="card p-6">
    <div className="flex items-center gap-2 mb-5">
      <div className="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
        <Icon className="text-primary-600 dark:text-primary-400 text-base" />
      </div>
      <h3 className="font-bold text-slate-800 dark:text-slate-100">{title}</h3>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
)

const SettingRow = ({ label, description, children }) => (
  <div className="flex items-center justify-between gap-4">
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</p>
      {description && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{description}</p>
      )}
    </div>
    <div className="flex-shrink-0">{children}</div>
  </div>
)

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  )
  const [notifications, setNotifications] = useState(true)
  const [aiSuggestions, setAiSuggestions] = useState(true)
  const [autoSave, setAutoSave] = useState(false)
  const [language, setLanguage] = useState('en')
  const [saved, setSaved] = useState(false)

  const handleDarkMode = (val) => {
    setDarkMode(val)
    document.documentElement.classList.toggle('dark', val)
  }

  const handleSave = () => {
    // TODO: persist settings to backend / localStorage
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="page-container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">Settings</h1>
          <p className="text-slate-500 dark:text-slate-400">Customize your AI Assistant experience.</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow"
        >
          {saved ? <RiCheckLine /> : <RiSaveLine />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {saved && (
        <div className="mb-6 flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-medium px-4 py-3 rounded-xl border border-green-200 dark:border-green-800">
          <RiCheckLine /> Settings saved successfully.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance */}
        <SectionCard title="Appearance" icon={RiSunLine}>
          <SettingRow
            label="Dark Mode"
            description="Switch between light and dark interface"
          >
            <div className="flex items-center gap-2">
              <RiSunLine className="text-amber-500 text-lg" />
              <ToggleSwitch enabled={darkMode} onChange={handleDarkMode} />
              <RiMoonLine className="text-slate-400 text-lg" />
            </div>
          </SettingRow>

          <SettingRow label="Language" description="Interface display language">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-50 dark:bg-dark-700 border border-slate-200 dark:border-dark-500 rounded-lg px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </SettingRow>
        </SectionCard>

        {/* Notifications */}
        <SectionCard title="Notifications" icon={RiBellLine}>
          <SettingRow
            label="Push Notifications"
            description="Receive alerts for new activity"
          >
            <div className="flex items-center gap-2">
              {notifications ? (
                <RiBellLine className="text-primary-500 text-lg" />
              ) : (
                <RiBellOffLine className="text-slate-400 text-lg" />
              )}
              <ToggleSwitch enabled={notifications} onChange={setNotifications} />
            </div>
          </SettingRow>

          <SettingRow
            label="AI Suggestions"
            description="Show contextual AI suggestions while typing"
          >
            <ToggleSwitch enabled={aiSuggestions} onChange={setAiSuggestions} />
          </SettingRow>

          <SettingRow
            label="Auto-save Chats"
            description="Automatically save conversations to history"
          >
            <ToggleSwitch enabled={autoSave} onChange={setAutoSave} />
          </SettingRow>
        </SectionCard>

        {/* Security */}
        <SectionCard title="Security" icon={RiShieldKeyholeLine}>
          <SettingRow
            label="Change Password"
            description="Update your account password"
          >
            <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 font-semibold transition-colors">
              Update →
            </button>
          </SettingRow>

          <SettingRow
            label="Active Sessions"
            description="Manage devices logged into your account"
          >
            <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 font-semibold transition-colors">
              View →
            </button>
          </SettingRow>

          <SettingRow
            label="Delete Account"
            description="Permanently remove your account and data"
          >
            <button className="text-sm text-red-500 hover:text-red-700 font-semibold transition-colors">
              Delete
            </button>
          </SettingRow>
        </SectionCard>

        {/* About */}
        <SectionCard title="About" icon={RiSettings4Line}>
          <div className="space-y-3">
            {[
              ['Version', '1.0.0'],
              ['Backend', 'Flask + SQLAlchemy'],
              ['AI Engine', 'GPT-2 (Transformers)'],
              ['License', 'MIT'],
            ].map(([key, val]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">{key}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{val}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
