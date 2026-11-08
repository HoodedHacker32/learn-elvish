import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { COURSES, COURSE_NAME, LANG_NAME, ORIGIN, READING, knownForms } from './course/index.js'
import { buildLesson, buildReview, buildTengwarLesson, buildTengwarReview } from './learn/exercises.js'
import { checkTyped, checkTengwar, sameWords } from './learn/check.js'
import { TengwarTyper, TengwarDesk, TakeAway } from './tengwar-ui.jsx'
import { toTengwar } from '../../LoTR Elvish Translator/src/engine/tengwar.js'
import { dueKeys, grade, introduce, strength, today } from './learn/srs.js'
import { earn, fresh, useProgress } from './learn/store.js'
import { streakInfo, FREEZES_PER_WEEK } from './learn/streak.js'
import { todaysChallenges, countSession, progressOf } from './learn/challenges.js'
import { QUIZ, recommend } from './learn/quiz.js'
import { auth } from './accounts/index.js'
import { PLATFORM, reminders, translatorLink, TRANSLATOR_URL } from './platform/index.js'

const XP = { right: 10, accents: 8 }
const ASKS = new Set(['pick-en', 'pick-el', 'type-el', 'tiles', 'stress', 'rule', 'tengwar', 'match', 'tw-sound', 'tw-letter', 'tw-pick', 'tw-type'])
const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

// ——— small parts ———

function Leaf({ origin }) {
  return (
    <svg className={`leaf leaf--${origin}`} viewBox="0 0 16 16" aria-hidden="true">
      <path d="M2.5 13.5C2.5 7 6.5 2.5 13.5 2.5c0 7-4.5 11-11 11z" />
      <path className="leaf__vein" d="M3 13 11 5" />
    </svg>
  )
}

function Origin({ item }) {
  const o = ORIGIN[item.origin]
  if (!o) return null
  return (
    <span className={`origin origin--${item.origin}`} title={o.long}>
      <Leaf origin={item.origin} />{o.label}{item.source ? <span className="origin__src"> · {item.source}</span> : null}
    </span>
  )
}

const Elv = ({ children, lang, big }) => <span className={'elv' + (big ? ' elv--big' : '')} lang={lang === 'Q' ? 'qya' : 'sjn'}>{children}</span>
const Out = ({ href, children, className = 'outlink' }) => <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}<span aria-hidden="true"> ↗</span></a>

// numbers that count up to their value
function CountUp({ value, ms = 700 }) {
  const [shown, setShown] = useState(reduced() ? value : 0)
  const from = useRef(0)
  useEffect(() => {
    if (reduced()) { setShown(value); return }
    const start = performance.now()
    const a = from.current
    let raf
    const step = (t) => {
      const k = Math.min(1, (t - start) / ms)
      setShown(Math.round(a + (value - a) * (1 - Math.pow(1 - k, 3))))
      if (k < 1) raf = requestAnimationFrame(step)
      else from.current = value
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, ms])
  return <span className="num">{shown}</span>
}

// a short fall of mallorn leaves when something is finished
function LeafBurst({ run }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!run || reduced()) return
    const c = ref.current
    const ctx = c.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const W = (c.width = c.offsetWidth * dpr)
    const H = (c.height = c.offsetHeight * dpr)
    const colors = ['#dcb862', '#8fcf96', '#e6ece3', '#c9a24e', '#a6dcab']
    const leaves = Array.from({ length: 46 }, () => ({
      x: W / 2 + (Math.random() - 0.5) * W * 0.3, y: H * 0.35,
      vx: (Math.random() - 0.5) * 9 * dpr, vy: (-6 - Math.random() * 7) * dpr,
      r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.25, s: (5 + Math.random() * 6) * dpr,
      c: colors[(Math.random() * colors.length) | 0], sway: Math.random() * 6,
    }))
    let raf
    const t0 = performance.now()
    const draw = (t) => {
      const age = (t - t0) / 1000
      ctx.clearRect(0, 0, W, H)
      for (const l of leaves) {
        l.vy += 0.22 * dpr
        l.vx *= 0.985
        l.x += l.vx + Math.sin(age * 3 + l.sway) * 0.8 * dpr
        l.y += Math.min(l.vy, 4.5 * dpr)
        l.r += l.vr
        ctx.save()
        ctx.globalAlpha = Math.max(0, 1 - age / 2.4)
        ctx.translate(l.x, l.y)
        ctx.rotate(l.r)
        ctx.fillStyle = l.c
        ctx.beginPath()
        ctx.moveTo(-l.s, l.s * 0.2)
        ctx.quadraticCurveTo(-l.s * 0.2, -l.s, l.s, -l.s * 0.2)
        ctx.quadraticCurveTo(l.s * 0.2, l.s, -l.s, l.s * 0.2)
        ctx.fill()
        ctx.restore()
      }
      if (age < 2.4) raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [run])
  return <canvas ref={ref} className="burst" aria-hidden="true" />
}

function Ring({ value, max, size = 92 }) {
  const r = size / 2 - 6
  const c = 2 * Math.PI * r
  const k = Math.min(1, value / max)
  return (
    <svg className={'ring' + (k >= 1 ? ' is-full' : '')} width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} className="ring__track" />
      <circle cx={size / 2} cy={size / 2} r={r} className="ring__fill" strokeDasharray={c} strokeDashoffset={c * (1 - k)} />
    </svg>
  )
}

// ——— the desktop window's own buttons (the OS title bar is turned off) ———

function WindowControls() {
  const [max, setMax] = useState(false)
  useEffect(() => {
    if (PLATFORM !== 'desktop') return
    window.pedo.window.isMaximized().then(setMax)
    return window.pedo.window.onState((s) => setMax(s.maximized))
  }, [])
  if (PLATFORM !== 'desktop') return null
  const w = window.pedo.window
  return (
    <div className="winctl">
      <button className="winctl__btn" onClick={w.minimize} aria-label="Minimise" title="Minimise">
        <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6.5h8" /></svg>
      </button>
      <button className="winctl__btn" onClick={w.toggleMaximize} aria-label={max ? 'Restore' : 'Maximise'} title={max ? 'Restore' : 'Maximise'}>
        <svg viewBox="0 0 12 12" aria-hidden="true">{max ? <><path d="M3.5 4.5h5v5h-5z" /><path d="M5 4.5V3h4.5v4.5H8.5" /></> : <path d="M2.5 2.5h7v7h-7z" />}</svg>
      </button>
      <button className="winctl__btn winctl__btn--close" onClick={w.close} aria-label="Close" title="Close">
        <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 3l6 6M9 3l-6 6" /></svg>
      </button>
    </div>
  )
}

// ——— the shell: a slim title bar on top, an expandable rail of sections on the left ———

