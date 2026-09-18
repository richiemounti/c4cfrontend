// app/page.tsx — Citizens for Change homepage
//
// Rebuilt from "C4C Website Homepage_18 09 26.html" (the Notion "Website -
// Homepage Copy" build, verbatim). Structure and copy follow that doc
// section-for-section — see app/homepage.module.css for the ported layout.
'use client';

import { FC, useEffect, useState } from 'react';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CookieBanner from '../components/CookieBanner';
import { CookieManager } from '../utils/cookieManager';
import styles from './homepage.module.css';

// ─── data ────────────────────────────────────────────────────────────────────

const hearCards = [
  {
    num: '01',
    hook: "We'd love an in-depth social analysis, but it means a consultant, a team of enumerators and a full evaluation — we can afford that once, on one project, maybe every few years.",
  },
  {
    num: '02',
    hook: "We can't tell you what our projects change for people and local communities.",
  },
  {
    num: '03',
    hook: "Funders and boards are asking harder questions about impact — and we don't have good answers.",
  },
  {
    num: '04',
    hook: "We have a lot of data but can't turn it into useful insight.",
  },
];

const whyCells = [
  {
    num: '01',
    k: 'The Proof',
    title: 'Impact evidence that holds up. Built in, not bought in.',
    lead: "Projects that can't demonstrate impact are the ones that find it harder to attract funding. Citizens for Change is a rigorous, affordable way to show what your work is actually changing for people.",
    body: "It builds the capacity your organisation needs, rather than depending on capacity you don't have — no extra staff, no specialist skills, no social scientists. For a quarter of the price of one consultant, you can run the analysis across several projects, every year — not once, on one project, every few years.",
  },
  {
    num: '02',
    k: 'What Changed',
    title: 'You know the numbers, now learn what changed.',
    lead: 'Most projects can count their participants. Fewer can say what changed for them. Citizens for Change lets you see more than how many people took part.',
    body: 'You learn what changed for participants, their families and their communities — and whether it lasted. Not just what you delivered, but the real difference your work made in people’s lives.',
  },
  {
    num: '03',
    k: 'The Bigger Picture',
    title: 'Collective change made visible.',
    lead: "The organisations that secure funding and shape policy are the ones that can evidence real change. The instinct is to answer a funder's harder questions with more of your own data. But more data doesn't answer those questions — it just adds to the noise.",
    body: '“When funders can see your contribution as part of the collective picture — aggregated across your projects, connected to the wider system — the conversation shifts from “prove your worth” to “what are we learning together?” Citizens for Change makes that bigger picture visible.',
  },
  {
    num: '04',
    k: 'The Deeper Learning',
    title: "Don't just do things right. Do the right thing.",
    lead: 'Understand what to do differently, and why — the question a learning organisation asks of itself. You already have the data. The question is what it’s telling you.',
    body: 'Citizens for Change already answers what you planned and what changed — those questions are handled. What makes a team genuinely wiser is the next step: not “did we do things right?” but “are we doing the right thing?” Insight adds that layer — an AI that reads across your evidence and produces the brief, the board note or the learning agenda each person needs to act on it.',
  },
];

const offerCards = [
  {
    status: 'Live',
    name: 'Citizens for Change Self-Serve',
    body: 'Citizens for Change Self-Serve gives you access to the full learning infrastructure — stakeholder mapping, theory of change, survey builder and results visualisation. Your team runs it. For smaller teams running one to three projects, with the capacity to drive it themselves.',
  },
  {
    status: 'In Development · Launching January 2027',
    name: 'Insight',
    body: 'Built on top of Citizens for Change Supported or Self-Serve, Insight uses AI that applies a systems-thinking lens, enabling your team to move from single-loop learning to second-order learning. Understand not just what happened, but what conditions enable optimum impact. We are seeking a small number of mission-aligned co-development partners to shape what gets built.',
  },
  {
    status: 'In Development · Launching Autumn 2026',
    name: 'Social Network Analysis',
    body: "Your organisation doesn't create change alone; it does so through a network of actors, relationships and shifting alliances. Social Network Analysis builds on Citizens for Change Supported or Self-Serve, enabling you to map that network, identify key actors and track how relationships shift as outcomes change. For organisations whose work depends on partnerships, coalitions or referral networks.",
  },
  {
    status: 'Seeking Co-Development · Launching Spring 2027',
    name: 'Systems Impact Mapping',
    body: 'Systems Impact Mapping is a co-created R&D partnership that enables networks and consortia to make visible the collective impact of their systems change efforts, mapping the relational architecture and advocacy contributions across an entire geography or movement. Grant co-funded. We are seeking a small number of networks to co-create this capability.',
  },
];

