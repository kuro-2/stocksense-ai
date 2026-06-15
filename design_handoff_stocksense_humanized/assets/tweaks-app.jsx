/* Shared Tweaks island for StockSense pages.
   Renders the panel and syncs tweak state -> <html> data-attrs + accent CSS vars.
   Requires React, ReactDOM, and tweaks-panel.jsx loaded first.
   Mount target: <div id="tweak-root"></div>  */

const ACCENTS = {
  '#1f9d6b': { base:'#1f9d6b', bright:'#2fc98c', deep:'#0f6e49', ink:'#05130d' }, // emerald
  '#cf8a2e': { base:'#cf8a2e', bright:'#e7a948', deep:'#995c12', ink:'#1c1303' }, // saffron
  '#5b6ee0': { base:'#5b6ee0', bright:'#8093f2', deep:'#3a489e', ink:'#f6f7ff' }, // indigo
  '#e2674c': { base:'#e2674c', bright:'#f4866c', deep:'#a8412c', ink:'#1d0a06' }, // coral
};

function hexToRgba(hex, a){
  const h = hex.replace('#','');
  const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
  return `rgba(${r},${g},${b},${a})`;
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "layout": "editorial",
  "accent": "#1f9d6b",
  "font": "editorial",
  "density": "regular",
  "motion": "subtle"
}/*EDITMODE-END*/;

function applyTweaks(t){
  const root = document.documentElement;
  root.setAttribute('data-layout', t.layout);
  root.setAttribute('data-font', t.font);
  root.setAttribute('data-density', t.density);
  root.setAttribute('data-motion', t.motion);
  const a = ACCENTS[t.accent] || ACCENTS['#1f9d6b'];
  root.style.setProperty('--accent', a.base);
  root.style.setProperty('--accent-bright', a.bright);
  root.style.setProperty('--accent-deep', a.deep);
  root.style.setProperty('--accent-ink', a.ink);
  root.style.setProperty('--accent-soft', hexToRgba(a.bright, 0.15));
}

function TweakApp(){
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  React.useEffect(() => { applyTweaks(t); }, [t]);
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Direction" />
      <TweakRadio label="Layout" value={t.layout}
        options={[{value:'editorial',label:'Editorial'},{value:'modular',label:'Modular'}]}
        onChange={(v)=>setTweak('layout', v)} />
      <TweakSection label="Type & color" />
      <TweakRadio label="Font pairing" value={t.font}
        options={[{value:'editorial',label:'Editorial'},{value:'modern',label:'Modern'},{value:'warm',label:'Warm'}]}
        onChange={(v)=>setTweak('font', v)} />
      <TweakColor label="Accent" value={t.accent}
        options={['#1f9d6b','#cf8a2e','#5b6ee0','#e2674c']}
        onChange={(v)=>setTweak('accent', v)} />
      <TweakSection label="Feel" />
      <TweakRadio label="Density" value={t.density}
        options={[{value:'compact',label:'Compact'},{value:'regular',label:'Regular'},{value:'comfy',label:'Comfy'}]}
        onChange={(v)=>setTweak('density', v)} />
      <TweakRadio label="Motion" value={t.motion}
        options={[{value:'off',label:'Off'},{value:'subtle',label:'Subtle'},{value:'lively',label:'Lively'}]}
        onChange={(v)=>setTweak('motion', v)} />
    </TweaksPanel>
  );
}

// Apply persisted/default tweaks immediately so first paint is themed,
// even before React mounts.
(function(){
  try{
    const saved = JSON.parse(localStorage.getItem('tweaks:'+location.pathname) || 'null');
    applyTweaks(Object.assign({}, TWEAK_DEFAULTS, saved || {}));
  }catch(e){ applyTweaks(TWEAK_DEFAULTS); }
})();

ReactDOM.createRoot(document.getElementById('tweak-root')).render(<TweakApp/>);