const ICON = {
  home: <><path d="M4 19c3-1 4-5 8-6s5-5 8-8" /><circle cx="4" cy="19" r="1.6" /><circle cx="12" cy="13" r="1.6" /><circle cx="20" cy="5" r="1.6" /></>,
  review: <><path d="M20 12a8 8 0 1 1-2.3-5.6" /><path d="M20 4v4h-4" /></>,
  reading: <><path d="M3 5.5c3-1 6-1 9 1v13c-3-2-6-2-9-1z" /><path d="M21 5.5c-3-1-6-1-9 1v13c3-2 6-2 9-1z" /></>,
  notebook: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 3v18M12 8h4M12 12h4" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1" /></>,
  translator: <><path d="M5 19 19 5" /><path d="M9 5h10v10" /></>,
  expand: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
}
const Icon = ({ name }) => <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">{ICON[name]}</svg>

function TitleBar({ state, update, go, profile, onSwitch }) {
  const [menu, setMenu] = useState(false)
  return (
    <header className={'titlebar' + (PLATFORM === 'desktop' ? ' titlebar--desktop' : '')}>
      <button className="logo" onClick={() => go({ name: 'home' })} aria-label="Pedo Edhellen, home">
        <svg className="logo__mark" viewBox="0 0 512 512" aria-hidden="true">
          <path d="M120 400C120 228 228 112 400 112c0 176-110 288-280 288z" />
          <path d="M138 384 352 168" className="logo__vein" />
        </svg>
        <span className="logo__name">Pedo Edhellen</span>
      </button>
      <div className="track" role="radiogroup" aria-label="Course">
        {['S', 'Q', 'R', 'T'].map((t) => (
          <button key={t} role="radio" aria-checked={state.track === t} className={state.track === t ? 'is-on' : ''} onClick={() => { update((s) => ({ ...s, track: t })); go({ name: 'home' }) }}>
            {t === 'R' ? 'Roleplay' : t === 'T' ? 'Tengwar' : LANG_NAME[t]}
          </button>
        ))}
      </div>
      <div className="titlebar__end">
        <div className="me">
          <button className="me__btn" onClick={() => setMenu(!menu)} aria-expanded={menu} aria-label={`Profile: ${profile.name}`} title={profile.name}>{profile.name[0].toUpperCase()}</button>
          {menu && (
            <div className="me__menu" role="menu" onMouseLeave={() => setMenu(false)}>
              <p className="me__name">{profile.name}</p>
              <button role="menuitem" onClick={() => { setMenu(false); go({ name: 'settings' }) }}>Settings</button>
              <button role="menuitem" onClick={() => { setMenu(false); onSwitch() }}>Switch profile</button>
            </div>
          )}
        </div>
        <WindowControls />
      </div>
    </header>
  )
}

function Rail({ view, go, due, onReview }) {
  const [wide, setWide] = useState(() => { try { return localStorage.getItem('pedo-edhellen:rail') === 'wide' } catch { return false } })
  const toggle = () => { const w = !wide; setWide(w); try { localStorage.setItem('pedo-edhellen:rail', w ? 'wide' : 'narrow') } catch { /* fine */ } }
  // a lesson (and its finish screen) belongs to the path; only a review session lights Review
  const current = view.name === 'session' ? (view.kind === 'review' ? 'review' : 'home') : view.name === 'done' ? 'home' : view.name
  const item = (key, icon, label, onClick, badge) => (
    <button key={key} className={'rail__item' + (current === key ? ' is-on' : '')} onClick={onClick} aria-current={current === key ? 'page' : undefined} title={label}>
      <span className="rail__icon"><Icon name={icon} />{badge ? <span className="rail__badge">{badge > 99 ? '99+' : badge}</span> : null}</span>
      <span className="rail__label">{label}</span>
    </button>
  )
  return (
    <nav className={'rail' + (wide ? ' is-wide' : '')} aria-label="Sections">
      <button className="rail__toggle" onClick={toggle} aria-label={wide ? 'Collapse the side bar' : 'Expand the side bar'} title={wide ? 'Collapse' : 'Expand'}><Icon name="expand" /></button>
      {item('home', 'home', 'Path', () => go({ name: 'home' }))}
      {item('review', 'review', 'Review', onReview, due)}
      {item('reading', 'reading', 'Reading room', () => go({ name: 'reading' }))}
      {item('notebook', 'notebook', 'Notebook', () => go({ name: 'notebook' }))}
      <span className="rail__gap" />
      <a className="rail__item rail__item--out" href={TRANSLATOR_URL} target="_blank" rel="noopener noreferrer" title="Lam Edhellen translator">
        <span className="rail__icon"><Icon name="translator" /></span><span className="rail__label">Translator</span>
      </a>
      {item('settings', 'settings', 'Settings', () => go({ name: 'settings' }))}
    </nav>
  )
}

// a slim title strip for screens without the main header (sign-in, loading)
function TitleStrip() {
  if (PLATFORM !== 'desktop') return null
  return (
    <div className="strip">
      <span className="strip__name"><Leaf origin="tolkien" />Pedo Edhellen</span>
      <WindowControls />
    </div>
  )
}

// ——— first run: profiles and the goals quiz ———

function Welcome({ onSignedIn }) {
  const [profiles, setProfiles] = useState(null)
  const [mode, setMode] = useState('pick')
  const [name, setName] = useState('')
  const [pw, setPw] = useState('')
  const [unlock, setUnlock] = useState(null)
  const [err, setErr] = useState('')
  useEffect(() => { auth.listProfiles().then((p) => { setProfiles(p); if (!p.length) setMode('new') }) }, [])
  const create = async (e) => {
    e.preventDefault()
    try { onSignedIn(await auth.signUp({ name, password: pw || undefined })) } catch (x) { setErr(x.message) }
  }
  const open = async (p, password) => {
    try { onSignedIn(await auth.signIn(p.id, password)) } catch (x) { setErr(x.message) }
  }
  if (!profiles) return null
  return (
    <div className="welcome">
      <p className="welcome__elv"><Elv lang="S" big>Suilad!</Elv></p>
      <p className="welcome__lit">“Greetings!” Pedo Edhellen teaches Tolkien’s Elvish, a few minutes at a time.</p>
      {mode === 'pick' && (
        <div className="card welcome__card">
          <span className="label">Who is learning?</span>
          <ul className="profiles">
            {profiles.map((p) => (
              <li key={p.id}>
                {unlock?.id === p.id ? (
                  <form className="unlock" onSubmit={(e) => { e.preventDefault(); open(p, pw) }}>
                    <input id="unlock-password" type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder={`Password for ${p.name}`} autoFocus aria-label="Password" />
                    <button className="btn btn--primary" type="submit">Open</button>
                  </form>
                ) : (
                  <button className="profile" onClick={() => (p.hasPassword ? (setUnlock(p), setPw(''), setErr('')) : open(p))}>
                    <span className="profile__init" aria-hidden="true">{p.name[0].toUpperCase()}</span>{p.name}{p.hasPassword && <span className="hint"> · password</span>}
                  </button>
                )}
              </li>
            ))}
          </ul>
          {err && <p className="error">{err}</p>}
          <button className="btn" onClick={() => { setMode('new'); setErr(''); setPw('') }}>Add a profile</button>
        </div>
      )}
      {mode === 'new' && (
        <form className="card welcome__card" onSubmit={create}>
          <span className="label">Make your profile</span>
          <label className="field">Your name<input id="new-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus maxLength={40} autoComplete="nickname" /></label>
          <label className="field">Password <span className="hint">(optional, for a shared computer)</span><input id="new-password" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" /></label>
          <p className="hint">Profiles live on this device for now. Your progress stays separate from anyone else’s here.</p>
          {err && <p className="error">{err}</p>}
          <div className="row">
            <button className="btn btn--primary" type="submit" disabled={!name.trim()}>Start</button>
            {profiles.length > 0 && <button type="button" className="btn btn--quiet" onClick={() => setMode('pick')}>Back</button>}
          </div>
        </form>
      )}
    </div>
  )
}

