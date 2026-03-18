import { useState, useEffect } from 'react'
import { FaAward, FaUsers, FaHistory, FaPhoneAlt, FaEnvelope, FaBolt, FaCheckCircle } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import { getIcon } from '../components/IconMap'
import { API_URL } from '../api'
import ScrollReveal from '../components/ScrollReveal'
import './About.css'

const timelineData = {
    fr: [
        { year: '1987', title: 'Fondation', desc: 'Création de EMIRA SARL à Mégrine, spécialisée en maintenance électrique.' },
        { year: '1990s', title: 'Expansion', desc: 'Premiers contrats cadres avec la STEG et les institutions gouvernementales.' },
        { year: '2000s', title: 'Croissance', desc: 'Extension des activités à 15 gouvernorats. Contrats avec Tunisie Télécom, ONAS, ONT.' },
        { year: '2010s', title: 'Diversification', desc: "Ajout des services de qualité de puissance, batteries filtrées et économie d'énergie." },
        { year: "Aujourd'hui", title: 'Leader', desc: "Plus de 35 ans d'expertise, équipe qualifiée, interventions rapides 24/7." },
    ],
    en: [
        { year: '1987', title: 'Foundation', desc: 'Creation of EMIRA SARL in Megrine, specialized in electrical maintenance.' },
        { year: '1990s', title: 'Expansion', desc: 'First framework contracts with STEG and government institutions.' },
        { year: '2000s', title: 'Growth', desc: 'Extension of activities to 15 governorates. Contracts with Tunisie Télécom, ONAS, ONT.' },
        { year: '2010s', title: 'Diversification', desc: 'Added power quality services, filtered batteries and energy savings.' },
        { year: 'Today', title: 'Leader', desc: 'Over 35 years of expertise, qualified team, rapid 24/7 interventions.' },
    ],
}

const equipmentPhotos = [
    {
        src: '/schema-cablage-TGBT.jpg.jpeg',
        label: { fr: 'Tableau Général Basse Tension (TGBT)', en: 'Main Low Voltage Switchboard (MLVS)' },
        span: 'wide',
    },
    {
        src: '/b45769af1adfcc640bd2fc9a6e71195f.jpg.jpeg',
        label: { fr: 'Poste de Transformation', en: 'Transformer Station' },
        span: 'normal',
    },
    {
        src: '/GROUPE-ELECTROGENE-INGCO-1200W-1.webp',
        label: { fr: 'Groupe Électrogène', en: 'Power Generator' },
        span: 'normal',
    },
    {
        src: '/transformateur-cabine-scaled-1-1024x768.jpg.jpeg',
        label: { fr: 'Cabine de Transformation', en: 'Transformer Cabin' },
        span: 'normal',
    },
    {
        src: '/images.jpg.jpeg',
        label: { fr: 'Transformateurs HT/MT', en: 'HV/MV Transformers' },
        span: 'normal',
    },
]

const certifications = [
    {
        title: 'Agrément B2/C3',
        desc: { fr: "Ministère de l'Équipement et de l'Habitat", en: 'Ministry of Equipment and Housing' },
        icon: <FaAward />,
    },
    {
        title: 'Agréée STEG',
        desc: { fr: "Société Tunisienne de l'Électricité et du Gaz", en: 'Tunisian Electricity and Gas Company' },
        icon: <FaCheckCircle />,
    },
    {
        title: 'SARL — 250.000 DT',
        desc: { fr: 'Société à Responsabilité Limitée au capital de 250.000 DT', en: 'Limited Liability Company with a capital of 200,000 DT' },
        icon: <FaBolt />,
    },
]

