import { useState, useEffect } from 'react'
import { FaMapMarkerAlt, FaPhoneAlt, FaChevronRight } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import { getIcon } from '../components/IconMap'
import ScrollReveal from '../components/ScrollReveal'
import './Clients.css'

export default function Clients() {
    const { language, t } = useLanguage()
    const [publicClients, setPublicClients] = useState([])
    const [privateClients, setPrivateClients] = useState([])
    const [regions, setRegions] = useState([])

    useEffect(() => {
        fetch('/api/clients')
            .then(res => res.json())
            .then(data => {
                if (data.publicClients) setPublicClients(data.publicClients)
                if (data.privateClients) setPrivateClients(data.privateClients)
                if (data.regions) setRegions(data.regions)
            })
            .catch(() => { })
    }, [])

    const getName = (item) => item.name?.[language] || item.name?.fr || ''
    const getDesc = (item) => item.desc?.[language] || item.desc?.fr || ''

    const publicTitle = language === 'en' ? 'State Institutions & Agencies' : "Institutions & Organismes d'État"
    const publicSubtitle = language === 'en' ? 'Framework contracts with the largest Tunisian institutions.' : 'Contrats cadres avec les plus grandes institutions tunisiennes.'
    const privateTitle = language === 'en' ? 'Private & Industrial Clients' : 'Clients Privés & Industriels'
    const privateSubtitle = language === 'en' ? 'Hotels, industries, agri-food and much more.' : 'Hôtels, industries, agroalimentaires et bien plus.'
    const coverageSubtitle = language === 'en' ? 'Intervention in over 15 governorates across Tunisia.' : 'Intervention dans plus de 15 gouvernorats à travers la Tunisie.'
    const ctaTitle = language === 'en' ? 'Join our satisfied clients' : 'Rejoignez nos clients satisfaits'
    const ctaSubtitle = language === 'en' ? 'Contact us to discuss your electricity and maintenance needs.' : 'Contactez-nous pour discuter de vos besoins en électricité et maintenance.'
    const headerSubtitle = language === 'en' ? 'Over 200 clients have trusted us since 1987' : 'Plus de 200 clients nous font confiance depuis 1987'

    return (
        <div className="clients-page">
            {/* Header */}
            <section className="page-header">
                <div className="page-header-bg"></div>
                <div className="container page-header-content">
                    <h1>{t('clients.pageTitle')}<span className="text-red">{t('clients.pageTitleHighlight')}</span></h1>
                    <p>{headerSubtitle}</p>
                </div>
            </section>

            {/* Public Clients */}
            <section className="clients-section">
                <div className="container">
                    <ScrollReveal>
                        <div className="section-title">
                            <div className="label">{t('clients.publicLabel')}</div>
                            <h2>{publicTitle}</h2>
                            <p>{publicSubtitle}</p>
                        </div>
                    </ScrollReveal>
                    <div className="clients-grid public-grid">
                        {publicClients.map((client, i) => (
                            <ScrollReveal key={client.id || i} delay={Math.min(i * 30, 300)}>
                                <div className="client-card">
                                    <div className="client-icon">{getIcon(client.iconName)}</div>
                                    <div className="client-info">
                                        <h4>{getName(client)}</h4>
                                        <p>{getDesc(client)}</p>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Private Clients */}
            <section className="clients-section clients-private">
                <div className="container">
                    <ScrollReveal>
                        <div className="section-title">
                            <div className="label">{t('clients.privateLabel')}</div>
                            <h2>{privateTitle}</h2>
                            <p>{privateSubtitle}</p>
                        </div>
                    </ScrollReveal>
                    <div className="clients-grid private-grid">
                        {privateClients.map((cat, i) => (
                            <ScrollReveal key={cat.id || i} delay={i * 60}>
                                <div className="client-card private">
                                    <div className="client-icon private-icon">{getIcon(cat.iconName)}</div>
                                    <div className="client-info">
                                        <h4>{getName(cat)}</h4>
                                        <p>{getDesc(cat)}</p>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Coverage Map */}
            <section className="coverage-section">
                <div className="container">
                    <ScrollReveal>
                        <div className="section-title">
                            <div className="label">{t('clients.coverageLabel')}</div>
                            <h2>{t('clients.coverageTitle')}</h2>
                            <p>{coverageSubtitle}</p>
                        </div>
                    </ScrollReveal>
                    <ScrollReveal>
                        <div className="regions-grid">
                            {regions.map((region, i) => (
                                <div key={i} className="region-badge">
                                    <FaMapMarkerAlt />
                                    {region}
                                </div>
                            ))}
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* CTA */}
            <section className="clients-cta-section">
                <div className="container">
                    <ScrollReveal>
                        <div className="cta-box">
                            <div className="cta-content">
                                <h2>{ctaTitle}</h2>
                                <p>{ctaSubtitle}</p>
                                <div className="cta-actions">
                                    <Link to="/contact" className="btn btn-primary">
                                        {t('nav.contact')} <FaChevronRight />
                                    </Link>
                                    <a href="tel:+21620832832" className="btn btn-outline">
                                        <FaPhoneAlt /> 20 832 832
                                    </a>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>
        </div>
    )
}