function Quiz({ onDone, onSkip }) {
  const [answers, setAnswers] = useState({})
  const [i, setI] = useState(0)
  const steps = QUIZ.filter((q) => !q.when || q.when(answers))
  const q = steps[i]
  const result = i >= steps.length ? recommend(answers) : null
  const pick = (opt) => {
    if (q.multi) {
      const cur = answers[q.id] || []
      setAnswers({ ...answers, [q.id]: cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt] })
    } else {
      setAnswers({ ...answers, [q.id]: opt })
      setTimeout(() => setI((n) => n + 1), reduced() ? 0 : 220)
    }
  }
  if (result) {
    return (
      <div className="card quiz quiz--result">
        <span className="label">Your path</span>
        <h2 className="card__h">Start with {LANG_NAME[result.track]}{result.focus ? ', plus the Roleplay phrasebook' : ''}</h2>
        <ul className="why">{result.why.map((w) => <li key={w}>{w}</li>)}</ul>
        <p className="hint">Daily goal: {result.goal} points, about {result.minutes} minutes. You can change any of this later in Settings.</p>
        <div className="row">
          <button className="btn btn--primary" onClick={() => onDone(answers, result)}>Begin</button>
          <button className="btn btn--quiet" onClick={() => { setI(0); setAnswers({}) }}>Start the questions again</button>
        </div>
      </div>
    )
  }
  const chosen = answers[q.id]
  return (
    <div className="card quiz" key={q.id}>
      <div className="quiz__top">
        <span className="label">Question {i + 1} of {steps.length}</span>
        <button className="btn btn--quiet" onClick={onSkip}>Skip</button>
      </div>
      <h2 className="card__h">{q.q}</h2>
      {q.multi && <p className="hint">Choose as many as you like.</p>}
      <ul className="options">
        {q.options.map((o) => {
          const on = q.multi ? chosen?.includes(o.id) : chosen === o.id
          return (
            <li key={o.id}>
              <button className={'option' + (on ? ' is-on' : '')} aria-pressed={on} onClick={() => pick(o.id)}>
                <strong>{o.label}</strong>{o.hint && <span>{o.hint}</span>}
              </button>
            </li>
          )
        })}
      </ul>
      <div className="row">
        {i > 0 && <button className="btn btn--quiet" onClick={() => setI(i - 1)}>Back</button>}
        {q.multi && <button className="btn btn--primary" disabled={!chosen?.length} onClick={() => setI(i + 1)}>Next</button>}
      </div>
    </div>
  )
}

// ——— home ———

function Week({ info }) {
  const names = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  return (
    <ol className="week" aria-label="This week">
      {info.week.map((d, k) => (
        <li key={d.day} style={{ '--d': k }} className={`week__day is-${d.state}`} title={{ done: 'Practised', rested: 'Rest day (covered)', today: 'Today', future: '', missed: '' }[d.state]}>
          <span className="week__leaf"><Leaf origin={d.state === 'done' ? 'tolkien' : 'early'} /></span>
          <span className="week__name">{names[k]}</span>
        </li>
      ))}
    </ol>
  )
}

