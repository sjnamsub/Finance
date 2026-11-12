import React, { useState } from 'react';
import { Bell, BellRing, Clock, CheckCircle, AlertTriangle, Volume2, VolumeX, Shield, Play } from 'lucide-react';
import { ReminderConfig } from '../types/finance';

interface Props {
  config: ReminderConfig;
  isOpen: boolean;
  onClose: () => void;
  onSaveConfig: (newConfig: ReminderConfig) => void;
  todayTransactionCount: number;
}

export const DailyReminderModal: React.FC<Props> = ({
  config,
  isOpen,
  onClose,
  onSaveConfig,
  todayTransactionCount,
}) => {
  if (!isOpen) return null;

  const [enabled, setEnabled] = useState(config.enabled);
  const [time, setTime] = useState(config.time || '16:30');
  const [audioEnabled, setAudioEnabled] = useState(config.audioEnabled);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [testNotificationSent, setTestNotificationSent] = useState(false);

  // Play audio chime via Web Audio API synth
  const playAlertChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch {
      // AudioContext not allowed or not supported
    }
  };

  const handleRequestPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setPermissionStatus(perm);
      if (perm === 'granted') {
        new Notification('Pengingat Keuangan SJ-IN', {
          body: 'Notifikasi pengingat harian berhasil diaktifkan! Anda akan menerima pengingat harian untuk pencatatan kas.',
          icon: '/favicon.ico',
        });
      }
    }
  };

  const handleTestNotification = () => {
    if (audioEnabled) {
      playAlertChime();
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pengingat Kas Harian PT Sriwijaya Air & PT NAM Air', {
        body: 'Halo Tim Finance! Jangan lupa input pengeluaran dan pemasukan kas hari ini agar tidak terlewat.',
      });
    }

    setTestNotificationSent(true);
    setTimeout(() => setTestNotificationSent(false), 3000);
  };

  const handleSave = () => {
    onSaveConfig({
      enabled,
      time,
      audioEnabled,
      browserNotificationsEnabled: permissionStatus === 'granted',
      lastCheckedDate: new Date().toISOString().slice(0, 10),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
                <BellRing className="w-6 h-6 text-yellow-300 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Pengingat Harian Input Kas</h3>
                <p className="text-xs text-blue-200">
                  Mencegah transaksi operasional terlewat atau tidak tercatat
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Today Status Widget */}
          <div
            className={`p-4 rounded-xl border flex items-center gap-3.5 ${
              todayTransactionCount > 0
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            {todayTransactionCount > 0 ? (
              <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
            )}
            <div>
              <div className="font-bold text-sm">
                {todayTransactionCount > 0
                  ? `Transaksi Hari Ini: ${todayTransactionCount} Sudah Tercatat`
                  : 'Belum Ada Transaksi Tercatat Hari Ini!'}
              </div>
              <p className="text-xs opacity-90 mt-0.5">
                {todayTransactionCount > 0
                  ? 'Pencatatan kas hari berjalan sudah dilakukan. Tetap periksa jika ada pengeluaran tambahan.'
                  : 'Pastikan seluruh BKK dan BMK hari ini telah diinput sebelum tutup buku operasional.'}
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <div className="font-semibold text-sm text-slate-800">
                Aktifkan Alarm & Pengingat Harian
              </div>
              <div className="text-xs text-slate-500">
                Kirim notifikasi otomatis sebelum shift operasional selesai
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Settings if enabled */}
          {enabled && (
            <div className="space-y-4 pt-1">
              {/* Reminder Time */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Waktu Pengingat Setiap Hari
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="px-3.5 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                  />
                  <span className="text-xs text-slate-500">
                    WIB (Waktu Indonesia Barat / Jam Kerja Distrik)
                  </span>
                </div>
              </div>

              {/* Sound Alert Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  {audioEnabled ? (
                    <Volume2 className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-slate-400" />
                  )}
                  <div>
                    <div className="font-semibold text-xs text-slate-800">
                      Bunyi Suara Notifikasi (Chime)
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Bunyikan nada lonceng khas bandara saat jam pengingat tiba
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAudioEnabled(!audioEnabled);
                    if (!audioEnabled) playAlertChime();
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    audioEnabled
                      ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {audioEnabled ? 'Aktif' : 'Nonaktif'}
                </button>
              </div>

              {/* Browser Notification Permission */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-blue-600" />
                    Izin Notifikasi Desktop Browser
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      permissionStatus === 'granted'
                        ? 'bg-emerald-100 text-emerald-800'
                        : permissionStatus === 'denied'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {permissionStatus === 'granted'
                      ? 'Diizinkan'
                      : permissionStatus === 'denied'
                      ? 'Diblokir'
                      : 'Belum Diizinkan'}
                  </span>
                </div>
                {permissionStatus !== 'granted' && (
                  <button
                    onClick={handleRequestPermission}
                    className="w-full mt-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    Aktifkan Izin Notifikasi Browser
                  </button>
                )}
              </div>

              {/* Test Button */}
              <div className="pt-1 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleTestNotification}
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold"
                >
                  <Play className="w-3.5 h-3.5" />
                  Uji Coba Bunyi & Notifikasi Sekarang
                </button>
                {testNotificationSent && (
                  <span className="text-xs text-emerald-600 font-semibold animate-pulse">
                    ✓ Notifikasi & suara terkirim!
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            Simpan Pengaturan
          </button>
        </div>
      </div>
    </div>
  );
};