export default function About() {
    const { language, t } = useLanguage()
    const timeline = timelineData[language] || timelineData.fr
    const [team, setTeam] = useState([])

    useEffect(() => {
        fetch(`${API_URL}/api/team`)
            .then(res => res.json())
            .then(data => { if (data.team) setTeam(data.team) })
            .catch(() => {})
    }, [])

    const aboutP1 = language === 'en'
        ? "Founded in 1987, <strong>EMIRA</strong> (Electro Maintenance Intervention Rapide) is a Tunisian company specialized in electrical installations, industrial maintenance and emergency repairs."
        : "Fondée en 1987, <strong>EMIRA</strong> (Electro Maintenance Intervention Rapide) est une société tunisienne spécialisée dans les installations électriques, la maintenance industrielle et le dépannage d'urgence."

    const aboutP2 = language === 'en'
        ? 'Based in Megrine on Route de Sousse Km6, we operate throughout the entire Tunisian territory with a qualified team of engineers and technicians.'
        : "Basée à Mégrine sur la Route de Sousse Km6, nous intervenons à travers tout le territoire tunisien avec une équipe qualifiée d'ingénieurs et de techniciens."

    const aboutP3 = language === 'en'
        ? '"Whatever your problem, we have the solution"'
        : '"Quelque soit votre problème, nous avons la solution"'

    const ourHistoryLabel = language === 'en' ? 'Our History' : 'Notre Histoire'
    const aboutTitle = language === 'en' ? "Over 35 years of electrical expertise" : "Plus de 35 ans d'expertise électrique"
    const ourMotto = language === 'en' ? 'Our motto: ' : 'Notre devise : '
    const govs = language === 'en' ? '15 Governorates' : '15 Gouvernorats'
    const equipLabel = language === 'en' ? 'Our Equipment' : 'Nos Équipements'
    const equipTitle = language === 'en' ? 'Professional Equipment' : 'Équipements Professionnels'
    const equipSubtitle = language === 'en'
        ? 'We work with the best electrical infrastructure and industrial equipment.'
        : 'Nous travaillons avec les meilleures infrastructures électriques et équipements industriels.'
    const timelineLabel = language === 'en' ? 'Our Journey' : 'Notre Parcours'
    const timelineTitle = language === 'en' ? "EMIRA's History" : "L'histoire d'EMIRA"
    const teamLabel = language === 'en' ? 'Our Team' : 'Notre Équipe'
    const teamTitle = language === 'en' ? 'The Leaders' : 'Les Responsables'
    const teamSubtitle = language === 'en' ? 'A qualified team at your service.' : 'Une équipe qualifiée à votre service.'
    const certLabel = language === 'en' ? 'Our Certifications' : 'Nos Agréments'
    const certTitle = language === 'en' ? 'Certifications & Approvals' : 'Certifications & Agréments'

    return (
        <div className="about-page">
            {/* Header */}
            <section className="page-header">
                <div className="page-header-bg"></div>
                <div className="container page-header-content">
                    <h1>{t('about.pageTitle')}<span className="text-red"> {t('about.pageTitleHighlight')}</span></h1>
                    <p>{t('about.pageSubtitle')}</p>
                </div>
            </section>

            {/* Company Info */}
            <section className="about-intro">
                <div className="container">
                    <div className="about-intro-grid">
                        <ScrollReveal>
                            <div className="about-logo-side">
                                <img src="/logo.png" alt="EMIRA Logo" className="about-logo" />
                            </div>
                        </ScrollReveal>
                        <ScrollReveal delay={100}>
                            <div className="about-text-side">
                                <div className="label"><FaBolt /> {ourHistoryLabel}</div>
                                <h2>{aboutTitle}</h2>
                                <p dangerouslySetInnerHTML={{ __html: aboutP1 }} />
                                <p>{aboutP2}</p>
                                <p>{ourMotto}<em>{aboutP3}</em></p>
                                <div className="about-highlights">
                                    <div className="highlight"><FaCheckCircle /><span>{t('about.highlight1')}</span></div>
                                    <div className="highlight"><FaCheckCircle /><span>{t('about.highlight2')}</span></div>
                                    <div className="highlight"><FaCheckCircle /><span>{govs}</span></div>
                                    <div className="highlight"><FaCheckCircle /><span>{t('about.highlight4')}</span></div>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* Equipment Gallery */}
            <section className="equipment-section">
                <div className="container">
                    <ScrollReveal>
                        <div className="section-title">
                            <div className="label">{equipLabel}</div>
                            <h2>{equipTitle}</h2>
                            <p>{equipSubtitle}</p>
                        </div>
                    </ScrollReveal>
                    <div className="equipment-grid">
                        {equipmentPhotos.map((photo, i) => (
                            <ScrollReveal key={i} delay={i * 100}>
                                <div className={`equipment-card ${photo.span === 'wide' ? 'equipment-card--wide' : ''}`}>
                                    <div className="equipment-img-wrap">
                                        <img src={photo.src} alt={photo.label[language] || photo.label.fr} loading="lazy" />
                                        <div className="equipment-overlay">
                                            <span className="equipment-label">{photo.label[language] || photo.label.fr}</span>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="timeline-section">
                <div className="container">
                    <ScrollReveal>
                        <div className="section-title">
                            <div className="label">{timelineLabel}</div>
                            <h2>{timelineTitle}</h2>
                        </div>
                    </ScrollReveal>
                    <div className="timeline">
                        {timeline.map((item, i) => (
                            <ScrollReveal key={i} delay={i * 100}>
                                <div className={`timeline-item ${i % 2 === 0 ? 'left' : 'right'}`}>
                                    <div className="timeline-content">
                                        <div className="timeline-year">{item.year}</div>
                                        <h3>{item.title}</h3>
                                        <p>{item.desc}</p>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="team-section">
                <div className="container">
                    <ScrollReveal>
                        <div className="section-title">
                            <div className="label">{teamLabel}</div>
                            <h2>{teamTitle}</h2>
                            <p>{teamSubtitle}</p>
                        </div>
                    </ScrollReveal>
                    <div className="team-grid">
                        {team.map((member, i) => (
                            <ScrollReveal key={i} delay={i * 100}>
                                <div className="team-card">
                                    <div className="team-avatar">{getIcon(member.iconName)}</div>
                                    <h3>{member.name}</h3>
                                    <span className="team-role">{member.role[language] || member.role.fr}</span>
                                    <a href={`tel:+216${member.phone.split(' / ')[0].replace(/\s/g, '')}`} className="team-phone">
                                        <FaPhoneAlt /> {member.phone}
                                    </a>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Certifications */}
            <section className="certifications-section">
                <div className="container">
                    <ScrollReveal>
                        <div className="section-title">
                            <div className="label">{certLabel}</div>
                            <h2>{certTitle}</h2>
                        </div>
                    </ScrollReveal>
                    <div className="cert-grid">
                        {certifications.map((cert, i) => (
                            <ScrollReveal key={i} delay={i * 100}>
                                <div className="cert-card">
                                    <div className="cert-icon">{cert.icon}</div>
                                    <h3>{cert.title}</h3>
                                    <p>{cert.desc[language] || cert.desc.fr}</p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
