// app/page.tsx — Citizens for Change homepage
'use client';

import { FC, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CookieBanner from '../components/CookieBanner';
import { CookieManager } from '../utils/cookieManager';

// ─── data ────────────────────────────────────────────────────────────────────

const realities = [
  {
    num: "01",
    hook: "We know our work adds value but we can't prove it to funders or our Board.",
    explain:
      "You feel the change you are creating, but without the infrastructure to capture it, that change remains invisible to the people who need to see it. Funding, credibility and influence all rest on evidence you don't yet have.",
  },
  {
    num: "02",
    hook: "Funders and boards are demanding more — and we don't have the answers they need.",
    explain:
      "Development funding is increasingly constrained, restricted and competitive. Funders want to see real change in people's lives, not activity reports. If you cannot answer those questions convincingly, you risk losing funding, credibility, or both.",
  },
  {
    num: "03",
    hook: "We're collecting data, but we can't turn it into insight we can actually use.",
    explain:
      "You have invested in data collection, but data without the right infrastructure to interpret it leaves you data-rich and insight-poor. You can report on what happened. You cannot yet explain what it meant for people, or what to do differently.",
  },
  {
    num: "04",
    hook: "Knowledge gets lost because we have no way to capture it.",
    explain:
      "Your teams close to the ground carry real insight about what is and isn't working. But without the structure to capture it consistently, that knowledge walks out the door when people move on. What they know is not documented, not shared, and not used.",
  },
  {
    num: "05",
    hook: "Teams and data work in silos, so nobody sees the collective picture.",
    explain:
      "Your projects operate independently of each other, and across the sector, other organisations working on the same issues cannot see your contributions either. The result is fragmented evidence that significantly understates the change that is actually happening.",
  },
  {
    num: "06",
    hook: "We advise others on learning and impact but haven't applied that to ourselves.",
    explain:
      "You have deep expertise in learning and impact, but your own practice is project-based and discontinuous. The gap between what you teach and what you do is a quiet credibility risk that is difficult to address without the right infrastructure in place.",
  },
  {
    num: "07",
    hook: "We don't have the time or budget to take anything else on right now.",
    explain:
      "Capacity and budget constraints are among the most common reasons organisations don't act, even when they recognise the need. The barrier isn't conviction; it's the cost of entry and the fear of disrupting already-stretched teams.",
  },
  {
    num: "08",
    hook: "We're interested but don't have internal buy-in yet.",
    explain:
      "Even when you are convinced, organisational change requires broader agreement. Without the right framing, that conversation stalls. The case for change has to be made in the language of risk, cost and strategic fit, not just impact.",
  },
];

const offerCards = [
  {
    badge: "Independent",
    badgeStyle: { background: "rgba(242,197,57,0.15)", color: "#b8891a", border: "1px solid rgba(242,197,57,0.3)" },
    name: "Outcome Mapping & Monitoring — Self-Serve",
    desc: "The entry point to learning infrastructure. Design your programme framework, map stakeholder roles, build your Theory of Change and create monitoring surveys that capture real change in people's lives — independently, at an accessible price point. Built on 30 years of scholar-practitioner knowledge, so you are not starting from scratch.",
    email: "Self-Serve+enquiry",
  },
  {
    badge: "In Development",
    badgeStyle: { background: "rgba(26,24,20,0.08)", color: "rgba(26,24,20,0.60)", border: "1px solid #e2ddd5" },
    name: "Learning Infrastructure — Insight",
    desc: "Built on top of Outcome Mapping & Monitoring, this capability uses AI that applies a systems-thinking lens, enabling your team to move from single-loop learning to second-order insight. Understand not just what happened, but what conditions enable optimum impact. Seeking mission-aligned co-development partners.",
    email: "Insight+enquiry",
  },
  {
    badge: "Coming Q3 2026",
    badgeStyle: { background: "rgba(15,167,201,0.10)", color: "#0a7d96", border: "1px solid rgba(15,167,201,0.2)" },
    name: "Social Network Analysis",
    desc: "Your organisation doesn't create change alone — it does so through a network of actors, relationships and shifting alliances. Social Network Analysis adds a powerful layer to your Outcome Mapping & Monitoring, enabling you to map that network, identify key actors and track how relationships shift.",
    email: "SNA+interest",
  },
  {
    badge: "Co-Development",
    badgeStyle: { background: "rgba(26,24,20,0.08)", color: "rgba(26,24,20,0.60)", border: "1px solid #e2ddd5" },
    name: "Systems Impact Mapping",
    desc: "A co-created R&D partnership that enables networks and consortia to make visible the collective impact of their systems change efforts, mapping the relational architecture and advocacy contributions across an entire geography or movement. Grant co-funded.",
    email: "Systems+Impact+enquiry",
  },
];

const callouts = [
  {
    num: "01 — Genesis & Track Record",
    header: "30 years of practice, encoded as infrastructure.",
    body: "Citizens for Change was founded by Dr Kate McAlpine after three decades as a field researcher, consultant and activist in East Africa and the UK. Most tools help organisations do things right, but Citizens for Change is designed to help them do the right thing — understanding genuine impact on people's lives, not just demonstrating compliance. That distinction shaped Kate's PhD and runs through everything we build. Our team is predominantly female and predominantly East African, spanning generations, geographies and lived realities — we are not observers of the sector, but a part of it.",
  },
  {
    num: "02 — Collective Impact Visibility",
    header: "Your impact goes much further than your organisation.",
    body: `Purpose-led organisations are already creating real impact, but much of it goes unrecorded and unseen. Citizens for Change makes your individual evidence visible, then connects it to the collective picture across organisations, geographies and themes. When funders can see aggregated evidence of change — the conversation shifts from "prove your worth" to "what are we learning together?" When organisations join Citizens for Change, they join a collective endeavour to make visible the impact that is already happening.`,
  },
  {
    num: "03 — Cost-Effective & Practical",
    header: "Start small and build as you grow.",
    body: "Citizens for Change is a low-disruption, low-cost way to build your evidence infrastructure. Start with programme design and layer in learning features as capacity grows, ensuring the first step is genuinely small in time, cost and effort. It works with what you already have, extracting more value from existing data rather than demanding new systems. Until now, this kind of rigorous, people-centred framework has only been available through expensive bespoke consulting. Citizens for Change changes that.",
  },
];

const partners = [
  'Action for Life Skills & Values in East Africa',
  'Aga Khan Foundation',
  'Better Care Network',
  'Child\'s i Foundation',
  'ConnectGo',
  'Femina HIP',
  'Fielding Graduate University',
  'Fondation Botnar',
  'Human Sciences Research Council',
  'National Research Foundation of South Africa',
  'Pamoja Leo',
  'Porticus Foundation',
  'Railway Children Africa',
  'The Foundation for Tomorrow',
  'Transform Alliance Africa',
  'UBS Optimus Foundation',
  'UNICEF',
  'University of Dar es Salaam',
  'Women Fund Tanzania Trust',
  'World Childhood Foundation',
  'Zizi Afrique Foundation',
];

// ─── sub-components ───────────────────────────────────────────────────────────

const SectionEye = ({ label, color = '#0fa7c9' }: { label: string; color?: string }) => (
  <p
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      fontFamily: 'var(--font-rajdhani), sans-serif',
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      color,
      marginBottom: '1.25rem',
    }}
  >
    <span style={{ display: 'block', width: 20, height: 1.5, background: color, flexShrink: 0 }} />
    {label}
  </p>
);

