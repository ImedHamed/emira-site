import { Link } from 'react-router-dom'
import { FaPhone, FaFax, FaEnvelope, FaMapMarkerAlt, FaBolt, FaArrowUp } from 'react-icons/fa'
import { useLanguage } from '../i18n/LanguageContext'
import './Footer.css'

export default function Footer() {
    const { language, t } = useLanguage()

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const footerDesc = t('footer.description')

    const servicesLinks = language === 'en'
        ? [
            { label: 'Electrical Installation', path: '/services' },
            { label: 'Industrial Maintenance', path: '/services' },
            { label: 'Motor Rewinding', path: '/services' },
            { label: 'Power Generators', path: '/services' },
            { label: 'Emergency Repair', path: '/services' },
        ]
        : [
            { label: 'Installation Électrique', path: '/services' },
            { label: 'Maintenance Industrielle', path: '/services' },
            { label: 'Rebobinage Moteurs', path: '/services' },
            { label: 'Groupes Électrogènes', path: '/services' },
            { label: "Dépannage d'Urgence", path: '/services' },
        ]

    const urgencyLabel = t('footer.ourServices') === 'Our Services' ? '24/7 Emergency' : 'Urgences 24/7'

    return (
        <footer className="footer">
            <div className="footer-top">
                <div className="container">
                    <div className="footer-grid">
                        {/* Company Info */}
                        <div className="footer-col">
                            <div className="footer-brand">
                                <img src="/logo.png" alt="EMIRA" className="footer-logo" />
                                <h3>EMIRA</h3>
                            </div>
                            <p className="footer-desc">{footerDesc}</p>
                            <div className="footer-badge">
                                <FaBolt />
                                <span>SARL au capital 250.000 DT</span>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="footer-col">
                            <h4>Navigation</h4>
                            <ul className="footer-links">
                                <li><Link to="/">{t('nav.home')}</Link></li>
                                <li><Link to="/about">{t('nav.about')}</Link></li>
                                <li><Link to="/services">{t('nav.services')}</Link></li>
                                <li><Link to="/clients">{t('nav.references')}</Link></li>
                                <li><Link to="/contact">{t('nav.contact')}</Link></li>
                            </ul>
                        </div>

                        {/* Services */}
                        <div className="footer-col">
                            <h4>{t('footer.ourServices')}</h4>
                            <ul className="footer-links">
                                {servicesLinks.map((link, i) => (
                                    <li key={i}><Link to={link.path}>{link.label}</Link></li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact */}
                        <div className="footer-col">
                            <h4>{t('nav.contact')}</h4>
                            <ul className="footer-contact">
                                <li><FaMapMarkerAlt /><span>Route de Sousse Km6, Mégrine 2033</span></li>
                                <li><FaPhone /><a href="tel:+21671432099">71 432 099</a></li>
                                <li><FaFax /><span>71 433 458</span></li>
                                <li><FaEnvelope /><a href="mailto:emira@emira.com.tn">emira@emira.com.tn</a></li>
                            </ul>
                            <div className="footer-emergency">
                                <FaPhone className="pulse-icon" />
                                <div>
                                    <span className="emergency-label">{urgencyLabel}</span>
                                    <a href="tel:+21620832832" className="emergency-number">20 832 832</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container">
                    <p>&copy; {new Date().getFullYear()} EMIRA — {t('footer.rights')}</p>
                    <button className="scroll-top" onClick={scrollToTop} aria-label="Back to top">
                        <FaArrowUp />
                    </button>
                </div>
            </div>
        </footer>
    )
}
