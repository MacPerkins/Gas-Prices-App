import { useAppState } from './state/AppState.jsx';
import { useHashTab } from './hooks/useHashTab';
import CitySelector from './components/CitySelector.jsx';
import OverviewTab from './tabs/OverviewTab.jsx';
import TrendsTab from './tabs/TrendsTab.jsx';
import StationsTab from './tabs/StationsTab.jsx';
import LogTab from './tabs/LogTab.jsx';
import ToolsTab from './tabs/ToolsTab.jsx';
import AlertsTab from './tabs/AlertsTab.jsx';
import SettingsTab from './tabs/SettingsTab.jsx';

const TABS = [
  { id: 'overview', label: 'Overview', icon: '\u{1F3E0}' },
  { id: 'trends', label: 'Trends', icon: '\u{1F4C8}' },
  { id: 'stations', label: 'Stations', icon: '⛽' },
  { id: 'log', label: 'Log', icon: '\u{1F4DD}' },
  { id: 'tools', label: 'Tools', icon: '\u{1F9EE}' },
  { id: 'alerts', label: 'Alerts', icon: '\u{1F514}' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function App() {
  const [tab, goTo] = useHashTab('overview');
  const { cities, currentCityId } = useAppState();
  const currentCity = cities.find((c) => c.id === currentCityId) || cities[0];

  return (
    <>
      <header className="app-header">
        <h1 className="app-title">
          Fuel Forecast
          <span className="sub">Viewing {currentCity?.name || '…'}</span>
        </h1>
        <CitySelector />
      </header>

      <nav className="tab-nav" aria-label="Sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? 'active' : ''}
            onClick={() => goTo(t.id)}
            aria-current={tab === t.id ? 'page' : undefined}
          >
            <span className="icon" aria-hidden="true">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      <main className="app-main">
        {tab === 'overview' && <OverviewTab city={currentCity} goTo={goTo} />}
        {tab === 'trends' && <TrendsTab city={currentCity} />}
        {tab === 'stations' && <StationsTab city={currentCity} />}
        {tab === 'log' && <LogTab city={currentCity} />}
        {tab === 'tools' && <ToolsTab city={currentCity} />}
        {tab === 'alerts' && <AlertsTab city={currentCity} />}
        {tab === 'settings' && <SettingsTab />}
      </main>
    </>
  );
}