const partnerQuotes = [
  {
    quote: "Citizens for Change's skills seem limitless. They were able to look through data that seemed like a keyhole view on the work we do — the richness of what they showed us from an outsider's perspective shapes how we celebrate ourselves to date.",
    org: 'Femina Hip',
  },
  {
    quote: 'Citizens for Change brings insight and wisdom, commitment and rigour — but in a way that is pragmatic. They know what it takes to get things done.',
    org: 'Railway Children Africa',
  },
];

const partners = [
  { name: 'Action for Life Skills and Values in East Africa (ALiVE)', href: 'https://www.alive-reli.org/' },
  { name: 'Aga Khan Foundation', href: 'https://akf.org/' },
  { name: 'Better Care Network', href: 'https://bettercarenetwork.org/' },
  { name: "Child's i Foundation", href: 'https://childsifoundation.org/' },
  { name: 'Femina Hip', href: 'https://feminahip.or.tz/' },
  { name: 'Fielding Graduate University Institute for Social Innovation', href: 'https://www.fielding.edu/centers-and-initiatives/institute-for-social-innovation/' },
  { name: 'Fondation Botnar', href: 'https://www.fondationbotnar.org/' },
  { name: 'Human Sciences Research Council', href: 'https://hsrc.ac.za/' },
  { name: 'National Research Foundation of South Africa', href: 'https://www.nrf.ac.za/' },
  { name: 'Pamoja Leo', href: 'https://pamojaleo.org/' },
  { name: 'Porticus Foundation', href: 'https://www.porticus.com/' },
  { name: 'Railway Children', href: 'https://www.railwaychildren.org.uk/' },
  { name: 'The Foundation for Tomorrow (TFFT)', href: 'https://thefoundationfortomorrow.org/' },
  { name: 'Families and Futures Coalition of Tanzania', href: 'https://www.thesmallthings.org/' },
  { name: 'Familia Kwa Watoto Wote', href: 'https://familiakwawatoto.org/' },
  { name: 'Transform Alliance Africa', href: 'https://www.transformallianceafrica.com/' },
  { name: 'UBS Optimus Foundation', href: 'https://www.ubs.com/global/en/sustainability-impact/social-impact-and-philanthropy/optimus-foundation.html' },
  { name: 'UNICEF', href: 'https://www.unicef.org/' },
  { name: 'University of Dar es Salaam', href: 'https://www.udsm.ac.tz/' },
  { name: 'Women Fund Tanzania Trust', href: 'https://wftrust.or.tz/' },
  { name: 'World Childhood Foundation', href: 'https://childhood.org/' },
  { name: 'Zizi Afrique Foundation', href: 'https://ziziafrique.com/' },
];

// ─── homepage ────────────────────────────────────────────────────────────────

