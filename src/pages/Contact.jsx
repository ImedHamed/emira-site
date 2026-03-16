import { useState, useEffect } from 'react'
import { FaPhone, FaFax, FaEnvelope, FaMapMarkerAlt, FaPhoneAlt, FaClock, FaCheckCircle, FaTimes } from 'react-icons/fa'
import { useLanguage } from '../i18n/LanguageContext'
import { getIcon } from '../components/IconMap'
import ScrollReveal from '../components/ScrollReveal'
import './Contact.css'

export default function Contact() {
    const { language, t } = useLanguage()
    const [servicesList, setServicesList] = useState([])

    useEffect(() => {
        fetch('/api/services')
            .then(res => res.json())
            .then(data => {
                if (data.services) {
                    setServicesList(data.services.map(srv => ({
                        id: `srv_${srv.id}`,
                        label: srv.title?.[language] || srv.title?.fr || '',
                        icon: getIcon(srv.iconName),
                    })))
                }
            })
            .catch(() => { })
    }, [language])

    const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
    const [submitted, setSubmitted] = useState(false)
    const [sending, setSending] = useState(false)
    const [error, setError] = useState(false)
    const [showServiceModal, setShowServiceModal] = useState(false)
    const [selectedServices, setSelectedServices] = useState([])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSending(true)
        setError(false)

        const selectedLabels = servicesList
            .filter(s => selectedServices.includes(s.id))
            .map(s => s.label)

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone || 'Non renseigné',
                    subject: formData.subject,
                    message: formData.message,
                    services: selectedLabels.length > 0 ? selectedLabels.join(' • ') : 'Aucun service spécifique',
                }),
            })

            const data = await response.json()

            if (data.success) {
                setSubmitted(true)
                setTimeout(() => setSubmitted(false), 6000)
                setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
                setSelectedServices([])
            } else {
                setError(true)
                setTimeout(() => setError(false), 5000)
            }
        } catch (err) {
            console.error('Error:', err)
            setError(true)
            setTimeout(() => setError(false), 5000)
        } finally {
            setSending(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
        if (name === 'subject' && value === 'devis') {
            setShowServiceModal(true)
        }
    }

    const toggleService = (serviceId) => {
        setSelectedServices(prev =>
            prev.includes(serviceId)
                ? prev.filter(id => id !== serviceId)
                : [...prev, serviceId]
        )
    }

    const confirmServices = () => {
        const selectedLabels = servicesList
            .filter(s => selectedServices.includes(s.id))
            .map(s => s.label)
            .join(', ')

        setFormData(prev => ({
            ...prev,
            message: prev.message
                ? `${prev.message}\n\n${language === 'en' ? 'Requested services' : 'Services demandés'}: ${selectedLabels}`
                : `${language === 'en' ? 'Requested services' : 'Services demandés'}: ${selectedLabels}`
        }))
        setShowServiceModal(false)
    }

    const selectedLabel = language === 'en' ? 'Selected services:' : 'Services sélectionnés:'
    const modifyBtn = language === 'en' ? '+ Modify' : '+ Modifier'
    const modalSubtitle = language === 'en' ? 'Check the services you would like a quote for.' : 'Cochez les services pour lesquels vous souhaitez un devis.'
    const hoursValue = language === 'en' ? 'Mon - Sat: 8:00 AM - 6:00 PM' : 'Lun - Sam: 8h00 - 18h00'
    const urgencies = language === 'en' ? 'Emergencies: 24/7' : 'Urgences: 24/7'
    const urgencyLabel = language === 'en' ? '24/7 Emergency' : 'Urgences 24/7'

    return (
        <div className="contact-page">
            {/* Header */}
            <section className="page-header">
                <div className="page-header-bg"></div>
                <div className="container page-header-content">
                    <h1>{t('contact.pageTitle')}<span className="text-red">{t('contact.pageTitleHighlight')}</span></h1>
                    <p>{t('contact.pageSubtitle')}</p>
                </div>
            </section>

            {/* Contact Content */}
            <section className="contact-content">
                <div className="container">
                    <div className="contact-grid">
                        {/* Contact Info */}
                        <ScrollReveal>
                            <div className="contact-info">
                                <h2>{t('contact.infoTitle')}</h2>
                                <p className="info-subtitle">{t('contact.infoSubtitle')}</p>

                                <div className="info-cards">
                                    <div className="info-card">
                                        <div className="info-icon"><FaMapMarkerAlt /></div>
                                        <div>
                                            <h4>{t('contact.address')}</h4>
                                            <p>Route de Sousse Km6<br />Mégrine 2033, Tunisie</p>
                                        </div>
                                    </div>
                                    <div className="info-card">
                                        <div className="info-icon"><FaPhone /></div>
                                        <div>
                                            <h4>{t('contact.phone')}</h4>
                                            <a href="tel:+21671432099">71 432 099</a>
                                        </div>
                                    </div>
                                    <div className="info-card">
                                        <div className="info-icon"><FaFax /></div>
                                        <div>
                                            <h4>{t('contact.fax')}</h4>
                                            <p>71 433 458</p>
                                        </div>
                                    </div>
                                    <div className="info-card">
                                        <div className="info-icon"><FaEnvelope /></div>
                                        <div>
                                            <h4>{t('contact.email')}</h4>
                                            <a href="mailto:emira@emira.com.tn">emira@emira.com.tn</a><br />
                                            <a href="mailto:emira.maher@yahoo.com">emira.maher@yahoo.com</a>
                                        </div>
                                    </div>
                                    <div className="info-card">
                                        <div className="info-icon"><FaClock /></div>
                                        <div>
                                            <h4>{t('contact.hours')}</h4>
                                            <p>{hoursValue}<br />{urgencies}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="emergency-box">
                                    <FaPhoneAlt className="emergency-icon" />
                                    <div>
                                        <span className="emergency-label">{urgencyLabel}</span>
                                        <a href="tel:+21620832832" className="emergency-number">20 832 832</a>
                                        <span className="emergency-sep"> / </span>
                                        <a href="tel:+21650832259" className="emergency-number">50 832 259</a>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Contact Form */}
                        <ScrollReveal delay={100}>
                            <div className="contact-form-wrap">
                                <h2>{t('contact.formTitle')}</h2>
                                <p className="form-subtitle">{t('contact.formSubtitle')}</p>

                                {submitted && (
                                    <div className="success-message">
                                        <FaCheckCircle />
                                        <span>{t('contact.successMsg')}</span>
                                    </div>
                                )}

                                {error && (
                                    <div className="error-message">
                                        <FaTimes />
                                        <span>{t('contact.errorMsg')}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="contact-form">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="name">{t('contact.labelName')} *</label>
                                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder={t('contact.placeholderName')} required />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="email">{t('contact.labelEmail')} *</label>
                                            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder={t('contact.placeholderEmail')} required />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="phone">{t('contact.labelPhone')}</label>
                                            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder={t('contact.placeholderPhone')} />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="subject">{t('contact.labelSubject')} *</label>
                                            <select id="subject" name="subject" value={formData.subject} onChange={handleChange} required>
                                                <option value="">{t('contact.selectSubject')}</option>
                                                <option value="devis">{t('contact.subjectDevis')}</option>
                                                <option value="intervention">{t('contact.subjectIntervention')}</option>
                                                <option value="maintenance">{t('contact.subjectMaintenance')}</option>
                                                <option value="info">{t('contact.subjectInfo')}</option>
                                                <option value="urgence">{t('contact.subjectUrgence')}</option>
                                                <option value="autre">{t('contact.subjectAutre')}</option>
                                            </select>
                                        </div>
                                    </div>

                                    {selectedServices.length > 0 && (
                                        <div className="selected-services">
                                            <label>{selectedLabel}</label>
                                            <div className="service-tags">
                                                {selectedServices.map(id => {
                                                    const service = servicesList.find(s => s.id === id)
                                                    return (
                                                        <span key={id} className="service-tag">
                                                            {service?.label}
                                                            <button type="button" onClick={() => toggleService(id)} className="tag-remove">
                                                                <FaTimes />
                                                            </button>
                                                        </span>
                                                    )
                                                })}
                                                <button type="button" className="add-service-btn" onClick={() => setShowServiceModal(true)}>
                                                    {modifyBtn}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="form-group full">
                                        <label htmlFor="message">{t('contact.labelMessage')} *</label>
                                        <textarea id="message" name="message" value={formData.message} onChange={handleChange} placeholder={t('contact.placeholderMessage')} rows="5" required />
                                    </div>
                                    <button type="submit" className="btn btn-primary submit-btn" disabled={sending}>
                                        {sending ? t('contact.sending') : t('contact.send')}
                                    </button>
                                </form>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* Map */}
            <section className="map-section">
                <ScrollReveal>
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3195.2!2d10.2389!3d36.7678!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12fd4b4e4e4e4e4e%3A0x0!2sRoute+de+Sousse+Km+6+M%C3%A9grine!5e0!3m2!1sfr!2stn!4v1234567890"
                        width="100%"
                        height="450"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="EMIRA Location"
                    ></iframe>
                </ScrollReveal>
            </section>

            {/* Service Selection Modal */}
            {showServiceModal && (
                <div className="modal-overlay" onClick={() => setShowServiceModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{t('contact.modalTitle')}</h3>
                            <button className="modal-close" onClick={() => setShowServiceModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <p className="modal-subtitle">{modalSubtitle}</p>
                        <div className="modal-services-grid">
                            {servicesList.map(service => (
                                <label
                                    key={service.id}
                                    className={`modal-service-item ${selectedServices.includes(service.id) ? 'selected' : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedServices.includes(service.id)}
                                        onChange={() => toggleService(service.id)}
                                    />
                                    <span className="modal-service-icon">{service.icon}</span>
                                    <span className="modal-service-label">{service.label}</span>
                                    <span className="modal-service-check"><FaCheckCircle /></span>
                                </label>
                            ))}
                        </div>
                        <div className="modal-footer">
                            <span className="modal-count">
                                {selectedServices.length} {t('contact.servicesSelected')}
                            </span>
                            <button className="btn btn-primary" onClick={confirmServices}>
                                {t('contact.modalConfirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
