import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { FaBolt, FaTools, FaCog, FaIndustry, FaShieldAlt, FaPhoneAlt, FaChevronRight, FaCheckCircle, FaStar, FaHandshake } from 'react-icons/fa'
import { HiLightningBolt } from 'react-icons/hi'
import { useLanguage } from '../i18n/LanguageContext'
import { getIcon } from '../components/IconMap'
import { servicesData } from '../data/staticData'
import ScrollReveal from '../components/ScrollReveal'
import './Home.css'

function Counter({ end, suffix = '', duration = 2000 }) {
    const [count, setCount] = useState(0)
    const ref = useRef(null)
    const started = useRef(false)

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !started.current) {
                started.current = true
                let start = 0
                const step = end / (duration / 16)
                const timer = setInterval(() => {
                    start += step
                    if (start >= end) {
                        setCount(end)
                        clearInterval(timer)
                    } else {
                        setCount(Math.floor(start))
                    }
                }, 16)
            }
        }, { threshold: 0.5 })

        if (ref.current) observer.observe(ref.current)
        return () => observer.disconnect()
    }, [end, duration])

    return <span ref={ref}>{count}{suffix}</span>
}

// Fallback clients for the ticker
const fallbackClients = [
    'STEG', 'Tunisie Télécom', 'ONAS', 'ONT',
    'Ministère de la Santé', 'Ministère de l\'Agriculture',
    'CNSS', 'Hôpital Rabta', 'OCT', 'SNCFT',
]

export default function Home() {
    const { language, t } = useLanguage()
    const clientNames = fallbackClients

    // Build services for display using static data (first 6)
    const displayServices = servicesData.slice(0, 6).map(srv => ({
        icon: getIcon(srv.iconName),
        title: srv.title?.[language] || srv.title?.fr || '',
        desc: srv.desc?.[language] || srv.desc?.fr || '',
    }))

    return (
        <div className="home">
            {/* ====== HERO ====== */}
            <section className="hero">
                <div className="hero-bg">
                    <div className="hero-grid-overlay"></div>
                    <div className="hero-gradient"></div>
                </div>
                <div className="container hero-content">
                    <div className="hero-text">
                        <div className="hero-badge">
                            <FaBolt /> {t('home.badge')}
                        </div>
                        <h1>
                            {t('home.heroTitle1')}<span className="text-red">{t('home.heroTitle2')}</span>{t('home.heroTitle3')}
                            <span className="text-red">{t('home.heroTitle4')}</span>{t('home.heroTitle5')}
                        </h1>
                        <p className="hero-subtitle">{t('home.heroSubtitle')}</p>
                        <div className="hero-actions">
                            <Link to="/services" className="btn btn-primary">
                                {t('home.ourServices')} <FaChevronRight />
                            </Link>
                            <Link to="/contact" className="btn btn-outline">
                                {t('home.contactUs')}
                            </Link>
                        </div>
                        <div className="hero-trust">
                            <FaCheckCircle />
                            <span>{t('home.agrementB2')}</span>
                            <FaCheckCircle />
                            <span>{t('home.agreedSTEG')}</span>
                            <FaCheckCircle />
                            <span>{t('home.urgency')}</span>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="hero-logo-wrap">
                            <div className="hero-logo-glow"></div>
                            <img src="/logo.png" alt="EMIRA Logo" className="hero-logo-img" />
                        </div>
                    </div>
                </div>
                <div className="hero-wave">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" />
                    </svg>
                </div>
            </section>

            {/* ====== STATS ====== */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid">
                        <ScrollReveal>
                            <div className="stat-card">
                                <div className="stat-icon"><FaStar /></div>
                                <div className="stat-number"><Counter end={35} suffix="+" /></div>
                                <div className="stat-label">{t('home.yearsExp')}</div>
                            </div>
                        </ScrollReveal>
                        <ScrollReveal delay={100}>
                            <div className="stat-card">
                                <div className="stat-icon"><FaHandshake /></div>
                                <div className="stat-number"><Counter end={200} suffix="+" /></div>
                                <div className="stat-label">{t('home.happyClients')}</div>
                            </div>
                        </ScrollReveal>
                        <ScrollReveal delay={200}>
                            <div className="stat-card">
                                <div className="stat-icon"><FaTools /></div>
                                <div className="stat-number"><Counter end={15} suffix="" /></div>
                                <div className="stat-label">{t('home.govCovered')}</div>
                            </div>
                        </ScrollReveal>
                        <ScrollReveal delay={300}>
                            <div className="stat-card">
                                <div className="stat-icon"><FaBolt /></div>
                                <div className="stat-number"><Counter end={1000} suffix="+" /></div>
                                <div className="stat-label">{t('home.projectsDone')}</div>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* ====== SERVICES ====== */}
            <section className="services-preview">
                <div className="container">
                    <ScrollReveal>
                        <div className="section-title">
                            <div className="label">{t('home.whatWeDo')}</div>
                            <h2>{t('home.ourProServices')}</h2>
                            <p>{t('home.servicesSubtitle')}</p>
                        </div>
                    </ScrollReveal>
                    <div className="services-grid">
                        {displayServices.map((service, i) => (
                            <ScrollReveal key={i} delay={i * 80}>
                                <div className="service-card">
                                    <div className="service-icon">{service.icon}</div>
                                    <h3>{service.title}</h3>
                                    <p>{service.desc}</p>
                                    <Link to="/services" className="service-link">
                                        {t('home.learnMore')} <FaChevronRight />
                                    </Link>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                    <div className="services-cta">
                        <Link to="/services" className="btn btn-navy">
                            {t('home.viewAllServices')} <FaChevronRight />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ====== CLIENTS ====== */}
            <section className="clients-preview">
                <div className="container">
                    <ScrollReveal>
                        <div className="section-title">
                            <div className="label">{t('home.theyTrustUs')}</div>
                            <h2>{t('home.ourPartners')}</h2>
                            <p>{t('home.partnersSubtitle')}</p>
                        </div>
                    </ScrollReveal>
                    <ScrollReveal>
                        <div className="clients-ticker">
                            <div className="ticker-track">
                                {[...clientNames, ...clientNames].map((client, i) => (
                                    <div key={i} className="client-badge">{client}</div>
                                ))}
                            </div>
                        </div>
                    </ScrollReveal>
                    <div className="clients-cta">
                        <Link to="/clients" className="btn btn-primary">
                            {t('home.allReferences')} <FaChevronRight />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ====== CTA ====== */}
            <section className="cta-section">
                <div className="container">
                    <ScrollReveal>
                        <div className="cta-box">
                            <div className="cta-content">
                                <h2>{t('home.ctaTitle')}</h2>
                                <p>{t('home.ctaSubtitle')}</p>
                                <div className="cta-actions">
                                    <a href="tel:+21620832832" className="btn btn-primary">
                                        <FaPhoneAlt /> {t('home.ctaCall')}: 20 832 832
                                    </a>
                                    <Link to="/contact" className="btn btn-outline">
                                        {t('home.ctaQuote')}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>
        </div>
    )
}
