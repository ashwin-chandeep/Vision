import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Eye,
  Type,
  HelpCircle,
  User as UserIcon,
  ShieldCheck,
  ChevronDown,
  Layers,
  Settings,
  LogOut,
  Menu,
  X,
  LogIn,
  Mic,
  Bell
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext.tsx';
import { APPROVED_SCREENS, SCREEN_REGISTRY } from '../types/screens.ts';
import { User } from '../db/database.ts';
import { getPageHelp } from '../data/pageHelpRegistry.ts';

export function Header() {
  const {
    currentScreen,
    navigateTo,
    user,
    setUser,
    logout,
    settings,
    updateSettings,
    stopSpeaking,
    isSpeaking,
    announce,
    isMobileNavOpen,
    toggleMobileNav,
    isBlindMode,
    toggleBlindMode,
    isVisionAssistantActive,
    activateVisionAssistant,
    deactivateVisionAssistant,
    showKeyboardShortcutsModal,
    setShowKeyboardShortcutsModal,
    interactionMode,
    setShowModeSelectorModal,
    isVoiceListening,
    speakText,
  } = useAccessibility();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const isAuthScreen = currentScreen === 'login' || currentScreen === 'register';

  const handleShortcutsAction = () => {
    window.dispatchEvent(new CustomEvent('accessprep:show-inline-keyboard-help'));
    const bannerEl = document.getElementById('page-help-banner-heading');
    if (bannerEl) {
      bannerEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    const rec = getPageHelp(currentScreen);
    const textToSpeak = isAuthScreen
      ? 'ACCESSPREP-X Keyboard Shortcuts: Press L to type email address or roll number. Press P to enter password. Press C to auto-fill audio verification code. Press S to sign in. Press R to play audio verification code. Press F 2 to re-read field. Press Y to confirm. Press N to clear. Press H for help. Press K to hear shortcuts again. Press Escape to stop speech.'
      : `${rec.spokenKeyboardHelp} Press R to replay, press V for voice commands, or press S to continue.`;
    announce(textToSpeak, 'polite');
    speakText(textToSpeak);
  };

  // On auth screens: speak current mode aloud instead of opening mode selector modal.
  const handleModeAction = () => {
    if (isAuthScreen) {
      const modeLabel =
        interactionMode === 'voice'
          ? 'Voice Assistance Mode is active. The microphone is always listening. Speak your commands at any time.'
          : interactionMode === 'keyboard'
          ? 'Keyboard Shortcut Mode is active. Use single-letter keys L, P, C, S, R, K, H and Escape on the login page.'
          : 'Independent Manual Mode is active. Use your keyboard or screen reader to navigate.';
      announce(modeLabel, 'assertive');
      speakText(modeLabel);
    } else {
      setShowModeSelectorModal(true);
    }
  };

  const currentMeta = SCREEN_REGISTRY[currentScreen];
  const screenIndex = APPROVED_SCREENS.indexOf(currentScreen) + 1;

  // Toggle Themes
  const themes = [
    { id: 'sapphire', label: 'Default Sapphire', bg: '#1d4ed8' },
    { id: 'high_contrast_yellow', label: 'High Contrast (Yellow on Dark)', bg: '#facc15' },
    { id: 'monochrome_dark', label: 'Monochrome Dark', bg: '#000000' },
    { id: 'soft_dark', label: 'Soft Dark', bg: '#1e293b' }
  ] as const;

  const handleCycleTheme = () => {
    const curIdx = themes.findIndex((t) => t.id === settings.theme);
    const nextTheme = themes[(curIdx + 1) % themes.length];
    updateSettings({ theme: nextTheme.id });
    announce(`Theme switched to ${nextTheme.label}`, 'polite');
  };

  const handleFontScaleChange = (delta: number) => {
    const scales = [100, 125, 150, 175, 200];
    const curIdx = scales.indexOf(settings.fontScale || 125);
    const newIdx = Math.max(0, Math.min(scales.length - 1, curIdx + delta));
    const newScale = scales[newIdx];
    updateSettings({ fontScale: newScale });
    announce(`Text scale set to ${newScale}%`, 'polite');
  };

  const toggleDyslexicFont = () => {
    const val = !settings.dyslexiaFont;
    updateSettings({ dyslexiaFont: val });
    announce(val ? 'Dyslexia font activated' : 'Standard Inter font activated', 'polite');
  };

  const switchRole = (newRole: 'candidate' | 'admin') => {
    if (newRole === 'admin') {
      const adminUser: User = {
        id: 'usr_admin_01',
        rollNumber: 'SSC-ADMIN-01',
        name: 'Dr. Meera Iyer (Academic Evaluator)',
        email: 'evaluator@ssc.gov.in',
        passwordHash: 'admin123',
        role: 'admin',
        pwdCategory: 'None',
        needScribe: false,
        examRegion: 'HQ New Delhi',
        examLanguage: 'English',
        createdAt: '2026-03-01T10:00:00Z'
      };
      setUser(adminUser);
      try {
        localStorage.setItem('accessprep_session_user', JSON.stringify(adminUser));
      } catch {}
      navigateTo('model_evaluation');
      announce('Switched to Academic Evaluator / Admin role', 'polite');
    } else {
      const candidateUser: User = {
        id: 'usr_candidate_01',
        rollNumber: 'SSC-2026-MTS-01',
        name: 'Aarav Sharma (Candidate)',
        email: 'candidate@accessprep.nic.in',
        passwordHash: 'candidate123',
        role: 'candidate',
        pwdCategory: 'Visually Impaired',
        needScribe: true,
        examRegion: 'Northern Region (NR)',
        examLanguage: 'English',
        createdAt: '2026-03-01T10:00:00Z'
      };
      setUser(candidateUser);
      try {
        localStorage.setItem('accessprep_session_user', JSON.stringify(candidateUser));
      } catch {}
      navigateTo('dashboard');
      announce('Switched to Candidate role', 'polite');
    }
    setShowRoleDropdown(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#D9E1EF] shadow-xs">
      {/* 1. Skip Navigation Link (WCAG AAA) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#123BB8] focus:text-white focus:font-bold focus:rounded-md focus:shadow-lg focus:outline-hidden"
      >
        Skip to main content
      </a>

      {/* 2. Main ACCESSPREP-X Application Header (No Govt of India bar, clean layout) */}
      <div className="w-full px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Mobile Toggle & APX Brand Identity */}
        <div className="flex items-center gap-3">
          {user && (
            <button
              type="button"
              onClick={toggleMobileNav}
              aria-label={isMobileNavOpen ? 'Close navigation drawer' : 'Open navigation drawer'}
              aria-expanded={isMobileNavOpen}
              className="lg:hidden p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-[#EEF4FF] border border-[#D9E1EF] transition-colors focus:ring-2 focus:ring-[#6241C8]"
            >
              {isMobileNavOpen ? <X className="w-5 h-5 text-[#1749E8]" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <button
            type="button"
            onClick={() => navigateTo(user ? 'dashboard' : 'login')}
            className="flex items-center gap-3 text-left group focus:outline-none focus:ring-2 focus:ring-[#6241C8] rounded-lg p-1 -m-1"
            title="ACCESSPREP-X Home"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1749E8] to-[#6241C8] text-white font-black flex items-center justify-center text-lg shadow-sm shrink-0">
              APX
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold text-[#172033] tracking-tight group-hover:text-[#1749E8] transition-colors">
                  ACCESSPREP-X
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 bg-[#EEF4FF] text-[#1749E8] rounded-md border border-[#D9E1EF]">
                  SSC MTS 2026
                </span>
              </div>
              <p className="text-xs text-[#53627A] font-medium hidden sm:block">
                Accessible Examination Platform · Non-Technical Staff
              </p>
            </div>
          </button>
        </div>

        {/* Center: Screen Indicator Badge (Desktop) */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-[#EEF4FF] rounded-lg border border-[#D9E1EF]">
          <Layers className="w-4 h-4 text-[#1749E8]" />
          <span className="text-xs font-semibold text-[#172033]">
            Screen {screenIndex} of {APPROVED_SCREENS.length}:
          </span>
          <span className="text-xs font-bold text-[#6241C8] max-w-[200px] truncate" title={currentMeta?.title}>
            {currentMeta?.shortLabel || currentScreen}
          </span>
        </div>

        {/* Right: Accessibility Controls & Candidate Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Accessibility Quick Controls (Integrated cleanly) */}
          <div className="flex items-center gap-1.5 bg-[#F8FAFC] p-1 rounded-lg border border-[#D9E1EF]">
            {/* Accessibility Interaction Mode Pill / Switcher */}
            <button
              type="button"
              onClick={handleModeAction}
              aria-label={`Current accessibility mode: ${
                interactionMode === 'voice'
                  ? 'Voice Assistance Mode'
                  : interactionMode === 'keyboard'
                  ? 'Keyboard Shortcut Mode'
                  : 'Independent Manual Mode'
              }. ${isAuthScreen ? 'Press to hear mode description.' : 'Click to change mode (Alt+Shift+A).'}`}
              title={isAuthScreen ? 'Hear current accessibility mode (spoken aloud)' : 'Change accessibility interaction mode (Alt+Shift+A)'}
              className="px-2.5 py-1 rounded text-xs font-bold border transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#1749E8] bg-white text-slate-800 border-[#D9E1EF] hover:bg-[#EEF4FF] hover:text-[#1749E8]"
            >
              {interactionMode === 'voice' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" aria-hidden="true" />
                  <span className="hidden sm:inline">Mode:</span>
                  <span className="text-[#1749E8]">Voice</span>
                </>
              ) : interactionMode === 'keyboard' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-600" aria-hidden="true" />
                  <span className="hidden sm:inline">Mode:</span>
                  <span className="text-emerald-700">Keyboard</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-purple-600" aria-hidden="true" />
                  <span className="hidden sm:inline">Mode:</span>
                  <span className="text-purple-700">Manual</span>
                </>
              )}
            </button>

            {/* Hands-Free Vision Mode Toggle (Section 3 & 4) */}
            <button
              type="button"
              onClick={toggleBlindMode}
              aria-pressed={isBlindMode}
              aria-label={
                isBlindMode
                  ? isVisionAssistantActive
                    ? 'Vision Assistant is active. Click to turn off Vision Mode.'
                    : "Vision Mode is listening for wake phrase 'Hey Vision'. Click to turn off."
                  : 'Vision Mode is off. Click to turn on.'
              }
              title="Toggle Hands-Free Vision Assistant Mode (Alt+V / Alt+Space)"
              className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1.5 border transition-colors ${
                isBlindMode
                  ? isVisionAssistantActive
                    ? 'bg-[#1749E8] text-white border-[#123BB8] shadow-xs ring-2 ring-[#6241C8]'
                    : 'bg-amber-400 text-slate-950 border-amber-600 shadow-xs ring-2 ring-amber-400'
                  : 'bg-white text-slate-700 border-[#D9E1EF] hover:bg-[#EEF4FF] hover:text-[#1749E8]'
              }`}
            >
              <Mic className={`w-3.5 h-3.5 ${isBlindMode && isVoiceListening ? 'text-red-500 animate-pulse' : ''}`} />
              <span>
                {isBlindMode
                  ? isVisionAssistantActive
                    ? 'Vision Mode: Active'
                    : "Vision: Say 'Hey Vision'"
                  : 'Vision Mode'}
              </span>
            </button>

            {/* Font Scaler */}
            <div className="flex items-center gap-0.5 bg-white px-1.5 py-0.5 rounded border border-[#D9E1EF] text-xs font-bold text-slate-800">
              <span className="text-[#53627A] text-[11px] mr-1 hidden md:inline">Font:</span>
              <button
                type="button"
                onClick={() => handleFontScaleChange(-1)}
                aria-label="Decrease font size"
                title="Decrease font size"
                className="px-1.5 py-0.5 hover:bg-[#EEF4FF] hover:text-[#1749E8] rounded"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ fontScale: 100 })}
                aria-label="Reset font size"
                title="Reset font size"
                className="px-1.5 py-0.5 hover:bg-[#EEF4FF] hover:text-[#1749E8] rounded"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => handleFontScaleChange(1)}
                aria-label="Increase font size"
                title="Increase font size"
                className="px-1.5 py-0.5 hover:bg-[#EEF4FF] hover:text-[#1749E8] rounded"
              >
                A+
              </button>
            </div>

            {/* Dyslexia Font Toggle */}
            <button
              type="button"
              onClick={toggleDyslexicFont}
              aria-pressed={settings.dyslexiaFont}
              aria-label="Toggle dyslexia-friendly font"
              title="Toggle dyslexia font"
              className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 border transition-colors ${
                settings.dyslexiaFont
                  ? 'bg-[#6241C8] text-white border-[#4C2FA8]'
                  : 'bg-white text-slate-700 border-[#D9E1EF] hover:bg-[#EEF4FF] hover:text-[#1749E8]'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Dyslexia</span>
            </button>

            {/* High Contrast Theme Switcher */}
            <button
              type="button"
              onClick={handleCycleTheme}
              aria-label={`Current theme: ${settings.theme}. Click to switch theme.`}
              title="Switch accessibility theme"
              className="p-1.5 bg-white hover:bg-[#EEF4FF] text-slate-700 hover:text-[#1749E8] rounded border border-[#D9E1EF] flex items-center gap-1 text-xs"
            >
              <Eye className="w-3.5 h-3.5 text-[#1749E8]" />
              <span className="capitalize hidden lg:inline">{settings.theme.replace('_', ' ')}</span>
            </button>

            {/* Keyboard Shortcuts Trigger */}
            <button
              type="button"
              onClick={handleShortcutsAction}
              aria-label={isAuthScreen ? 'Hear keyboard shortcuts (spoken aloud)' : 'Keyboard shortcuts (Press K)'}
              title={isAuthScreen ? 'Press to hear all keyboard shortcuts spoken aloud' : 'View keyboard shortcuts (Press K)'}
              className="p-1.5 bg-white hover:bg-[#EEF4FF] text-slate-700 hover:text-[#1749E8] rounded border border-[#D9E1EF]"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#6241C8]" />
            </button>
          </div>

          {/* Notifications Shortcut */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowRoleDropdown(false);
              }}
              aria-expanded={showNotifications}
              aria-label="Candidate Notifications (2 unread)"
              title="Notifications"
              className="p-1.5 bg-white hover:bg-[#EEF4FF] text-slate-700 hover:text-[#1749E8] rounded-lg border border-[#D9E1EF] relative focus:ring-2 focus:ring-[#1749E8]"
            >
              <Bell className="w-4 h-4 text-[#1749E8]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#1749E8] rounded-full" aria-hidden="true" />
            </button>

            {showNotifications && (
              <div
                role="region"
                aria-label="Notifications Panel"
                className="absolute right-0 mt-1.5 w-72 bg-white border border-[#E8EBF0] rounded-xl shadow-xl z-50 p-3 text-[#172033]"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#E8EBF0] mb-2">
                  <span className="text-xs font-bold text-[#172033]">Notifications</span>
                  <span className="text-[10px] text-[#64748B]">2 new</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2 bg-[#F8F9FB] rounded-lg border border-[#E8EBF0]">
                    <p className="font-semibold text-[#172033]">SM-2 Revision Interval Ready</p>
                    <p className="text-[11px] text-[#64748B] mt-0.5">Spaced repetition items are ready for review today.</p>
                  </div>
                  <div className="p-2 bg-[#F8F9FB] rounded-lg border border-[#E8EBF0]">
                    <p className="font-semibold text-[#172033]">SSC MTS 2026 Examination Notice</p>
                    <p className="text-[11px] text-[#64748B] mt-0.5">Compensatory time (60 min/session) applied to your profile.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Auth Area */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                aria-expanded={showRoleDropdown}
                aria-haspopup="true"
                className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-[#EEF4FF] text-[#172033] text-xs font-semibold rounded-lg border border-[#D9E1EF] transition-colors focus:ring-2 focus:ring-[#6241C8]"
              >
                {user.role === 'admin' ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                ) : (
                  <UserIcon className="w-4 h-4 text-[#1749E8]" />
                )}
                <span className="font-bold max-w-[130px] truncate">{user.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {showRoleDropdown && (
                <div
                  role="menu"
                  className="absolute right-0 mt-1.5 w-64 bg-white border-2 border-[#D9E1EF] rounded-xl shadow-xl z-50 p-2 text-slate-900"
                >
                  <div className="p-2.5 border-b border-slate-200 mb-1 bg-[#EEF4FF] rounded-lg">
                    <p className="text-xs font-bold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-600">Roll: {user.rollNumber}</p>
                    <p className="text-[11px] font-bold text-[#1749E8] mt-0.5 uppercase tracking-wider">
                      Role: {user.role}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => switchRole('candidate')}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-md flex items-center gap-2 transition-colors ${
                        user.role === 'candidate' ? 'bg-[#EEF4FF] text-[#1749E8]' : 'hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <UserIcon className="w-3.5 h-3.5 text-[#1749E8]" />
                      Candidate Mode (Student)
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => switchRole('admin')}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-md flex items-center gap-2 transition-colors ${
                        user.role === 'admin' ? 'bg-emerald-100 text-emerald-900' : 'hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      Admin / Academic Reviewer
                    </button>

                    <div className="border-t border-slate-200 pt-1 mt-1">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setShowRoleDropdown(false);
                          logout();
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold rounded-md flex items-center gap-2 text-red-700 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-600" />
                        <span>Sign Out / Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigateTo('login')}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#1749E8] hover:bg-[#123BB8] rounded-lg shadow-xs inline-flex items-center gap-1.5 transition-colors focus:ring-2 focus:ring-[#6241C8]"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Candidate Login</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
