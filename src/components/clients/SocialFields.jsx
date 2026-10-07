const FIELDS = [
  { key: 'facebook', label: 'فيسبوك' },
  { key: 'instagram', label: 'إنستغرام' },
  { key: 'twitter', label: 'تويتر / X' },
  { key: 'linkedin', label: 'لينكدإن' },
  { key: 'tiktok', label: 'تيك توك' },
  { key: 'snapchat', label: 'سناب شات' },
  { key: 'youtube', label: 'يوتيوب' }
];

export default function SocialFields({ value = {}, onChange }) {
  const set = (k, v) => onChange({ ...value, [k]: v });
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {FIELDS.map((f) => (
        <div key={f.key}>
          <label className="text-xs text-neutral-400">{f.label}</label>
          <input
            value={value[f.key] || ''}
            onChange={(e) => set(f.key, e.target.value)}
            className="w-full rounded-lg bg-[#050505] border border-neutral-800 px-3 py-2 text-sm text-white outline-none focus:border-[#3D8F73]"
            placeholder={`https://${f.key}.com/...`}
          />
        </div>
      ))}
    </div>
  );
}