const HomePage: FC = () => {
  const [showCookieBanner, setShowCookieBanner] = useState(false);

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

      <main>
        {/* ── 1. Hero ── */}
        <section className={styles.banner}>
          <div className={styles.bannerInner}>
            <div className={styles.wrap}>
              <p className={styles.bannerEyebrow}>Learning Infrastructure for Good Organisations</p>
              <h1 className={styles.bannerTitle}>
                You are already doing the right thing.
                <span className={styles.loud}>
                  We will help you <span className={styles.underline}>prove it.</span>
                </span>
              </h1>
              <p className={styles.bannerSub}>
                Many good organisations change lives every day. Few have the ability to show what changed, how, or why.
                Citizens for Change is the infrastructure to evidence that impact, attract the funding that sustains it,
                and do good, better.
              </p>
            </div>
          </div>
        </section>

        {/* ── 2. The Challenge ── */}
        <section className={`${styles.section} ${styles.sectionGrey}`} id="what-we-hear">
          <div className={styles.wrap}>
            <p className={styles.eyebrow}>What We <u>Hear</u></p>
            <h2 className={`${styles.sectionTitle} ${styles.sectionTitleWide}`}>
              These are the conversations happening in good organisations right now.
            </h2>
            <p className={styles.sectionLede}>If any of these sound familiar, you are not alone and you are in the right place.</p>
            <div className={styles.hearGrid}>
              {hearCards.map((c) => (
                <article className={styles.hearCard} key={c.num}>
                  <span className={styles.num}>{c.num}</span>
                  <p className={styles.hook}>{c.hook}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. How We Respond ── */}
        <section className={styles.section} id="how-we-respond">
          <div className={styles.wrap}>
            <p className={styles.eyebrow}>How We <u>Respond</u></p>
            <h2 className={`${styles.sectionTitle} ${styles.sectionTitleWide}`}>
              Rigorous evidence shouldn&rsquo;t depend on what you can afford.
            </h2>
            <p className={styles.sectionLede}>
              Citizens for Change is learning infrastructure built to address all four of these concerns — designed to
              work within your existing capacity, without a team of consultants or specialist skills on staff, built on
              thirty years of practice in the field.
            </p>
            <div className={styles.whyGrid}>
              {whyCells.map((cell) => (
                <div className={styles.whyCell} key={cell.num}>
                  <div className={styles.whyHead}>
                    <span className={styles.num}>{cell.num}</span>
                    <p className={styles.k}>{cell.k}</p>
                  </div>
                  <h3 className={styles.cellTitle}>{cell.title}</h3>
                  <p className={styles.whyLead}>{cell.lead}</p>
                  <p>{cell.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. What We Do ── */}
        <section className={`${styles.section} ${styles.sectionGrey}`} id="what-c4c-is">
          <div className={styles.wrap}>
            <p className={styles.eyebrow}>What We <u>Do</u></p>
            <h2 className={styles.sectionTitle}>Find your learning infrastructure.</h2>
            <p className={styles.sectionLede}>
              The organisations that work with Citizens for Change don&rsquo;t just report more convincingly. They
              understand differently — about the people they serve and what&rsquo;s actually changing for them.
            </p>

            <div className={styles.featured}>
              <div>
                <span className={styles.badge}>Live</span>
                <h3>Citizens for Change Supported</h3>
                <p>
                  Citizens for Change Supported gives you the full learning infrastructure — stakeholder mapping,
                  theory of change, survey builder and results visualisation — with dedicated account management and
                  mentoring from the Citizens for Change team throughout. For established organisations running
                  several projects, ready to embed the shift across the team. Most first-year partners start here.
                </p>
                <a
                  className={styles.videoPanel}
                  href="https://www.youtube.com/watch?v=0lkan7DzACM&t=6s"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className={styles.play} aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </span>
                  <b>See it in Action &rarr;</b>
                </a>
              </div>
              <div className={styles.networkFrame}>
                <Image
                  className={styles.network}
                  src="/graphics/NETWORK MOTIF 04.png"
                  alt=""
                  fill
                />
              </div>
            </div>

            <div className={styles.offerGrid}>
              {offerCards.map((offer) => (
                <article className={styles.offer} key={offer.name}>
                  <p className={styles.offerStatus}>{offer.status}</p>
                  <h4>{offer.name}</h4>
                  <p className={styles.offerBody}>{offer.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. Who We Are ── */}
        <section className={styles.section} id="who-we-are">
          <div className={styles.wrap}>
            <p className={styles.eyebrow}>Who We <u>Are</u></p>
            <div className={styles.founder}>
              <div>
                <h2 className={styles.sectionTitle}>Thirty years asking what changed for people and why.</h2>
                <blockquote className={styles.founderStatement}>
                  <p>
                    &ldquo;After thirty years as a field researcher, consultant and activist across East Africa and the
                    UK, my practice has always returned to one distinction: not whether organisations are doing things
                    right — compliance, process, reporting — but whether they are doing the right thing: genuinely
                    understanding what changed for people. Citizens for Change is the infrastructure I built on that
                    conviction, so that any purpose-led organisation can access that foundation without reconstructing
                    it from scratch. Our team is young, predominantly female and predominantly East African — built
                    from within the communities and governance structures at the heart of this work.&rdquo;
                  </p>
                </blockquote>
                <p className={styles.attrib}>&mdash; Dr Kate McAlpine, Founder</p>
                <a
                  className={styles.textLink}
                  href="https://www.drkatemcalpine.co.uk/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Read Kate&rsquo;s full story &rarr;</span>
                </a>
              </div>
              <figure style={{ margin: 0 }}>
                <Image
                  className={styles.imgFounder}
                  src="/photos/CG - Dr.Kate-6.jpg.jpeg"
                  alt="Dr Kate McAlpine, founder of Citizens for Change"
                  width={1400}
                  height={1400}
                />
              </figure>
            </div>
          </div>
        </section>

        {/* ── 6. Why Citizens for Change ── */}
        <section className={`${styles.section} ${styles.sectionGrey}`} id="why-c4c">
          <div className={styles.wrap}>
            <p className={styles.eyebrow}>Why Citizens for <u>Change</u></p>
            <h2 className={`${styles.sectionTitle} ${styles.sectionTitleWide}`}>
              We are trusted by organisations doing the right thing.
            </h2>

            <div className={styles.quotes}>
              {partnerQuotes.map((q) => (
                <figure className={styles.quote} key={q.org}>
                  <p>&ldquo;{q.quote}&rdquo;</p>
                  <figcaption>{q.org}</figcaption>
                </figure>
              ))}
            </div>
          </div>

          <div className={styles.marquee} aria-label="Partner organisations">
            <div className={styles.marqueeTrack}>
              {partners.map((p) => (
                <a className={styles.tile} href={p.href} target="_blank" rel="noopener noreferrer" key={p.name}>
                  {p.name}
                </a>
              ))}
              {partners.map((p) => (
                <a
                  className={styles.tile}
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-hidden="true"
                  tabIndex={-1}
                  key={`${p.name}-dup`}
                >
                  {p.name}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── 7. Start the Conversation ── */}
        <section className={`${styles.section} ${styles.cta}`} id="start-the-conversation">
          <div className={`${styles.wrap} ${styles.ctaGrid}`}>
            <div>
              <p className={styles.eyebrow}>Start the <u>Conversation</u></p>
              <h2 className={styles.ctaHeading}>
                Let us make your <span className={styles.underline}>impact visible.</span>
              </h2>
              <p className={styles.ctaBody}>
                If the question your organisation keeps returning to is not &ldquo;are we doing this right?&rdquo; but
                &ldquo;are we doing the right thing?&rdquo; — that is the conversation we exist to have. Tell us where
                you are and what you are trying to understand. We will be honest about whether Citizens for Change is
                the right fit, and what a useful next step looks like.
              </p>
              <a
                className={styles.btnPrimary}
                href="mailto:hannah@citizens4change.net?subject=Starting%20a%20conversation%20with%20Citizens%20for%20Change"
              >
                Start the conversation &rarr;
              </a>
            </div>
            <div className={styles.motifFrame}>
              <Image className={styles.motif} src="/graphics/PIXELS_WITH HERO IMAGE_OPTION 01.png" alt="" fill />
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {showCookieBanner && <CookieBanner />}
    </div>
  );
};

export default HomePage;