function Home({ course, state, profile, onOpen, onReview, onRead }) {
  const due = dueKeys(state.srs, course.lang).filter((k) => course.byKey.has(k))
  const learned = Object.keys(state.srs).filter((k) => course.byKey.has(k)).length
  const day = today()
  const todayXp = state.days[day] || 0
  const goal = state.settings.goal
  const info = streakInfo(state.practiceDays, day)
  const next = course.lessons.find((l) => !state.lessons[l.id]?.done)
  const done = course.lessons.filter((l) => state.lessons[l.id]?.done).length
  const challenges = todaysChallenges(state, course, day, profile.id)
  const hour = new Date().getHours()

  return (
    <div className="home">
      <section className="hello">
        <p className="hello__elv"><Elv lang="S">{hour < 5 || hour >= 21 ? 'Elen síla lúmenn’ omentielvo' : 'Mae govannen'}</Elv>, {profile.name}</p>
        <p className="hello__lit">{hour < 5 || hour >= 21 ? '“A star shines on the hour of our meeting”, Quenya' : '“Well met”, as Glorfindel greets Aragorn'}</p>
      </section>

      <section className="today" aria-label="Today">
        <div className="today__ring">
          <Ring value={todayXp} max={goal} />
          <div className="today__ringtext"><CountUp value={todayXp} /><span>of {goal}</span></div>
        </div>
        <div className="today__main">
          <Week info={info} />
          <p className="today__line">
            <strong><CountUp value={info.total} /></strong> {info.total === 1 ? 'day' : 'days'} practised
            {info.length > 1 && <> · {info.length}-day run</>}
            <span className="today__soft"> · {info.freezesLeft} of {FREEZES_PER_WEEK} rest days left this week</span>
          </p>
          <div className="today__actions">
            {next && <button className="btn btn--primary btn--glow" onClick={() => onOpen(next.id)}>{done ? 'Continue' : 'Start'}: {next.title}</button>}
            <button className="btn" onClick={onReview} disabled={!due.length}>{due.length ? `Review ${due.length}` : 'Nothing to review yet'}</button>
          </div>
        </div>
      </section>

      {course.id === 'T' && <TengwarDesk />}

      <section className="challenges" aria-label="Today’s challenges">
        <div className="section-head">
          <h2>Today’s challenges</h2>
          <span className="hint">Optional. New ones tomorrow.</span>
        </div>
        <ul>
          {challenges.map((c) => {
            const p = progressOf(c, state.daily, day)
            const complete = p >= c.goal
            return (
              <li key={c.id} className={'challenge' + (complete ? ' is-done' : '')}>
                <span className="challenge__mark"><Leaf origin={complete ? 'tolkien' : 'early'} /></span>
                <div className="challenge__text">
                  <strong>{c.title}</strong>
                  <span>{c.detail}</span>
                </div>
                <span className="challenge__count">{complete ? 'Done' : `${p}/${c.goal}`}</span>
                {c.id === 'read' && !complete && <button className="btn btn--quiet" onClick={onRead}>Open</button>}
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-label="Your path">
        <div className="section-head">
          <h2>Your path</h2>
          <span className="hint"><CountUp value={learned} /> learned · {done} of {course.lessons.length} lessons</span>
        </div>
        <ol className="path">
          {course.units.map((u, ui) => (
            <li key={u.title} className="unit" style={{ '--i': ui }}>
              <h3 className="unit__title"><span className="unit__n">{ui + 1}</span>{u.title}</h3>
              <ul className="unit__lessons">
                {u.lessons.map((l) => {
                  const rec = state.lessons[l.id]
                  const isNext = next?.id === l.id
                  return (
                    <li key={l.id}>
                      <button className={'lesson' + (rec?.done ? ' is-done' : '') + (isNext ? ' is-next' : '')} onClick={() => onOpen(l.id)}>
                        <span className="lesson__mark" aria-hidden="true"><Leaf origin={rec?.done ? 'tolkien' : 'early'} /></span>
                        <span className="lesson__text">
                          <span className="lesson__title">{l.title}</span>
                          <span className="lesson__meta">{l.tengwar ? 'Read the letters' : course.id === 'T' ? `${l.items.length} to read` : `${l.items.length} to learn`}{rec?.done ? ` · best ${rec.score}%` : isNext ? ' · up next' : ''}</span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}

// ——— steps ———

function Teach({ note, lang }) {
  return (
    <div className="card card--teach">
      <span className="label">Learn</span>
      <h2 className="card__h">{note.h}</h2>
      <p className="card__p">{note.p}</p>
      {note.ex.length > 0 && (
        <ul className="examples">
          {note.ex.map(([el, en]) => <li key={el}><Elv lang={lang}>{el}</Elv><span className="examples__en">{en}</span></li>)}
        </ul>
      )}
    </div>
  )
}

const LANG_TAG = { S: 'Sindarin', Q: 'Quenya', E: 'English' }

function LearnTengwar({ item }) {
  const what = { letter: 'New letter', mark: 'New sign', number: 'Number', tword: LANG_TAG[item.lang] ? `Read it · ${LANG_TAG[item.lang]}` : 'Read it' }[item.kind]
  return (
    <div className="card card--learn">
      <span className="label">{what}</span>
      <p className="tengwar tengwar--hero" aria-label="In Tengwar">{item.tengwar}</p>
      {item.kind === 'letter' ? (
        <>
          <p className="learn__el"><span className="elv elv--big">{item.el}</span></p>
          <p className="learn__say"><span className="label">Sound</span> {item.en}</p>
        </>
      ) : item.kind === 'tword' ? (
        <>
          <p className="learn__el"><Elv lang={item.lang} big>{item.el}</Elv></p>
          {item.lang !== 'E' && <p className="learn__en">“{item.en}”</p>}
        </>
      ) : (
        <p className="learn__el"><span className="elv elv--big">{item.el}</span>{item.en !== item.el && <span className="learn__lit"> · {item.en}</span>}</p>
      )}
      {item.note && <p className="learn__note">{item.note}</p>}
      <div className="learn__foot"><Origin item={item} /></div>
    </div>
  )
}

function Learn({ item }) {
  if (item.key.startsWith('T:')) return <LearnTengwar item={item} />
  return (
    <div className="card card--learn">
      <span className="label">New {item.kind === 'word' ? 'word' : 'line'}{item.lang === 'Q' && item.kind !== 'word' ? ' · Quenya' : ''}</span>
      <p className="learn__el"><Elv lang={item.lang} big>{item.el}</Elv></p>
      <p className="tengwar" aria-label="In Tengwar">{item.tengwar}</p>
      <p className="learn__say"><span className="label">Say it</span> {item.say}</p>
      <p className="learn__en">“{item.en}”{item.literal && item.literal !== item.en ? <span className="learn__lit"> · literally “{item.literal}”</span> : null}</p>
      {item.parts && (
        <ul className="parts">{item.parts.map((p, i) => <li key={i} style={{ '--i': i }}><Elv lang={item.lang}>{p.el}</Elv><span>{p.en}</span></li>)}</ul>
      )}
      {item.who && <p className="learn__who">{item.who}</p>}
      <div className="learn__foot">
        <Origin item={item} />
        <Out href={translatorLink(item.el, item.lang)}>Open in Lam Edhellen</Out>
      </div>
      {item.note && item.origin === 'fan' && <p className="learn__note">{item.note}.</p>}
    </div>
  )
}

const PROMPT = {
  'pick-en': 'What does this mean?', 'pick-el': 'Which is the Elvish?', 'type-el': 'Write this in Elvish',
  tiles: 'Build it in Elvish', stress: 'Which syllable takes the stress?', tengwar: 'Which word do these letters spell?',
  match: 'Match the pairs',
  'tw-sound': 'What is this letter?', 'tw-letter': 'Which letter is this?', 'tw-pick': 'Which is it in Tengwar?', 'tw-type': 'Write it in Tengwar',
}

function Choices({ step, onAnswer, answered, lang }) {
  const elvish = step.t === 'pick-el' || step.t === 'tengwar' || step.t === 'rule'
  useEffect(() => {
    const key = (e) => {
      if (answered || e.target.tagName === 'INPUT') return
      const n = Number(e.key)
      if (n >= 1 && n <= step.options.length) onAnswer(step.options[n - 1])
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [step, answered, onAnswer])
  return (
    <ul className="choices">
      {step.options.map((o, i) => {
        const st = answered ? (o === step.answer ? ' is-right' : o === answered.given ? ' is-wrong' : ' is-dim') : ''
        return (
          <li key={o} style={{ '--i': i }}>
            <button className={'choice' + st} disabled={!!answered} onClick={() => onAnswer(o)}>
              <span className="choice__n">{i + 1}</span>
              {step.tengwarOptions ? <span className="tengwar tengwar--choice">{o}</span> : elvish ? <Elv lang={step.item?.lang || lang}>{o}</Elv> : <span className={step.t === 'stress' ? 'choice__say' : ''}>{o}</span>}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function Ask({ step, onAnswer, answered, lang }) {
  const it = step.item
  const lg = it?.lang || lang
  if (step.t === 'rule') {
    return (
      <div className="card">
        <span className="label">{step.ask}</span>
        <p className="ask__show"><Elv lang={lang} big>{step.q}</Elv> <span className="ask__gloss">({step.gloss})</span></p>
        <Choices step={step} onAnswer={onAnswer} answered={answered} lang={lang} />
      </div>
    )
  }
  if (step.t.startsWith('tw-')) {
    const tag = LANG_TAG[it.lang] ? ` · ${LANG_TAG[it.lang]}` : ''
    return (
      <div className="card">
        <span className="label">{PROMPT[step.t]}</span>
        {step.t === 'tw-sound' && <p className="tengwar tengwar--ask" aria-label="Letter to name">{it.tengwar}</p>}
        {step.t !== 'tw-sound' && <p className="ask__en">{it.kind === 'letter' ? <><strong>{it.en}</strong><span className="ask__gloss"> · {it.el}</span></> : <><Elv lang={it.lang}>{it.el}</Elv><span className="ask__gloss">{tag}</span></>}</p>}
        {step.t === 'tw-type' ? <TengwarTyper onAnswer={onAnswer} answered={answered} /> : <Choices step={step} onAnswer={onAnswer} answered={answered} lang={lang} />}
      </div>
    )
  }
  return (
    <div className="card">
      <span className="label">{PROMPT[step.t]}</span>
      {step.t === 'pick-en' && <p className="ask__show"><Elv lang={lg} big>{it.el}</Elv></p>}
      {step.t === 'stress' && <p className="ask__show"><Elv lang={lg} big>{it.el}</Elv> <span className="ask__gloss">“{it.en}”</span></p>}
      {step.t === 'tengwar' && <p className="tengwar tengwar--ask" aria-label="Tengwar to read">{it.tengwar}</p>}
      {(step.t === 'pick-el' || step.t === 'type-el' || step.t === 'tiles') && <p className="ask__en">“{it.en}”{lg === 'Q' && lang !== 'Q' ? <span className="ask__gloss"> · Quenya</span> : null}</p>}
      {step.t === 'type-el' ? <Typer onAnswer={onAnswer} answered={answered} lang={lg} />
        : step.t === 'tiles' ? <Tiles step={step} onAnswer={onAnswer} answered={answered} lang={lg} />
          : <Choices step={step} onAnswer={onAnswer} answered={answered} lang={lang} />}
    </div>
  )
}

function Typer({ onAnswer, answered, lang }) {
  const [v, setV] = useState('')
  const input = useRef(null)
  useEffect(() => { input.current?.focus() }, [])
  return (
    <form className="typer" onSubmit={(e) => { e.preventDefault(); if (!answered && v.trim()) onAnswer(v) }}>
      <input id="type-answer" ref={input} value={v} onChange={(e) => setV(e.target.value)} disabled={!!answered}
        lang={lang === 'Q' ? 'qya' : 'sjn'} autoComplete="off" autoCapitalize="off" spellCheck="false" placeholder="Type the Elvish…" aria-label="Your answer" />
      {!answered && <button className="btn btn--primary" type="submit" disabled={!v.trim()}>Check</button>}
      <p className="hint">Accent marks can be left off; you will be shown where they go.</p>
    </form>
  )
}

function Tiles({ step, onAnswer, answered, lang }) {
  const [picked, setPicked] = useState([])
  const words = picked.map((i) => step.bank[i])
  return (
    <div className="tiles">
      <div className="tiles__answer" aria-label="Your sentence">
        {words.length ? picked.map((i, k) => (
          <button key={k} className="tile tile--placed" disabled={!!answered} onClick={() => setPicked(picked.filter((_, j) => j !== k))}><Elv lang={lang}>{step.bank[i]}</Elv></button>
        )) : <span className="tiles__empty">Tap the words in order</span>}
      </div>
      <div className="tiles__bank">
        {step.bank.map((w, i) => (
          <button key={i} className="tile" disabled={!!answered || picked.includes(i)} onClick={() => setPicked([...picked, i])}><Elv lang={lang}>{w}</Elv></button>
        ))}
      </div>
      {!answered && <button className="btn btn--primary" disabled={!words.length} onClick={() => onAnswer(words)}>Check</button>}
    </div>
  )
}

function Match({ step, onDone, lang }) {
  const right = useMemo(() => [...step.pairs].sort((a, b) => a.en.localeCompare(b.en)), [step])
  const [sel, setSel] = useState(null)
  const [done, setDone] = useState([])
  const [miss, setMiss] = useState(null)
  const errors = useRef(0)
  const pickEn = (it) => {
    if (!sel || done.includes(it.key)) return
    if (sel === it.key) {
      const d = [...done, it.key]
      setDone(d); setSel(null)
      if (d.length === step.pairs.length) setTimeout(() => onDone(errors.current === 0), 380)
    } else { setMiss(it.key); errors.current++; setTimeout(() => setMiss(null), 450) }
  }
  return (
    <div className="card">
      <span className="label">{PROMPT.match}</span>
      <div className="match">
        <ul>{step.pairs.map((it) => <li key={it.key}><button className={'choice' + (done.includes(it.key) ? ' is-right' : sel === it.key ? ' is-sel' : '')} disabled={done.includes(it.key)} onClick={() => setSel(it.key)}><Elv lang={it.lang || lang}>{it.el}</Elv></button></li>)}</ul>
        <ul>{right.map((it) => <li key={it.key}><button className={'choice' + (done.includes(it.key) ? ' is-right' : miss === it.key ? ' is-wrong' : '')} disabled={done.includes(it.key)} onClick={() => pickEn(it)}>{it.en}</button></li>)}</ul>
      </div>
    </div>
  )
}

function judge(step, given) {
  if (step.t === 'type-el') return checkTyped(given, step.answer)
  // plain silmë where the turned-over form belongs counts, and is pointed out like a missing accent
  if (step.t === 'tw-type') { const c = checkTengwar(given, step.answer); return c === 'turned' ? 'accents' : c }
  if (step.t === 'tiles') return sameWords(given, step.answer) ? 'right' : 'wrong'
  return given === step.answer ? 'right' : 'wrong'
}

const PRAISE = ['Right.', 'Yes.', 'Well done.', 'Exactly.', 'Correct.']

function Scribe({ text, lang }) {
  const tengwar = toTengwar(text, lang)
  return (
    <div className="card card--learn">
      <span className="label">Your name in Tengwar</span>
      <p className="tengwar tengwar--hero" aria-label="In Tengwar">{tengwar}</p>
      <p className="learn__el"><span className="elv elv--big">{text}</span></p>
      <p className="hint">Spelt letter by letter, as Tolkien wrote English. Try other spellings, or anything else, at the Write in Tengwar desk on the Tengwar page.</p>
      <TakeAway tengwar={tengwar} latin={text} />
    </div>
  )
}

function Session({ title, lang, initial, onFinish, onQuit }) {
  const [queue, setQueue] = useState(initial)
  const [i, setI] = useState(0)
  const [answered, setAnswered] = useState(null)
  const [log, setLog] = useState([])
  const [run, setRun] = useState(0)
  const step = queue[i]
  const asks = queue.filter((s) => ASKS.has(s.t)).length
  const pct = Math.round((i / queue.length) * 100)

  const answer = useCallback((given) => {
    if (answered) return
    const result = judge(step, given)
    setAnswered({ given, result, praise: PRAISE[(Math.random() * PRAISE.length) | 0] })
    setRun((r) => (result === 'wrong' ? 0 : r + 1))
    setLog((l) => [...l, { key: step.item?.key, result, t: step.t, kind: step.item?.kind }])
    if (result === 'wrong' && !step.retry) setQueue((q) => [...q, { ...step, retry: true }])
  }, [answered, step])
  const next = () => {
    setAnswered(null)
    if (i + 1 >= queue.length) onFinish(log)
    else setI(i + 1)
  }
  useEffect(() => {
    const key = (e) => {
      if (e.key !== 'Enter' || e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return
      if (answered || step.t === 'teach' || step.t === 'learn') { e.preventDefault(); next() }
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  })

  const plain = step.t === 'teach' || step.t === 'learn' || step.t === 'scribe'
  return (
    <div className="session">
      <div className="session__top">
        <button className="btn btn--quiet" onClick={onQuit} aria-label="Leave this lesson">Leave</button>
        <div className="meter meter--session" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${pct}%` }} /></div>
        {run >= 3 && <span className="run" key={run}>{run} in a row</span>}
      </div>
      <div className={'session__stage' + (answered ? ` is-${answered.result}` : '')} key={i}>
        {step.t === 'teach' && <Teach note={step.note} lang={lang} />}
        {step.t === 'learn' && <Learn item={step.item} />}
        {step.t === 'scribe' && <Scribe text={step.text} lang={step.lang} />}
        {step.t === 'match' && <Match step={step} lang={lang} onDone={(clean) => { setLog((l) => [...l, { key: null, result: clean ? 'right' : 'accents', t: 'match' }]); next() }} />}
        {!plain && step.t !== 'match' && <Ask step={step} onAnswer={answer} answered={answered} lang={lang} />}
      </div>
      <div className={'session__foot' + (answered ? ` is-${answered.result}` : '')} aria-live="polite">
        {answered ? (
          <>
            <div className="verdict">
              <strong>{answered.result === 'right' ? answered.praise : answered.result === 'accents' ? (step.t === 'tw-type' ? 'Right. When a vowel sits on silmë or essë, it is turned over.' : 'Right. Mind the accents.') : 'Not quite.'}</strong>
              {answered.result !== 'right' && step.t !== 'rule' && step.item?.key.startsWith('T:') && (
                <span> <span className="tengwar tengwar--inline">{step.item.tengwar}</span> · {step.item.kind === 'letter' ? `${step.item.el}, ${step.item.en}` : step.item.el}</span>
              )}
              {answered.result !== 'right' && step.t !== 'rule' && step.item && !step.item.key.startsWith('T:') && (
                <span> <Elv lang={step.item.lang}>{step.item.el}</Elv> · “{step.item.en}”{step.t === 'stress' ? ` · ${step.item.say}` : ''}</span>
              )}
              {answered.result !== 'right' && step.t === 'rule' && <span> <Elv lang={lang}>{step.q} → {step.answer}</Elv></span>}
              {answered.result === 'wrong' && !step.retry && <span className="verdict__again"> It will come back at the end.</span>}
            </div>
            <button className="btn btn--primary" onClick={next} autoFocus>Continue</button>
          </>
        ) : plain ? (
          <button className="btn btn--primary" onClick={next} autoFocus>{step.t === 'teach' ? 'Got it' : step.t === 'scribe' ? 'Finish' : 'Next'}</button>
        ) : (
          <span className="hint">{asks} exercises · {step.t === 'tw-type' ? 'type with the Annatar keys' : '1–4 to choose'} · Enter to continue</span>
        )}
      </div>
    </div>
  )
}

function Done({ summary, onHome, onNext }) {
  return (
    <div className="done">
      <LeafBurst run />
      <div className="card card--done">
        <span className="label">{summary.title}</span>
        <h2 className="card__h">{summary.score >= 90 ? 'Excellent work.' : summary.score >= 60 ? 'Well done.' : 'Done. The ones you missed will come back in review.'}</h2>
        <dl className="stats">
          <div><dt>Score</dt><dd><CountUp value={summary.score} />%</dd></div>
          <div><dt>Points</dt><dd>+<CountUp value={summary.xp} /></dd></div>
          <div><dt>New</dt><dd><CountUp value={summary.learned} /></dd></div>
        </dl>
        {summary.finished.length > 0 && (
          <ul className="earned">{summary.finished.map((c) => <li key={c.id}><Leaf origin="tolkien" />Challenge done: {c.title}</li>)}</ul>
        )}
        {summary.goalReached && <p className="earned__goal">Today’s goal reached. Anything more is a bonus.</p>}
        <div className="row">
          {onNext && <button className="btn btn--primary" onClick={onNext}>Next lesson</button>}
          <button className={'btn' + (onNext ? '' : ' btn--primary')} onClick={onHome}>Back to the path</button>
        </div>
      </div>
    </div>
  )
}

// ——— reading room ———

function Reading({ lang, state, onRead }) {
  const [open, setOpen] = useState(null)
  const known = useMemo(() => knownForms(state.srs, lang), [state.srs, lang])
  const lines = useMemo(() => READING.filter((l) => l.lang === lang).map((l) => {
    const k = l.words.filter((w) => known.has(w.key)).length
    return { ...l, known: k, pct: Math.round((k / l.words.length) * 100) }
  }).sort((a, b) => (b.famous - a.famous) || (b.pct - a.pct)), [lang, known])
  const full = lines.filter((l) => l.pct === 100).length
  const shown = lines.slice(0, 60)
  return (
    <div className="reading">
      <p className="reading__sum">You can fully read <strong><CountUp value={full} /></strong> of Tolkien’s {lines.length} {LANG_NAME[lang]} lines here, and part of {lines.filter((l) => l.pct > 0 && l.pct < 100).length} more. Tap a line for Tolkien’s own English.</p>
      <ul className="lines">
        {shown.map((l) => (
          <li key={l.el}>
            <button className={'line' + (open === l.el ? ' is-open' : '')} onClick={() => { if (open !== l.el) onRead(); setOpen(open === l.el ? null : l.el) }}>
              <span className="line__el" lang={lang === 'Q' ? 'qya' : 'sjn'}>
                {l.words.map((w, k) => <span key={k} className={known.has(w.key) ? 'is-known' : ''}>{w.w} </span>)}
              </span>
              <span className="line__pct" aria-label={`${l.pct}% known`}><span style={{ width: `${l.pct}%` }} /></span>
              {open === l.el && <span className="line__en">“{l.en}”{l.who ? ` · ${l.who}` : ''} · <cite>{l.where}</cite></span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ——— notebook ———

function Notebook({ course, state }) {
  const [q, setQ] = useState('')
  const [tab, setTab] = useState('words')
  const learned = course.lessons.filter((l) => !l.tengwar).flatMap((l) => l.items).filter((it, k, all) => state.srs[it.key] && all.findIndex((x) => x.key === it.key) === k)
  const n = q.trim().toLowerCase()
  const shown = learned.filter((it) => !n || it.el.toLowerCase().includes(n) || it.en.toLowerCase().includes(n))
  const notes = course.lessons.filter((l) => state.lessons[l.id]?.done && !l.tengwar).flatMap((l) => l.teach.map((t) => ({ ...t, from: l.title })))
  return (
    <div className="notebook">
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'words'} className={tab === 'words' ? 'is-on' : ''} onClick={() => setTab('words')}>Words and lines ({learned.length})</button>
        <button role="tab" aria-selected={tab === 'notes'} className={tab === 'notes' ? 'is-on' : ''} onClick={() => setTab('notes')}>Grammar notes ({notes.length})</button>
      </div>
      {tab === 'words' ? (
        <>
          {learned.length > 0 && <input id="notebook-search" className="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Elvish or English" aria-label="Search your notebook" />}
          {!learned.length && <p className="empty">Words you learn appear here, with how well you know each one. Finish your first lesson to start the notebook.</p>}
          <ul className="entries">
            {shown.map((it) => (
              <li key={it.key} className="entry">
                <div className="entry__main"><Elv lang={it.lang}>{it.el}</Elv><span className="entry__en">{it.en}</span></div>
                <div className="entry__side">
                  <span className="entry__say">{it.say}</span>
                  <span className="strength" title="How well you know it"><span style={{ width: `${strength(state.srs[it.key]) * 100}%` }} /></span>
                  <Origin item={it} />
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          {!notes.length && <p className="empty">The grammar from each lesson you finish is collected here, so you can read it again.</p>}
          <ul className="notes">
            {notes.map((t, k) => (
              <li key={k} className="note">
                <span className="label">{t.from}</span>
                <h3>{t.h}</h3>
                <p>{t.p}</p>
                {t.ex.length > 0 && <p className="note__ex">{t.ex.map(([el, en]) => <span key={el}><Elv lang={course.lang}>{el}</Elv> “{en}”</span>)}</p>}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

// ——— settings ———

function Settings({ state, update, profile, sync, onRetakeQuiz, onSwitch, onReset }) {
  const [sure, setSure] = useState(false)
  const [perm, setPerm] = useState('')
  const r = state.settings.reminder
  useEffect(() => { reminders.permission().then(setPerm) }, [])
  const set = (patch) => update((s) => ({ ...s, settings: { ...s.settings, ...patch } }))
  return (
    <div className="settings">
      <section className="card">
        <span className="label">Daily goal</span>
        <div className="segmented" role="radiogroup" aria-label="Daily goal">
          {[[30, 'Light · 5 min'], [60, 'Steady · 10 min'], [120, 'Keen · 20 min']].map(([g, label]) => (
            <button key={g} role="radio" aria-checked={state.settings.goal === g} className={state.settings.goal === g ? 'is-on' : ''} onClick={() => set({ goal: g })}>{label}</button>
          ))}
        </div>
        <p className="hint">Missing the goal costs nothing. It only shapes how full the ring looks.</p>
      </section>

      <section className="card">
        <span className="label">Reminder</span>
        {reminders.supported() ? (
          <>
            <label className="switch"><input id="reminder-on" type="checkbox" checked={r.enabled} onChange={async (e) => {
              const on = e.target.checked
              if (on && perm !== 'granted') setPerm(await reminders.request())
              set({ reminder: { ...r, enabled: on } })
            }} /> One gentle reminder a day</label>
            <label className="field field--inline">At <input id="reminder-time" type="time" value={r.time} onChange={(e) => set({ reminder: { ...r, time: e.target.value } })} disabled={!r.enabled} /></label>
            <p className="hint">Only sent if you have not practised that day and there is something useful to do. It never mentions your streak.{PLATFORM === 'desktop' ? ' The app keeps running in the tray so the reminder can arrive; quit from the tray icon to stop it.' : ' In the browser version it can only arrive while the app is open or installed and running in the background.'}</p>
            {perm === 'denied' && <p className="error">Notifications are blocked for this app in your system settings.</p>}
            <button className="btn" onClick={() => reminders.test({ title: 'Pedo Edhellen', body: 'This is how a reminder will look.' })}>Send a test reminder</button>
          </>
        ) : <p className="hint">Reminders work in the desktop app and the installed web app.</p>}
      </section>

      <section className="card">
        <span className="label">What you are learning for</span>
        <p>{state.quiz ? `You told us: ${state.quiz.use?.join(', ') || 'not answered'}.` : 'You skipped the questions.'}</p>
        <button className="btn" onClick={onRetakeQuiz}>Answer the questions again</button>
      </section>

      <section className="card">
        <span className="label">Profile</span>
        <p>Signed in as <strong>{profile.name}</strong> on this device. {sync === 'account' ? 'Progress also saved to your claude.ai account.' : ''}</p>
        <div className="row">
          <button className="btn" onClick={onSwitch}>Switch profile</button>
          {sure ? (
            <><span>Erase all of {profile.name}’s progress?</span><button className="btn btn--danger" onClick={() => { onReset(); setSure(false) }}>Erase</button><button className="btn btn--quiet" onClick={() => setSure(false)}>Keep it</button></>
          ) : <button className="btn btn--quiet" onClick={() => setSure(true)}>Start again from nothing</button>}
        </div>
      </section>

      <section className="about">
        <h2>How this course works</h2>
        <p>Each lesson teaches a few words or one piece of grammar, then tests you on them with instant feedback, because recalling something is what makes it stick. Everything you learn comes back on a widening schedule (tomorrow, then two days, four, a week…), and a miss comes back the same day. Exercises move from recognising a word to writing it, which builds the kind of knowledge you can actually use.</p>
        <p>There are no hearts, gems or leagues. Your run of days has five rest days built into every week, and the number that matters most, days practised, never goes down.</p>
        <h3>Where every word comes from</h3>
        <ul className="legend">{Object.entries(ORIGIN).map(([k, o]) => <li key={k}><span className={`origin origin--${k}`}><Leaf origin={k} />{o.label}</span><span>{o.long}.</span></li>)}</ul>
        <p>The lessons use the same checked vocabulary and grammar as the <Out href={TRANSLATOR_URL}>Lam Edhellen translator</Out>, and a test fails if a lesson teaches a line the translator would not stand behind. Any claim that Tolkien left no word for something is checked against Eldamo, across every stage of his languages. Vocabulary: Eldamo by Paul Strack (CC BY 4.0). Tengwar font: Alcarin Tengwar by Toshi Omagari (SIL OFL). The Elvish languages are J.R.R. Tolkien’s; this is an unofficial fan project.</p>
      </section>
    </div>
  )
}

// ——— the app ———

export default function App() {
  const [profile, setProfile] = useState(undefined)
  useEffect(() => { auth.current().then((p) => setProfile(p || null)) }, [])
  if (profile === undefined) return <div className="app app--loading"><TitleStrip /></div>
  if (!profile) return <div className="app"><TitleStrip /><main className="main"><Welcome onSignedIn={setProfile} /></main></div>
  return <Signed key={profile.id} profile={profile} onSwitch={async () => { await auth.signOut(); setProfile(null) }} />
}

function Signed({ profile, onSwitch }) {
  const [state, update, sync] = useProgress(profile.id)
  const [view, setView] = useState({ name: 'home' })
  useEffect(() => { if (state && !state.quiz && view.name === 'home' && !state.quizSkipped) setView({ name: 'quiz' }) }, [state, view.name])

  // the reminder always says something current and useful, and nothing about streaks
  useEffect(() => {
    if (!state) return
    const course = COURSES[state.track] || COURSES.S
    const due = dueKeys(state.srs, course.lang).filter((k) => course.byKey.has(k)).length
    const next = course.lessons.find((l) => !state.lessons[l.id]?.done)
    const body = due ? `${due} things you have learned are ready to review.` : next ? `Next up: ${next.title}.` : 'A few minutes of review keeps it fresh.'
    reminders.schedule({ ...state.settings.reminder, title: 'Pedo Edhellen', body, practisedToday: state.practiceDays.includes(today()) })
  }, [state])

  if (!state) return <div className="app app--loading"><TitleStrip /></div>
  const course = COURSES[state.track] || COURSES.S
  const go = (v) => { setView(v); document.querySelector('.shell .main')?.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' }) }

  const openLesson = (id) => {
    const lesson = course.lessons.find((l) => l.id === id)
    const steps = course.id === 'T' ? buildTengwarLesson(lesson, course, Date.now(), { name: profile.name }) : buildLesson(lesson, course)
    go({ name: 'session', kind: 'lesson', lesson, steps, title: lesson.title })
  }
  const openReview = () => {
    const keys = dueKeys(state.srs, course.lang).filter((k) => course.byKey.has(k)).slice(0, 15)
    const build = course.id === 'T' ? buildTengwarReview : buildReview
    if (keys.length) go({ name: 'session', kind: 'review', steps: build(keys, course, Date.now(), state.srs), title: 'Review' })
  }

  const finish = (log) => {
    const day = today()
    const asked = log.filter((x) => x.result)
    const right = asked.filter((x) => x.result !== 'wrong').length
    const score = asked.length ? Math.round((right / asked.length) * 100) : 100
    const xp = asked.reduce((s, x) => s + (XP[x.result] || 0), 0)
    const missed = new Set(asked.filter((x) => x.result === 'wrong').map((x) => x.key))
    const before = todaysChallenges(state, course, day, profile.id).filter((c) => progressOf(c, state.daily, day) < c.goal)
    let learned = 0
    let after = null
    update((s) => {
      let out = earn(s, xp)
      const srs = { ...out.srs }
      let daily = countSession(out.daily, day, asked)
      const bump = (k, n) => { daily = { ...daily, counts: { ...daily.counts, [k]: (daily.counts[k] || 0) + n } } }
      if (view.kind === 'lesson') {
        for (const it of view.lesson.items) if (!srs[it.key]) { srs[it.key] = introduce(srs, it.key, missed.has(it.key)); learned++ }
        const prev = out.lessons[view.lesson.id]
        out = { ...out, lessons: { ...out.lessons, [view.lesson.id]: { done: true, score: Math.max(score, prev?.score || 0), at: day } } }
        if (!prev?.done) bump('lessons', 1)
      } else {
        const seen = new Set()
        for (const x of asked) {
          if (!x.key || seen.has(x.key)) continue
          seen.add(x.key)
          srs[x.key] = grade(srs[x.key], x.result !== 'wrong')
        }
        bump('reviewed', seen.size)
      }
      after = { ...out, srs, daily }
      return after
    })
    const finished = before.filter((c) => progressOf(c, after.daily, day) >= c.goal)
    const goalReached = (after.days[day] || 0) >= after.settings.goal && (state.days[day] || 0) < state.settings.goal
    const nextL = view.kind === 'lesson' ? course.lessons[course.lessons.indexOf(view.lesson) + 1] : null
    go({ name: 'done', summary: { title: view.title, score, xp, learned, finished, goalReached }, next: nextL?.id })
  }

  const readLine = () => update((s) => {
    const day = today()
    const d = s.daily?.day === day ? s.daily : { day, counts: {} }
    return { ...s, daily: { ...d, counts: { ...d.counts, linesRead: (d.counts.linesRead || 0) + 1 } } }
  })

  const due = dueKeys(state.srs, course.lang).filter((k) => course.byKey.has(k)).length
  const PAGE = { home: COURSE_NAME[course.id], reading: 'Reading room', notebook: 'Notebook', settings: 'Settings' }
  return (
    <div className="shell">
      <TitleBar state={state} update={update} go={go} profile={profile} onSwitch={onSwitch} />
      <Rail view={view} go={go} due={due} onReview={() => (due ? openReview() : go({ name: 'home' }))} />
      <main className="main">
        {PAGE[view.name] && (
          <div className="pagehead">
            <h1>{PAGE[view.name]}</h1>
            <span className="pagehead__side">
              {view.name === 'home' && <Out href={TRANSLATOR_URL}>Translate anything in Lam Edhellen</Out>}
              {view.name === 'reading' && <span className="hint">{LANG_NAME[course.lang === 'T' ? 'S' : course.lang]} · lit words are ones you know</span>}
              {view.name === 'settings' && <span className="hint">{profile.name} · {PLATFORM === 'desktop' ? 'saved on this computer' : sync === 'account' ? 'saved to your account' : 'saved in this browser'}</span>}
            </span>
          </div>
        )}
        <div className="view" key={view.name + (view.title || '')}>
          {view.name === 'quiz' && (
            <Quiz
              onSkip={() => { update((s) => ({ ...s, quizSkipped: true })); go({ name: 'home' }) }}
              onDone={(answers, rec) => { update((s) => ({ ...s, quiz: answers, track: rec.focus || rec.track, settings: { ...s.settings, goal: rec.goal } })); go({ name: 'home' }) }}
            />
          )}
          {view.name === 'home' && <Home course={course} state={state} profile={profile} onOpen={openLesson} onReview={openReview} onRead={() => go({ name: 'reading' })} />}
          {view.name === 'session' && <Session key={view.title + view.steps.length} title={view.title} lang={course.lang} initial={view.steps} onFinish={finish} onQuit={() => go({ name: 'home' })} />}
          {view.name === 'done' && <Done summary={view.summary} onHome={() => go({ name: 'home' })} onNext={view.next ? () => openLesson(view.next) : null} />}
          {view.name === 'reading' && <Reading lang={course.lang === 'T' ? 'S' : course.lang} state={state} onRead={readLine} />}
          {view.name === 'notebook' && <Notebook course={course} state={state} />}
          {view.name === 'settings' && (
            <Settings state={state} update={update} profile={profile} sync={sync} onSwitch={onSwitch}
              onRetakeQuiz={() => go({ name: 'quiz' })}
              onReset={() => update((s) => ({ ...fresh(), track: s.track, quiz: s.quiz, settings: s.settings }))} />
          )}
        </div>
      </main>
    </div>
  )
}
