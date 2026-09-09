'use client';

import { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2, Minus, Plus, RotateCcw, Rotate3d, Laptop, Info, View } from 'lucide-react';
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useLidTools } from './webmcp';
import MacBookScene, { type SceneHandle, type Finish } from './scene';

const views = [{name:'Perspective',label:'Perspective'},{name:'Front',label:'Front'},{name:'Top',label:'Top'},{name:'Back',label:'Back'}];
export default function Home() {
  const scene = useRef<SceneHandle>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lid, setLid] = useState(105);
  const [spin, setSpin] = useState(false);
  const [finish, setFinish] = useState<Finish>('silver');
  const finishLabel = finish === 'silver' ? 'Silver' : 'Space Gray';
  const [view, setView] = useState('Perspective');
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [immersive, setImmersive] = useState(false);
  const [awake, setAwake] = useState(true);
  const [panel, setPanel] = useState<string | null>(null);
  useLidTools(lid, setLid);

  function wakeControls() {
    setAwake(true);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (immersive && !panel) idleTimer.current = setTimeout(() => {
      const keyboardFocus = document.activeElement?.matches(':focus-visible') && document.activeElement?.closest('.viewer-controls');
      if (!keyboardFocus) setAwake(false);
    }, 2800);
  }
  useEffect(() => {
    wakeControls();
    return () => { if (idleTimer.current) clearTimeout(idleTimer.current); };
  }, [immersive, panel]);
  useEffect(() => {
    const fullscreenChanged = () => { if (!document.fullscreenElement) setImmersive(false); };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !panel) setImmersive(false);
    };
    document.addEventListener('fullscreenchange', fullscreenChanged);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('fullscreenchange', fullscreenChanged);
      document.removeEventListener('keydown', escape);
    };
  }, [panel]);
  async function toggleImmersive() {
    setPanel(null);
    if (immersive) {
      setImmersive(false);
      if (document.fullscreenElement === document.documentElement) await document.exitFullscreen().catch(() => {});
    } else {
      setImmersive(true);
      // The page-wide layout also works when the browser does not support fullscreen.
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch(() => {});
      }
    }
  }
  function chooseView(name: string) { setView(name); scene.current?.view(name); setPanel(null); }
  function reset() { setLid(105); setSpin(false); chooseView('Perspective'); }
  const popoverState = (name: string) => ({ open: panel === name, onOpenChange: (open: boolean) => setPanel(open ? name : null) });

  return <main className={`studio ${immersive ? 'immersive' : ''} ${awake ? '' : 'hud-asleep'}`} onPointerMove={wakeControls} onPointerDown={wakeControls} onFocusCapture={wakeControls}>
    <section className="viewport" aria-label="Interactive MacBook Pro">
      <MacBookScene ref={scene} lid={lid} spin={spin} finish={finish} onReady={() => setReady(true)} onError={() => { setReady(false); setError(true); }}/>
      {!ready && <div className="scene-status" role="status">{error ? 'Unable to load the 3D model. Reload the page with WebGL enabled.' : <><span className="loading-ring"/>Loading…</>}</div>}
    </section>
    <header className="viewer-header">
      <div className="identity"><h1>MacBook Pro</h1><p>16″ · M5 Pro · {finishLabel}</p></div>
      <div className="top-actions viewer-controls">
        {!immersive && <Popover {...popoverState('info')}>
          <PopoverTrigger className="icon-button quiet" aria-label="About this model" title="About"><Info size={19}/></PopoverTrigger>
          <PopoverContent className="glass-popover info-popover" align="end" sideOffset={12}>
            <PopoverTitle>MacBook Pro 16″</PopoverTitle>
            <p className="configuration">M5 Pro · {finishLabel} · US keyboard</p>
            <p className="provenance">Independently modeled in code from photographic references. 355.7 × 248.1 × 16.8 mm. Original geometry, materials, and screen artwork.</p>
            <p className="provenance">An unofficial visual study. Not affiliated with Apple.</p>
          </PopoverContent>
        </Popover>}
        <button className={`immersive-button ${immersive ? 'exit-button' : ''}`} onClick={toggleImmersive} aria-label={immersive ? 'Exit immersive mode' : 'Enter fullscreen immersive mode'} aria-pressed={immersive} title={immersive ? 'Exit · Esc' : 'Immersive mode'}>
          {immersive ? <Minimize2 size={18}/> : <Maximize2 size={17}/>}<span>{immersive ? 'Exit' : 'Immersive'}</span>
        </button>
      </div>
    </header>
    <div className="bottom-hud">
      <div className="floating-dock viewer-controls" role="toolbar" aria-label="MacBook controls">
      <RadioGroup className="finish-picker viewer-controls" aria-label="Finish" aria-orientation="horizontal" value={finish} onValueChange={value => { if (value === 'silver' || value === 'space-gray') setFinish(value); }}>
        <RadioGroupItem className="color-swatch silver-swatch" value="silver" aria-label="Silver" title="Silver"/>
        <RadioGroupItem className="color-swatch gray-swatch" value="space-gray" aria-label="Space Gray" title="Space Gray"/>
      </RadioGroup>
        <span className="dock-divider"/>
        <Popover {...popoverState('views')}>
          <PopoverTrigger className="icon-button" aria-label="Change view" title="View"><View size={21}/></PopoverTrigger>
          <PopoverContent className="glass-popover view-popover" side="top" sideOffset={16}>
            <PopoverTitle>View</PopoverTitle>
            <div className="view-options">{views.map(item => <button key={item.name} onClick={() => chooseView(item.name)} className={view === item.name ? 'selected' : ''} aria-pressed={view === item.name}>{item.label}</button>)}</div>
          </PopoverContent>
        </Popover>
        <button className={`icon-button ${spin ? 'active' : ''}`} onClick={() => setSpin(!spin)} aria-label={spin ? 'Stop rotation' : 'Rotate automatically'} aria-pressed={spin} title="Auto-rotate"><Rotate3d size={21}/></button>
        <Popover {...popoverState('lid')}>
          <PopoverTrigger className="icon-button" aria-label="Open or close the lid" title="Lid"><Laptop size={21}/></PopoverTrigger>
          <PopoverContent className="glass-popover lid-popover" side="top" sideOffset={16}>
            <div className="panel-heading"><PopoverTitle>Lid</PopoverTitle><output>{lid}°</output></div>
            <Slider aria-label="Lid angle" min={0} max={135} step={1} value={[lid]} onValueChange={value => setLid(Array.isArray(value) ? value[0] : value)}/>
            <div className="lid-presets"><button onClick={() => setLid(0)}>Close</button><button onClick={() => setLid(105)}>Open</button></div>
          </PopoverContent>
        </Popover>
        <span className="dock-divider"/>
        <button className="icon-button" aria-label="Zoom out" title="Zoom out" onClick={() => scene.current?.zoom(false)}><Minus size={20}/></button>
        <button className="icon-button" aria-label="Zoom in" title="Zoom in" onClick={() => scene.current?.zoom(true)}><Plus size={20}/></button>
        <span className="dock-divider"/>
        <button className="icon-button" aria-label="Reset view" title="Reset" onClick={reset}><RotateCcw size={18}/></button>
      </div>
      <p className="gesture-hint">Drag to rotate. Scroll to zoom.</p>
    </div>
  </main>;
}
