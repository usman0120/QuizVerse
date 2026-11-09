'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { FlashDeck } from '@/lib/types';
import { useApp } from './app-provider';

export function Flashcards({ decks }: { decks: FlashDeck[] }) {
  const { user, loading, flashProgress, request } = useApp();
  const [search, setSearch] = useState(''); const [active, setActive] = useState<FlashDeck | null>(null);
  const [order, setOrder] = useState<string[]>([]); const [index, setIndex] = useState(0); const [flipped, setFlipped] = useState(false);
  const [filter, setFilter] = useState('all'); const [images, setImages] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const card = active?.cards.find(card => card.id === order[index]);
  function open(deck: FlashDeck, mode = 'all') {
    const cards = deck.cards.filter(card => mode === 'all' || (mode === 'difficult' ? flashProgress.difficult.includes(card.id) : !flashProgress.learned.includes(card.id)));
    setActive(deck); setOrder(cards.map(card => card.id)); setIndex(0); setFlipped(false); setFilter(mode); setError('');
  }
  function shuffle() {
    const values = [...order];
    for (let i = values.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [values[i], values[j]] = [values[j], values[i]]; }
    setOrder(values); setIndex(0); setFlipped(false);
  }
  async function mark(status: 'learned' | 'difficult' | 'new') {
    if (!card || !user) return; setBusy(true); setError('');
    try { await request('/api/flashcards/progress', { cardId: card.id, status }); }
    catch (error) { setError(error instanceof Error ? error.message : 'Progress could not be saved.'); }
    finally { setBusy(false); }
  }
  if (active) return <div className="player"><button className="text-button" onClick={() => setActive(null)}>← All decks</button><h1>{active.title}</h1><p className="muted">{active.description}</p>{!user && <div className="alert">You can study freely. <Link href="/auth">Sign in</Link> to save learned and difficult cards. Guest progress is not saved.</div>}<div className="toolbar"><label>Study filter<select value={filter} onChange={event => open(active, event.target.value)}><option value="all">All cards</option><option value="unlearned" disabled={!user}>Not learned</option><option value="difficult" disabled={!user}>Difficult</option></select></label><button className="button secondary" disabled={order.length < 2} onClick={shuffle}>Shuffle</button><label className="check-label"><input type="checkbox" checked={images} onChange={event => setImages(event.target.checked)} />Show images</label></div>{error && <div className="alert error" role="alert">{error}</div>}{card ? <><div className="player-header"><span className="badge">{index + 1} / {order.length}</span><span className="muted">{flashProgress.learned.includes(card.id) ? '✓ Learned' : flashProgress.difficult.includes(card.id) ? '↻ Difficult' : 'Not marked'}</span></div><button className="flashcard" aria-label={`${flipped ? 'Answer' : 'Question'}: ${flipped ? card.back : card.front}. Activate to flip.`} onClick={() => setFlipped(!flipped)}><p>{flipped ? card.back : card.front}</p>{flipped && card.example && <small>{card.example}</small>}<small>Click or press Enter to {flipped ? 'see question' : 'reveal answer'}</small></button>{images && card.image && <Image className="deck-image" src={card.image} alt="Flashcard illustration" width={500} height={200} unoptimized onError={event => { event.currentTarget.style.display = 'none'; }} />}{!flipped && card.hint && <details><summary>Hint</summary><p>{card.hint}</p></details>}<div className="row"><button className="button secondary" disabled={index === 0} onClick={() => { setIndex(index - 1); setFlipped(false); }}>← Previous</button><button className="button" disabled={index + 1 === order.length} onClick={() => { setIndex(index + 1); setFlipped(false); }}>Next →</button><button className="button secondary" disabled={loading || busy || !user} onClick={() => void mark('learned')}>✓ Learned</button><button className="button secondary" disabled={loading || busy || !user} onClick={() => void mark('difficult')}>↻ Difficult</button><button className="text-button" disabled={busy || !user} onClick={() => void mark('new')}>Clear mark</button></div>{index + 1 === order.length && <div className="alert">You’ve reached the end of this deck. Shuffle to study again, or choose another deck.</div>}</> : <div className="card center">No cards in this filter. <button className="text-button" onClick={() => open(active)}>Show all cards</button></div>}</div>;
  const filtered = decks.filter(deck => `${deck.title} ${deck.category} ${deck.description}`.toLowerCase().includes(search.toLowerCase()));
  return <><p className="eyebrow">A little practice, lasting knowledge</p><h1>Make it stick.</h1><p className="muted">Curated flashcard decks. Flip, practice, and save your progress when signed in.</p><div className="toolbar"><label>Search decks<input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Math, history, languages…" /></label></div><div className="grid">{filtered.map(deck => <div className="card card-link" key={deck.id}><div className="card-icon">🗂️</div><span className="badge">{deck.category} · {deck.difficulty}</span><h3 style={{ marginTop: 12 }}>{deck.title}</h3><p>{deck.description}</p><p className="card-meta">{deck.cards.length} cards{user && ` · ${deck.cards.filter(card => flashProgress.learned.includes(card.id)).length} learned`}</p><button className="button full" onClick={() => open(deck)}>Study deck →</button></div>)}</div>{!filtered.length && <div className="card center">No decks match your search.</div>}</>;
}
