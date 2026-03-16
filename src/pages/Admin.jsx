import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FaBolt, FaTools, FaCog, FaIndustry, FaShieldAlt, FaPlug, FaTachometerAlt, FaLeaf, FaWrench, FaHardHat, FaBuilding, FaLandmark, FaHotel, FaHospital, FaUniversity, FaPlus, FaPen, FaTrash, FaTimes, FaArrowLeft, FaSignOutAlt, FaSave, FaMapMarkerAlt, FaUsers, FaAward, FaPhoneAlt } from 'react-icons/fa'
import { HiLightningBolt } from 'react-icons/hi'
import { API_URL as API } from '../api'
import './Admin.css'

// ── Icon Map ──
const ICON_MAP = {
    FaBolt: <FaBolt />, FaTools: <FaTools />, FaCog: <FaCog />, FaIndustry: <FaIndustry />,
    FaShieldAlt: <FaShieldAlt />, FaPlug: <FaPlug />, FaTachometerAlt: <FaTachometerAlt />,
    FaLeaf: <FaLeaf />, FaWrench: <FaWrench />, FaHardHat: <FaHardHat />,
    FaBuilding: <FaBuilding />, FaLandmark: <FaLandmark />, FaHotel: <FaHotel />,
    FaHospital: <FaHospital />, FaUniversity: <FaUniversity />, HiLightningBolt: <HiLightningBolt />,
    FaMapMarkerAlt: <FaMapMarkerAlt />,
    FaUsers: <FaUsers />, FaAward: <FaAward />, FaPhoneAlt: <FaPhoneAlt />,
}
const ICON_NAMES = Object.keys(ICON_MAP)

