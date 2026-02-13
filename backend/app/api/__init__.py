"""API routes package."""

from app.api import (
    auth, users, appointments, measurements, branches, ml, admin, tailor,
    orders, invoices, search, analytics, fabrics, notifications, uploads,
    audit, tailor_registration
)

__all__ = [
    "auth", "users", "appointments", "measurements", "branches", "ml",
    "admin", "tailor", "orders", "invoices", "search", "analytics",
    "fabrics", "notifications", "uploads", "audit", "tailor_registration"
]
