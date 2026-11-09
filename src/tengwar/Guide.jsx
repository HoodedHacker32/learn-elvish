// The guide to Tengwar on your own devices: fonts, typing, where it shows up, transcribers.
import { GUIDE, inline, KEY_ROWS, KEY_SIGNS } from '../course/tengwar-guide.js'
import { CSUR, ANNATAR_LETTERS, ANNATAR_TEHTAR } from '../../../LoTR Elvish Translator/src/engine/tengwar.js'
import { LETTERS } from '../course/tengwar.js'

const T = (cp) => String.fromCharCode(cp)

const signFace = (id) => (['dotBelow', 'nasalizer', 'doubler'].includes(id) ? T(CSUR.tinco) : T(CSUR.shortCarrier)) + T(CSUR[id])
const nameOf = (id) => LETTERS[id]?.name || { extAndo: '“the”', extUmbar: '“of”' }[id] || id

function piece(x, i) {
  if (x.bold) return <strong key={i}>{x.parts.map(piece)}</strong>
  if (x.href) return <a key={i} className="outlink" href={x.href} target="_blank" rel="noopener noreferrer">{x.text}<span aria-hidden="true"> ↗</span></a>
  return <span key={i}>{x.text}</span>
}
const Inline = ({ text }) => inline(text).map(piece)

function KeyChart() {
  return (
    <div className="keychart">
      <table className="keychart__letters">
        <caption className="sr-only">Tengwar Annatar keys for each letter</caption>
        <tbody>
          {KEY_ROWS.map((row, r) => (
            <tr key={r}>{row.map((id) => (
              <td key={id} title={nameOf(id)}>
                <span className="tengwar">{T(CSUR[id])}</span>
                <kbd>{ANNATAR_LETTERS[id]}</kbd>
                <span className="keychart__name">{nameOf(id)}</span>
              </td>
            ))}</tr>
          ))}
        </tbody>
      </table>
      <table className="keychart__signs">
        <caption className="sr-only">Tengwar Annatar keys for the vowel signs and bars</caption>
        <thead><tr><th>Sign</th><th>Two bows</th><th>One bow</th><th>Raised stem</th><th>Carrier</th></tr></thead>
        <tbody>
          {KEY_SIGNS.map(([id, label]) => (
            <tr key={id}>
              <th scope="row"><span className="tengwar">{signFace(id)}</span> {label}</th>
              {[...ANNATAR_TEHTAR[id]].map((k, i) => <td key={i}><kbd>{k}</kbd></td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Guide() {
  return (
    <div className="guide">
      <p className="guide__lede">How to read, type and share Tengwar outside this app: which fonts to install, how to type with them, where they work, and how to check a transcriber.</p>
      <nav className="guide__toc" aria-label="On this page">
        {GUIDE.map((s) => <a key={s.id} href={'#guide-' + s.id}>{s.h}</a>)}
      </nav>
      {GUIDE.map((s) => (
        <section key={s.id} id={'guide-' + s.id} className="card guide__section">
          <h2 className="card__h">{s.h}</h2>
          {s.blocks.map((b, i) => b.p ? <p key={i}><Inline text={b.p} /></p>
            : b.note ? <p key={i} className="hint guide__note"><Inline text={b.note} /></p>
              : b.list ? <ul key={i}>{b.list.map((t, k) => <li key={k}><Inline text={t} /></li>)}</ul>
                : b.steps ? <ul key={i} className="guide__steps">{b.steps.map((t, k) => <li key={k}><Inline text={t} /></li>)}</ul>
                  : b.keys ? <KeyChart key={i} /> : null)}
        </section>
      ))}
    </div>
  )
}