// ══════════════════════════════════════
//   LOGIN SCREEN
// ══════════════════════════════════════
function LoginScreen({ onLogin }) {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await fetch(`${API}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            })
            const data = await res.json()
            if (data.success) {
                sessionStorage.setItem('emira_admin_token', data.token)
                onLogin(data.token)
            } else {
                setError(data.error || 'Mot de passe incorrect')
            }
        } catch {
            setError('Erreur de connexion au serveur')
        }
        setLoading(false)
    }

    return (
        <div className="admin-login">
            <form className="login-card" onSubmit={handleSubmit}>
                <div className="login-logo">⚡ E<span>MIRA</span></div>
                <div className="login-subtitle">Panneau d'Administration</div>
                <label className="login-label">Mot de passe</label>
                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Entrez le mot de passe admin"
                    autoFocus
                />
                <button type="submit" className="login-btn" disabled={loading}>
                    {loading ? 'Connexion...' : 'Se Connecter'}
                </button>
                {error && <div className="login-error">{error}</div>}
            </form>
        </div>
    )
}

// ══════════════════════════════════════
//   TEAM EDIT MODAL
// ══════════════════════════════════════
function TeamEditModal({ item, onSave, onClose }) {
    const [form, setForm] = useState(() => {
        if (!item) return { name: '', role: { fr: '', en: '' }, phone: '', iconName: 'FaUsers' }
        return { ...item }
    })

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal" onClick={e => e.stopPropagation()}>
                <div className="admin-modal-header">
                    <h3>{item ? 'Modifier' : 'Ajouter'} — Responsable</h3>
                    <button className="modal-close" onClick={onClose}><FaTimes /></button>
                </div>
                <div className="admin-modal-body">
                    <div className="form-group">
                        <label>Icône</label>
                        <select value={form.iconName} onChange={e => setForm(prev => ({ ...prev, iconName: e.target.value }))}>
                            {ICON_NAMES.map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Nom complet</label>
                        <input value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} />
                    </div>
                    <div className="form-group form-row">
                        <div>
                            <label>Rôle (FR)</label>
                            <input value={form.role?.fr || ''} onChange={e => setForm(prev => ({ ...prev, role: { ...prev.role, fr: e.target.value } }))} />
                        </div>
                        <div>
                            <label>Role (EN)</label>
                            <input value={form.role?.en || ''} onChange={e => setForm(prev => ({ ...prev, role: { ...prev.role, en: e.target.value } }))} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Téléphone</label>
                        <input value={form.phone} onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="20 832 832 / 50 832 259" />
                    </div>
                </div>
                <div className="admin-modal-footer">
                    <button className="btn-cancel" onClick={onClose}>Annuler</button>
                    <button className="btn-save" onClick={() => onSave(form)}><FaSave style={{ marginRight: 6 }} /> Enregistrer</button>
                </div>
            </div>
        </div>
    )
}

// ══════════════════════════════════════
//   EDIT MODAL (Services / Clients)
// ══════════════════════════════════════
function EditModal({ item, type, onSave, onClose }) {
    const [form, setForm] = useState(() => {
        if (!item) {
            // New item defaults
            if (type === 'service') {
                return { iconName: 'FaBolt', title: { fr: '', en: '' }, desc: { fr: '', en: '' }, features: { fr: '', en: '' } }
            }
            return { iconName: 'FaBuilding', name: { fr: '', en: '' }, desc: { fr: '', en: '' } }
        }
        // Editing existing item
        if (type === 'service') {
            return {
                ...item,
                features: {
                    fr: (item.features?.fr || []).join(', '),
                    en: (item.features?.en || []).join(', '),
                }
            }
        }
        return { ...item }
    })

    const set = (field, lang, value) => {
        setForm(prev => ({ ...prev, [field]: { ...prev[field], [lang]: value } }))
    }

    const handleSave = () => {
        const result = { ...form }
        if (type === 'service') {
            result.features = {
                fr: form.features.fr.split(',').map(s => s.trim()).filter(Boolean),
                en: form.features.en.split(',').map(s => s.trim()).filter(Boolean),
            }
        }
        onSave(result)
    }

    const nameField = type === 'service' ? 'title' : 'name'
    const nameLabel = type === 'service' ? 'Titre' : 'Nom'

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal" onClick={e => e.stopPropagation()}>
                <div className="admin-modal-header">
                    <h3>{item ? 'Modifier' : 'Ajouter'} — {type === 'service' ? 'Service' : 'Client'}</h3>
                    <button className="modal-close" onClick={onClose}><FaTimes /></button>
                </div>
                <div className="admin-modal-body">
                    <div className="form-group">
                        <label>Icône</label>
                        <select value={form.iconName} onChange={e => setForm(prev => ({ ...prev, iconName: e.target.value }))}>
                            {ICON_NAMES.map(name => <option key={name} value={name}>{name}</option>)}
                        </select>
                    </div>
                    <div className="form-group form-row">
                        <div>
                            <label>{nameLabel} (FR)</label>
                            <input value={form[nameField]?.fr || ''} onChange={e => set(nameField, 'fr', e.target.value)} />
                        </div>
                        <div>
                            <label>{nameLabel} (EN)</label>
                            <input value={form[nameField]?.en || ''} onChange={e => set(nameField, 'en', e.target.value)} />
                        </div>
                    </div>
                    <div className="form-group form-row">
                        <div>
                            <label>Description (FR)</label>
                            <textarea value={form.desc?.fr || ''} onChange={e => set('desc', 'fr', e.target.value)} />
                        </div>
                        <div>
                            <label>Description (EN)</label>
                            <textarea value={form.desc?.en || ''} onChange={e => set('desc', 'en', e.target.value)} />
                        </div>
                    </div>
                    {type === 'service' && (
                        <div className="form-group form-row">
                            <div>
                                <label>Features (FR)</label>
                                <input value={form.features?.fr || ''} onChange={e => set('features', 'fr', e.target.value)} placeholder="Feature 1, Feature 2, ..." />
                                <div className="form-hint">Séparez avec des virgules</div>
                            </div>
                            <div>
                                <label>Features (EN)</label>
                                <input value={form.features?.en || ''} onChange={e => set('features', 'en', e.target.value)} placeholder="Feature 1, Feature 2, ..." />
                                <div className="form-hint">Comma-separated</div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="admin-modal-footer">
                    <button className="btn-cancel" onClick={onClose}>Annuler</button>
                    <button className="btn-save" onClick={handleSave}><FaSave style={{ marginRight: 6 }} /> Enregistrer</button>
                </div>
            </div>
        </div>
    )
}

// ══════════════════════════════════════
//   MAIN ADMIN DASHBOARD
// ══════════════════════════════════════
export default function Admin() {
    const [token, setToken] = useState(() => sessionStorage.getItem('emira_admin_token') || '')
    const [activeTab, setActiveTab] = useState('services')
    const [services, setServices] = useState([])
    const [publicClients, setPublicClients] = useState([])
    const [privateClients, setPrivateClients] = useState([])
    const [regions, setRegions] = useState([])
    const [team, setTeam] = useState([])
    const [loading, setLoading] = useState(true)
    const [hasChanges, setHasChanges] = useState(false)
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState(null)
    const [editModal, setEditModal] = useState(null) // { item, type, index }
    const [teamModal, setTeamModal] = useState(null) // { item, index }
    const [newRegion, setNewRegion] = useState('')

    const showToast = (message, type = 'success') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

    const authHeaders = useCallback(() => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    }), [token])

    // ── Fetch Data ──
    useEffect(() => {
        if (!token) return
        const fetchData = async () => {
            setLoading(true)
            try {
                const [srvRes, cliRes, teamRes] = await Promise.all([
                    fetch(`${API}/api/services`),
                    fetch(`${API}/api/clients`),
                    fetch(`${API}/api/team`),
                ])
                const srvData = await srvRes.json()
                const cliData = await cliRes.json()
                const teamData = await teamRes.json()
                setServices(srvData.services || [])
                setPublicClients(cliData.publicClients || [])
                setPrivateClients(cliData.privateClients || [])
                setRegions(cliData.regions || [])
                setTeam(teamData.team || [])
            } catch {
                showToast('Erreur chargement données', 'error')
            }
            setLoading(false)
        }
        fetchData()
    }, [token])

    // ── Logout ──
    const handleLogout = async () => {
        try {
            await fetch(`${API}/api/admin/logout`, { method: 'POST', headers: authHeaders() })
        } catch { /* ignore */ }
        sessionStorage.removeItem('emira_admin_token')
        setToken('')
    }

    // ── Save All ──
    const handleSaveAll = async () => {
        setSaving(true)
        try {
            const [srvRes, cliRes, teamRes] = await Promise.all([
                fetch(`${API}/api/services`, {
                    method: 'PUT',
                    headers: authHeaders(),
                    body: JSON.stringify({ services }),
                }),
                fetch(`${API}/api/clients`, {
                    method: 'PUT',
                    headers: authHeaders(),
                    body: JSON.stringify({ publicClients, privateClients, regions }),
                }),
                fetch(`${API}/api/team`, {
                    method: 'PUT',
                    headers: authHeaders(),
                    body: JSON.stringify({ team }),
                }),
            ])
            const srvData = await srvRes.json()
            const cliData = await cliRes.json()
            const teamData = await teamRes.json()
            if (srvData.success && cliData.success && teamData.success) {
                showToast('✅ Toutes les modifications ont été sauvegardées!')
                setHasChanges(false)
            } else {
                showToast('Erreur lors de la sauvegarde', 'error')
            }
        } catch {
            showToast('Erreur de connexion', 'error')
        }
        setSaving(false)
    }

    // ── CRUD Helpers ──
    const nextId = (list) => Math.max(0, ...list.map(i => i.id || 0)) + 1

    const handleModalSave = (data) => {
        const { type, index } = editModal
        if (type === 'service') {
            setServices(prev => {
                const next = [...prev]
                if (index != null) {
                    next[index] = { ...next[index], ...data }
                } else {
                    next.push({ ...data, id: nextId(prev) })
                }
                return next
            })
        } else if (type === 'publicClient') {
            setPublicClients(prev => {
                const next = [...prev]
                if (index != null) {
                    next[index] = { ...next[index], ...data }
                } else {
                    next.push({ ...data, id: nextId(prev) })
                }
                return next
            })
        } else if (type === 'privateClient') {
            setPrivateClients(prev => {
                const next = [...prev]
                if (index != null) {
                    next[index] = { ...next[index], ...data }
                } else {
                    next.push({ ...data, id: nextId(prev) })
                }
                return next
            })
        }
        setHasChanges(true)
        setEditModal(null)
    }

    const handleDelete = (type, index) => {
        if (type === 'service') setServices(prev => prev.filter((_, i) => i !== index))
        else if (type === 'publicClient') setPublicClients(prev => prev.filter((_, i) => i !== index))
        else if (type === 'privateClient') setPrivateClients(prev => prev.filter((_, i) => i !== index))
        setHasChanges(true)
    }

    const addRegion = () => {
        const r = newRegion.trim()
        if (r && !regions.includes(r)) {
            setRegions(prev => [...prev, r])
            setNewRegion('')
            setHasChanges(true)
        }
    }

    const removeRegion = (index) => {
        setRegions(prev => prev.filter((_, i) => i !== index))
        setHasChanges(true)
    }

    const handleTeamSave = (data) => {
        const { index } = teamModal
        setTeam(prev => {
            const next = [...prev]
            if (index != null) {
                next[index] = { ...next[index], ...data }
            } else {
                next.push({ ...data, id: nextId(prev) })
            }
            return next
        })
        setHasChanges(true)
        setTeamModal(null)
    }

    const handleTeamDelete = (index) => {
        setTeam(prev => prev.filter((_, i) => i !== index))
        setHasChanges(true)
    }

    // ── Not logged in ──
    if (!token) return <LoginScreen onLogin={setToken} />

    // ── Render ──
    return (
        <div className="admin-dashboard">
            {/* Topbar */}
            <div className="admin-topbar">
                <div className="brand">
                    <h1>⚡ E<span>MIRA</span></h1>
                    <span className="brand-badge">Admin</span>
                </div>
                <div className="topbar-actions">
                    <Link to="/" className="btn-back"><FaArrowLeft /> Voir le site</Link>
                    <button className="btn-logout" onClick={handleLogout}><FaSignOutAlt /> Déconnexion</button>
                </div>
            </div>

            {/* Tabs */}
            <div className="admin-tabs">
                <button className={activeTab === 'services' ? 'active' : ''} onClick={() => setActiveTab('services')}>
                    <FaCog /> Services ({services.length})
                </button>
                <button className={activeTab === 'publicClients' ? 'active' : ''} onClick={() => setActiveTab('publicClients')}>
                    <FaLandmark /> Clients Publics ({publicClients.length})
                </button>
                <button className={activeTab === 'privateClients' ? 'active' : ''} onClick={() => setActiveTab('privateClients')}>
                    <FaIndustry /> Clients Privés ({privateClients.length})
                </button>
                <button className={activeTab === 'regions' ? 'active' : ''} onClick={() => setActiveTab('regions')}>
                    <FaMapMarkerAlt /> Régions ({regions.length})
                </button>
                <button className={activeTab === 'team' ? 'active' : ''} onClick={() => setActiveTab('team')}>
                    <FaUsers /> Responsables ({team.length})
                </button>
            </div>

            {/* Content */}
            <div className="admin-content">
                {loading ? (
                    <div className="admin-loading"><div className="spinner"></div> Chargement...</div>
                ) : (
                    <>
                        {/* ── Services Tab ── */}
                        {activeTab === 'services' && (
                            <>
                                <div className="admin-section-header">
                                    <div>
                                        <h2>Gestion des Services</h2>
                                        <span className="item-count">{services.length} services configurés</span>
                                    </div>
                                    <button className="btn-add" onClick={() => setEditModal({ item: null, type: 'service', index: null })}>
                                        <FaPlus /> Ajouter un Service
                                    </button>
                                </div>
                                <div className="admin-cards-grid">
                                    {services.map((srv, i) => (
                                        <div key={srv.id || i} className="admin-item-card">
                                            <div className="card-header">
                                                <div className="card-icon">{ICON_MAP[srv.iconName] || <FaBolt />}</div>
                                                <div className="card-actions">
                                                    <button onClick={() => setEditModal({ item: srv, type: 'service', index: i })}><FaPen /></button>
                                                    <button className="btn-delete" onClick={() => handleDelete('service', i)}><FaTrash /></button>
                                                </div>
                                            </div>
                                            <h3>{srv.title?.fr || '—'}</h3>
                                            <div className="card-subtitle">{srv.title?.en || '—'}</div>
                                            <p>{srv.desc?.fr?.substring(0, 100)}{srv.desc?.fr?.length > 100 ? '...' : ''}</p>
                                            {srv.features?.fr?.length > 0 && (
                                                <div className="card-features">
                                                    {srv.features.fr.map((f, j) => <span key={j}>{f}</span>)}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* ── Public Clients Tab ── */}
                        {activeTab === 'publicClients' && (
                            <>
                                <div className="admin-section-header">
                                    <div>
                                        <h2>Clients Publics & Institutions</h2>
                                        <span className="item-count">{publicClients.length} organismes</span>
                                    </div>
                                    <button className="btn-add" onClick={() => setEditModal({ item: null, type: 'publicClient', index: null })}>
                                        <FaPlus /> Ajouter un Client
                                    </button>
                                </div>
                                <div className="admin-cards-grid">
                                    {publicClients.map((client, i) => (
                                        <div key={client.id || i} className="admin-item-card">
                                            <div className="card-header">
                                                <div className="card-icon">{ICON_MAP[client.iconName] || <FaBuilding />}</div>
                                                <div className="card-actions">
                                                    <button onClick={() => setEditModal({ item: client, type: 'publicClient', index: i })}><FaPen /></button>
                                                    <button className="btn-delete" onClick={() => handleDelete('publicClient', i)}><FaTrash /></button>
                                                </div>
                                            </div>
                                            <h3>{client.name?.fr || '—'}</h3>
                                            <div className="card-subtitle">{client.name?.en || '—'}</div>
                                            <p>{client.desc?.fr || ''}</p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* ── Private Clients Tab ── */}
                        {activeTab === 'privateClients' && (
                            <>
                                <div className="admin-section-header">
                                    <div>
                                        <h2>Clients Privés & Industriels</h2>
                                        <span className="item-count">{privateClients.length} catégories</span>
                                    </div>
                                    <button className="btn-add" onClick={() => setEditModal({ item: null, type: 'privateClient', index: null })}>
                                        <FaPlus /> Ajouter une Catégorie
                                    </button>
                                </div>
                                <div className="admin-cards-grid">
                                    {privateClients.map((cat, i) => (
                                        <div key={cat.id || i} className="admin-item-card">
                                            <div className="card-header">
                                                <div className="card-icon">{ICON_MAP[cat.iconName] || <FaIndustry />}</div>
                                                <div className="card-actions">
                                                    <button onClick={() => setEditModal({ item: cat, type: 'privateClient', index: i })}><FaPen /></button>
                                                    <button className="btn-delete" onClick={() => handleDelete('privateClient', i)}><FaTrash /></button>
                                                </div>
                                            </div>
                                            <h3>{cat.name?.fr || '—'}</h3>
                                            <div className="card-subtitle">{cat.name?.en || '—'}</div>
                                            <p>{cat.desc?.fr || ''}</p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* ── Regions Tab ── */}
                        {activeTab === 'regions' && (
                            <>
                                <div className="admin-section-header">
                                    <div>
                                        <h2>Zones d'Intervention</h2>
                                        <span className="item-count">{regions.length} gouvernorats</span>
                                    </div>
                                </div>
                                <div className="regions-tag-grid">
                                    {regions.map((region, i) => (
                                        <div key={i} className="region-tag">
                                            <FaMapMarkerAlt />
                                            {region}
                                            <button onClick={() => removeRegion(i)}><FaTimes /></button>
                                        </div>
                                    ))}
                                </div>
                                <div className="add-region-row">
                                    <input
                                        value={newRegion}
                                        onChange={e => setNewRegion(e.target.value)}
                                        placeholder="Nouveau gouvernorat..."
                                        onKeyDown={e => e.key === 'Enter' && addRegion()}
                                    />
                                    <button onClick={addRegion}><FaPlus /> Ajouter</button>
                                </div>
                            </>
                        )}

                        {/* ── Team Tab ── */}
                        {activeTab === 'team' && (
                            <>
                                <div className="admin-section-header">
                                    <div>
                                        <h2>Les Responsables</h2>
                                        <span className="item-count">{team.length} membres</span>
                                    </div>
                                    <button className="btn-add" onClick={() => setTeamModal({ item: null, index: null })}>
                                        <FaPlus /> Ajouter un Responsable
                                    </button>
                                </div>
                                <div className="admin-cards-grid">
                                    {team.map((member, i) => (
                                        <div key={member.id || i} className="admin-item-card">
                                            <div className="card-header">
                                                <div className="card-icon">{ICON_MAP[member.iconName] || <FaUsers />}</div>
                                                <div className="card-actions">
                                                    <button onClick={() => setTeamModal({ item: member, index: i })}><FaPen /></button>
                                                    <button className="btn-delete" onClick={() => handleTeamDelete(i)}><FaTrash /></button>
                                                </div>
                                            </div>
                                            <h3>{member.name}</h3>
                                            <div className="card-subtitle">{member.role?.fr} / {member.role?.en}</div>
                                            <p><FaPhoneAlt style={{ marginRight: 6, fontSize: 12 }} />{member.phone}</p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>

            {/* Save Bar */}
            {hasChanges && (
                <div className="admin-save-bar">
                    <div className="save-info">
                        <strong>⚠ Modifications non sauvegardées</strong> — Cliquez pour appliquer les changements au site.
                    </div>
                    <button className="btn-save-all" onClick={handleSaveAll} disabled={saving}>
                        <FaSave style={{ marginRight: 8 }} />
                        {saving ? 'Sauvegarde...' : 'Sauvegarder Tout'}
                    </button>
                </div>
            )}

            {/* Edit Modal */}
            {editModal && (
                <EditModal
                    item={editModal.item}
                    type={editModal.type === 'publicClient' || editModal.type === 'privateClient' ? 'client' : 'service'}
                    onSave={handleModalSave}
                    onClose={() => setEditModal(null)}
                />
            )}

            {/* Team Edit Modal */}
            {teamModal && (
                <TeamEditModal
                    item={teamModal.item}
                    onSave={handleTeamSave}
                    onClose={() => setTeamModal(null)}
                />
            )}

            {/* Toast */}
            {toast && <div className={`admin-toast ${toast.type}`}>{toast.message}</div>}
        </div>
    )
}