const GradRule = () => (
  <span
    style={{
      display: 'block',
      width: 44,
      height: 3,
      background: 'var(--c4c-grad)',
      margin: '1.75rem 0',
      borderRadius: 2,
    }}
  />
);

// ─── homepage ────────────────────────────────────────────────────────────────

const HomePage: FC = () => {
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [hoveredCallout, setHoveredCallout] = useState<number | null>(null);

  useEffect(() => {
    const hasConsent = CookieManager.hasConsent();
    if (!hasConsent) {
      const timer = setTimeout(() => setShowCookieBanner(true), 2000);
      return () => clearTimeout(timer);
    }
    if (CookieManager.isConsentExpired(12)) setShowCookieBanner(true);
  }, []);

  useEffect(() => {
    const on = () => setShowCookieBanner(false);
    const off = () => setShowCookieBanner(true);
    window.addEventListener('cookiePreferencesUpdated', on);
    window.addEventListener('cookiePreferencesCleared', off);
    return () => {
      window.removeEventListener('cookiePreferencesUpdated', on);
      window.removeEventListener('cookiePreferencesCleared', off);
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* ── HERO ── */}
      <section
        id="hero"
        style={{
          background: '#faf9f6',
          padding: '7rem 0 6rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* decorative blobs */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(242,197,57,0.12) 0%, transparent 65%)',
            top: -120,
            right: -100,
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(15,167,201,0.08) 0%, transparent 65%)',
            bottom: -80,
            left: -60,
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 2.5rem', position: 'relative', zIndex: 2 }}>
          <p
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              fontFamily: 'var(--font-rajdhani), sans-serif',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#f48a5b',
              marginBottom: '2rem',
            }}
          >
            <span style={{ display: 'block', width: 28, height: 1.5, background: '#f48a5b' }} />
            Learning Infrastructure for Purpose-Led Organisations
          </p>

          <h1
            style={{
              fontFamily: 'var(--font-rajdhani), sans-serif',
              fontSize: 'clamp(40px, 6vw, 78px)',
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '-0.01em',
              color: '#1a1814',
              maxWidth: 860,
              marginBottom: '2rem',
            }}
          >
            You are already
            <br />
            <span style={{ color: 'rgba(26,24,20,0.35)' }}>doing the right thing.</span>
            <br />
            <span className="c4c-grad-text">We will help you prove it.</span>
          </h1>

          <p
            style={{
              fontSize: 17,
              fontWeight: 300,
              color: "rgba(26,24,20,0.60)",
              lineHeight: 1.9,
              maxWidth: 620,
              marginBottom: "3rem",
              fontFamily: "var(--font-nunito), sans-serif",
            }}
          >
            {"The organisations that secure funding, build trust and shape policy are those that can demonstrate real change in people's lives. Citizens for Change is the learning infrastructure that makes that possible."}
          </p>

          <hr style={{ width: '100%', height: 1, background: '#e2ddd5', border: 'none', marginTop: '2rem' }} />
        </div>
      </section>

      {/* ── WHAT WE HEAR ── */}
      <section id="realities" style={{ background: '#fff', padding: '6.5rem 0' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 2.5rem' }}>
          <div style={{ marginBottom: '3.5rem' }}>
            <SectionEye label="What We Hear" />
            <h2
              style={{
                fontFamily: 'var(--font-rajdhani), sans-serif',
                fontSize: 'clamp(24px, 3.6vw, 44px)',
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: '-0.01em',
                color: '#1a1814',
                marginBottom: '1rem',
              }}
            >
              These are the conversations happening in and amongst purpose-led organisations right now.
            </h2>
            <GradRule />
            <p style={{ fontSize: 15, fontWeight: 300, color: 'rgba(26,24,20,0.60)', lineHeight: 1.85, maxWidth: 580 }}>
              If any of these sound familiar, you are not alone — and you are in the right place.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              border: '1px solid #e2ddd5',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            {realities.map((r, i) => (
              <div
                key={r.num}
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  background: hoveredCard === i ? '#faf9f6' : '#fff',
                  padding: '1.85rem 1.6rem',
                  position: 'relative',
                  minHeight: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  cursor: 'default',
                  transition: 'background 0.2s',
                  borderRight: (i + 1) % 4 !== 0 ? '1px solid #e2ddd5' : undefined,
                  borderBottom: i < 4 ? '1px solid #e2ddd5' : undefined,
                }}
              >
                {/* top gradient bar on hover */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: hoveredCard === i ? '100%' : 0,
                    height: 3,
                    background: 'var(--c4c-grad)',
                    transition: 'width 0.3s ease',
                  }}
                />
                <p
                  style={{
                    fontFamily: 'var(--font-rajdhani), sans-serif',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    color: '#f48a5b',
                    marginBottom: 12,
                  }}
                >
                  {r.num}
                </p>
                {hoveredCard === i ? (
                  <p style={{ fontSize: 12, fontWeight: 400, lineHeight: 1.75, color: 'rgba(26,24,20,0.60)' }}>
                    {r.explain}
                  </p>
                ) : (
                  <>
                    <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.5, color: '#1a1814', flex: 1 }}>
                      {r.hook}
                    </p>
                    <p
                      style={{
                        marginTop: 'auto',
                        paddingTop: 12,
                        fontSize: 10,
                        fontWeight: 400,
                        letterSpacing: '0.06em',
                        color: 'rgba(26,24,20,0.35)',
                      }}
                    >
                      Hover to read more
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW WE HELP ── */}
      <section id="offers" style={{ background: '#faf9f6', padding: '6.5rem 0' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 2.5rem' }}>
          <div style={{ marginBottom: '3.5rem', maxWidth: 600 }}>
            <SectionEye label="How We Help" />
            <h2
              style={{
                fontFamily: 'var(--font-rajdhani), sans-serif',
                fontSize: 'clamp(24px, 3.6vw, 44px)',
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: '-0.01em',
                color: '#1a1814',
                marginBottom: '1rem',
              }}
            >
              Find your learning infrastructure.
            </h2>
            <GradRule />
            <p style={{ fontSize: 15, fontWeight: 300, color: 'rgba(26,24,20,0.60)', lineHeight: 1.85 }}>
              Whether you need full learning infrastructure or a smaller first step, there is an offer that works for where you are right now.
            </p>
          </div>

          {/* Featured card */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #e2ddd5',
              borderRadius: 8,
              padding: '2.75rem 3rem',
              marginBottom: 12,
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '3rem',
              alignItems: 'start',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: 3,
                background: 'var(--c4c-grad)',
              }}
            />
            <div>
              <p
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontFamily: 'var(--font-rajdhani), sans-serif',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: '#f48a5b',
                  marginBottom: 10,
                }}
              >
                <span style={{ display: 'block', width: 16, height: 1.5, background: '#f48a5b' }} />
                Full Infrastructure
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-rajdhani), sans-serif',
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#1a1814',
                  marginBottom: '1rem',
                  letterSpacing: '-0.01em',
                }}
              >
                Outcome Mapping &amp; Monitoring — Supported
              </p>
              <p style={{ fontSize: 14, fontWeight: 300, color: 'rgba(26,24,20,0.60)', lineHeight: 1.85, maxWidth: 580 }}>
                Most purpose-led organisations know their work creates change. Few have the infrastructure to evidence it convincingly. Outcome Mapping &amp; Monitoring — Supported combines programme design, stakeholder mapping, Theory of Change, monitoring and results visualisation with structured account management as a core pillar; for organisations ready to move from activity reporting to genuine learning infrastructure.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem', minWidth: 160, paddingTop: '0.5rem' }}>
              <a
                href="mailto:hannah@citizens4change.net?subject=OM%26M+Supported+enquiry"
                style={{
                  fontFamily: 'var(--font-rajdhani), sans-serif',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  background: '#1a1814',
                  color: '#fff',
                  padding: '13px 26px',
                  borderRadius: 4,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                Enquire
              </a>
              <a
                href="https://www.youtube.com/watch?v=0lkan7DzACM&t=6s"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: 'var(--font-rajdhani), sans-serif',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  background: '#fff',
                  color: '#1a1814',
                  border: '2px solid #e2ddd5',
                  padding: '11px 24px',
                  borderRadius: 4,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                See it in practice →
              </a>
            </div>
          </div>

          {/* 4-card grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {offerCards.map(card => (
              <div
                key={card.name}
                style={{
                  background: '#fff',
                  border: '1px solid #e2ddd5',
                  borderRadius: 8,
                  padding: '1.85rem 1.6rem',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-rajdhani), sans-serif',
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    padding: '4px 10px',
                    borderRadius: 3,
                    width: 'fit-content',
                    marginBottom: 12,
                    ...card.badgeStyle,
                  }}
                >
                  {card.badge}
                </span>
                <p
                  style={{
                    fontFamily: 'var(--font-rajdhani), sans-serif',
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#1a1814',
                    lineHeight: 1.35,
                    marginBottom: 10,
                  }}
                >
                  {card.name}
                </p>
                <p style={{ fontSize: 12, fontWeight: 400, color: 'rgba(26,24,20,0.60)', lineHeight: 1.75, flex: 1, marginBottom: '1.25rem' }}>
                  {card.desc}
                </p>
                <div style={{ paddingTop: '1rem', borderTop: '1px solid #e2ddd5' }}>
                  <a
                    href={`mailto:hannah@citizens4change.net?subject=${card.email}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontFamily: 'var(--font-rajdhani), sans-serif',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: '#1a1814',
                      textDecoration: 'none',
                    }}
                  >
                    Enquire →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO WE ARE ── */}
      <section id="who" style={{ background: '#fff', padding: '6.5rem 0' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 2.5rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '5rem',
              alignItems: 'start',
            }}
            className="who-layout"
          >
            <div>
              <SectionEye label="Who We Are" />
              <h2
                style={{
                  fontFamily: 'var(--font-rajdhani), sans-serif',
                  fontSize: 'clamp(24px, 3.6vw, 44px)',
                  fontWeight: 700,
                  lineHeight: 1.1,
                  letterSpacing: '-0.01em',
                  color: '#1a1814',
                  marginBottom: '1rem',
                }}
              >
                Learning infrastructure built by people who have lived inside the problem.
              </h2>
              <GradRule />
              <p style={{ fontSize: 15, fontWeight: 300, color: 'rgba(26,24,20,0.60)', lineHeight: 1.9, marginTop: '1.5rem' }}>
                {"Citizens for Change provides the tech, skills and connections that enable purpose-led organisations to demonstrate the impact of doing the right thing — individually and collectively. It is learning infrastructure, not a reporting tool. It helps organisations move from proving compliance to understanding what actually changed for people, and it does something no individual organisation can do alone: it makes visible the collective impact that already exists across organisations independently doing good work."}
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
                border: '1px solid #e2ddd5',
                borderRadius: 8,
                overflow: 'hidden',
              }}
            >
              {callouts.map((c, i) => (
                <div
                  key={c.num}
                  onMouseEnter={() => setHoveredCallout(i)}
                  onMouseLeave={() => setHoveredCallout(null)}
                  style={{
                    background: hoveredCallout === i ? '#faf9f6' : '#fff',
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'background 0.2s',
                    borderBottom: i < callouts.length - 1 ? '1px solid #e2ddd5' : undefined,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: hoveredCallout === i ? '100%' : 0,
                      height: 3,
                      background: 'var(--c4c-grad)',
                      transition: 'width 0.3s',
                    }}
                  />
                  <p
                    style={{
                      fontFamily: 'var(--font-rajdhani), sans-serif',
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.18em',
                      color: '#f48a5b',
                    }}
                  >
                    {c.num}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-rajdhani), sans-serif',
                      fontSize: 16,
                      fontWeight: 700,
                      color: '#1a1814',
                      lineHeight: 1.3,
                    }}
                  >
                    {c.header}
                  </p>
                  <p style={{ fontSize: 13, fontWeight: 300, color: 'rgba(26,24,20,0.60)', lineHeight: 1.8 }}>
                    {c.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY C4C / PARTNERS ── */}
      <section id="partners" style={{ background: '#faf9f6', padding: '5rem 0' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 2.5rem', marginBottom: '3rem' }}>
          <SectionEye label="Why C4C" />
          <h2
            style={{
              fontFamily: 'var(--font-rajdhani), sans-serif',
              fontSize: 'clamp(24px, 3.6vw, 44px)',
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
              color: '#1a1814',
              marginBottom: '1rem',
            }}
          >
            We are trusted by organisations doing the right thing.
          </h2>
          <GradRule />
        </div>

        {/* Scrolling ticker */}
        <div
          style={{
            overflow: 'hidden',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
            maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
          }}
        >
          <style>{`
            @keyframes scrollLogos {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .partners-scroll {
              display: flex;
              gap: 3rem;
              align-items: center;
              animation: scrollLogos 50s linear infinite;
              width: max-content;
            }
            .partners-scroll:hover {
              animation-play-state: paused;
            }
          `}</style>
          <div className="partners-scroll">
            {[...partners, ...partners].map((name, i) => (
              <span key={i} style={{ display: 'contents' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-rajdhani), sans-serif',
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    color: 'rgba(26,24,20,0.35)',
                    whiteSpace: 'nowrap',
                    cursor: 'default',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(26,24,20,0.60)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(26,24,20,0.35)')}
                >
                  {name}
                </span>
                <span style={{ fontSize: 16, color: 'rgba(26,24,20,0.15)' }}>·</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        id="cta"
        style={{ background: '#fff', padding: '8rem 0', position: 'relative', overflow: 'hidden' }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--c4c-grad)',
            opacity: 0.88,
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: -300,
            right: -300,
            width: 800,
            height: 800,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 2.5rem', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 660 }}>
            <p
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                fontFamily: 'var(--font-rajdhani), sans-serif',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.6)',
                marginBottom: '1.5rem',
              }}
            >
              <span style={{ display: 'block', width: 20, height: 1.5, background: 'rgba(255,255,255,0.5)' }} />
              Start the Conversation
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-rajdhani), sans-serif',
                fontSize: 'clamp(30px, 5vw, 56px)',
                fontWeight: 700,
                lineHeight: 1.08,
                letterSpacing: '-0.01em',
                color: '#fff',
                marginBottom: '1.5rem',
              }}
            >
              Let us make your impact visible.
            </h2>
            <p
              style={{
                fontSize: 15,
                fontWeight: 300,
                color: 'rgba(255,255,255,0.75)',
                lineHeight: 1.88,
                marginBottom: '2.75rem',
                maxWidth: 520,
              }}
            >
              {"Every organisation starts somewhere different. Whether you are ready to build your evidence infrastructure now or just want to understand what's possible, we would like to hear from you. No pressure, no jargon. Just an honest conversation about where you are and what a useful next step looks like."}
            </p>
            <a
              href="mailto:hannah@citizens4change.net"
              style={{
                fontFamily: 'var(--font-rajdhani), sans-serif',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                background: '#fff',
                color: '#1a1814',
                border: 'none',
                padding: '15px 32px',
                borderRadius: 4,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Book a Conversation
            </a>
          </div>
        </div>
      </section>

      <Footer />

      {showCookieBanner && <CookieBanner />}
    </div>
  );
};

export default HomePage;
