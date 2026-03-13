import { useState, useEffect } from 'react'
import { FaShieldAlt, FaPhoneAlt, FaChevronRight } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import { getIcon } from '../components/IconMap'
import ScrollReveal from '../components/ScrollReveal'
import './Services.css'

// Fallback data (used while API loads or if it fails)
const fallbackServices = []

export default function Services() {
    const { language, t } = useLanguage()
    const [servicesData, setServicesData] = useState(fallbackServices)
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        fetch('/api/services')
            .then(res => res.json())
            .then(data => {
                if (data.services) setServicesData(data.services)
                setLoaded(true)
            })
            .catch(() => setLoaded(true))
    }, [])

    const ctaTitle = language === 'en' ? 'Need a quote or an intervention?' : "Besoin d'un devis ou d'une intervention?"
    const ctaSubtitle = language === 'en' ? 'Our team is at your disposal to study your needs and offer the best solution.' : 'Notre équipe est à votre disposition pour étudier vos besoins et proposer la meilleure solution.'
    const ctaCall = language === 'en' ? 'Call' : 'Appeler'
    const ctaQuote = language === 'en' ? 'Request a Quote' : 'Demander un Devis'

    return (
        <div className="services-page">
            {/* Header */}
            <section className="page-header">
                <div className="page-header-bg"></div>
                <div className="container page-header-content">
                    <h1>{t('services.pageTitle')}<span className="text-red">{t('services.pageTitleHighlight')}</span></h1>
                    <p>{t('services.pageSubtitle')}</p>
                </div>
            </section>

            {/* Services Grid */}
            <section className="services-full">
                <div className="container">
                    <div className="services-full-grid">
                        {servicesData.map((service, i) => (
                            <ScrollReveal key={service.id || i} delay={i * 60}>
                                <div className="service-full-card">
                                    <div className="sfc-header">
                                        <div className="sfc-icon">{getIcon(service.iconName)}</div>
                                        <h3>{service.title?.[language] || service.title?.fr || ''}</h3>
                                    </div>
                                    <p className="sfc-desc">{service.desc?.[language] || service.desc?.fr || ''}</p>
                                    <ul className="sfc-features">
                                        {(service.features?.[language] || service.features?.fr || []).map((f, j) => (
                                            <li key={j}><FaShieldAlt /> {f}</li>
                                        ))}
                                    </ul>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="services-cta-section">
                <div className="container">
                    <ScrollReveal>
                        <div className="cta-box">
                            <div className="cta-content">
                                <h2>{ctaTitle}</h2>
                                <p>{ctaSubtitle}</p>
                                <div className="cta-actions">
                                    <a href="tel:+21620832832" className="btn btn-primary">
                                        <FaPhoneAlt /> {ctaCall}: 20 832 832
                                    </a>
                                    <Link to="/contact" className="btn btn-outline">
                                        {ctaQuote} <FaChevronRight />
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
