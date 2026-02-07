"""Audit log API endpoints."""

from typing import Annotated, Optional
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User
from app.models.audit import AuditLog
from app.schemas.audit import AuditLogResponse, AuditLogListResponse

router = APIRouter()


@router.get("", response_model=AuditLogListResponse)
async def list_audit_logs(
    current_user: Annotated[User, Depends(require_role(["admin"]))],
    db: Annotated[AsyncSession, Depends(get_db)],
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    action: Optional[str] = None,
    user_id: Optional[int] = None,
    resource_type: Optional[str] = None,
):
    """
    List audit logs (Admin only).
    
    - **page**: Page number (default: 1)
    - **page_size**: Items per page (default: 50, max: 100)
    - **action**: Filter by action
    - **user_id**: Filter by user ID
    - **resource_type**: Filter by resource type
    """
    # Build query
    query = select(AuditLog)
    
    # Apply filters
    if action:
        query = query.where(AuditLog.action == action)
    if user_id:
        query = query.where(AuditLog.user_id == user_id)
    if resource_type:
        query = query.where(AuditLog.resource_type == resource_type)
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()
    
    # Apply pagination and ordering
    offset = (page - 1) * page_size
    query = query.order_by(AuditLog.created_at.desc()).offset(offset).limit(page_size)
    
    # Execute query
    result = await db.execute(query)
    logs = result.scalars().all()
    
    # Enrich with user info
    enriched_logs = []
    for log in logs:
        log_dict = {
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "resource_type": log.resource_type,
            "resource_id": log.resource_id,
            "details": log.details,
            "ip_address": log.ip_address,
            "created_at": log.created_at,
            "user_email": log.user.email if log.user else None,
            "user_name": log.user.full_name if log.user else None,
        }
        enriched_logs.append(log_dict)
    
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "logs": enriched_logs,
    }


@router.get("/stats", response_model=dict)
async def get_audit_stats(
    current_user: Annotated[User, Depends(require_role(["admin"]))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get audit log statistics (Admin only)."""
    # Total logs
    total_query = select(func.count(AuditLog.id))
    total_result = await db.execute(total_query)
    total = total_result.scalar_one()
    
    # Logs by action type
    from sqlalchemy import distinct
    
    actions_query = select(distinct(AuditLog.action))
    actions_result = await db.execute(actions_query)
    unique_actions = actions_result.scalars().all()
    
    # Recent activity (last 24 hours)
    from datetime import datetime, timedelta
    yesterday = datetime.utcnow() - timedelta(days=1)
    recent_query = select(func.count(AuditLog.id)).where(AuditLog.created_at >= yesterday)
    recent_result = await db.execute(recent_query)
    recent_count = recent_result.scalar_one()
    
    return {
        "total_logs": total,
        "unique_actions": len(unique_actions),
        "recent_activity_24h": recent_count,
    }
