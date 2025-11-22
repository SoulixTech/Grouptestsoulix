'use client'

export default function TopBar({ title, subtitle }) {
    return (
        <div className="top-bar">
            <div className="page-title">
                <h1>{title}</h1>
                <p className="page-subtitle">{subtitle}</p>
            </div>
            <div className="top-bar-actions">
                <button className="btn-icon btn-danger" title="Logout">
                    🚪
                </button>
            </div>
        </div>
    )
}
