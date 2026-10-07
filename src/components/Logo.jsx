export default function Logo({ size = 'md', onDark = true, withSub = true }) {
  const main = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' };
  const sub = { sm: 'text-[7px]', md: 'text-[9px]', lg: 'text-[11px]' };
  return (
    <div className="flex flex-col leading-none select-none">
      <div className={`font-extrabold tracking-tight ${main[size]}`}>
        <span className={onDark ? 'text-white' : 'text-black'}>Plus</span>
        <span className="text-[#3D8F73]">Studio</span>
      </div>
      {withSub && (
        <div className={`${sub[size]} tracking-[0.22em] font-medium ${onDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
          WEB SOLUTIONS • NFC CONNECT
        </div>
      )}
    </div>
  );
}