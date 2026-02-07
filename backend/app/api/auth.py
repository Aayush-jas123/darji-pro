"""Authentication API routes."""

from datetime import timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.dependencies import get_current_user
from app.models.user import User, UserRole
from app.schemas.user import (
    Token,
    LoginRequest,
    RegisterRequest,
    UserResponse,
    PasswordResetRequest,
)
from app.schemas.common import MessageResponse

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: RegisterRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    request: Request,
):
    """
    Register a new user.
    
    - **email**: Valid email address
    - **password**: Minimum 8 characters
    - **full_name**: User's full name
    - **role**: User role (forced to customer for public registration)
    
    Note: Only customers can register publicly. Tailor and admin accounts
    must be created by administrators through the admin panel.
    """
    from app.core.audit import create_audit_log, AuditAction
    
    # Force customer role for public registration (security measure)
    # Tailor and admin accounts should be created by admins only
    user_data.role = UserRole.CUSTOMER
    
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Check phone if provided
    if user_data.phone:
        result = await db.execute(select(User).where(User.phone == user_data.phone))
        existing_phone = result.scalar_one_or_none()
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number already registered",
            )
    
    # Create new user
    new_user = User(
        email=user_data.email,
        phone=user_data.phone,
        full_name=user_data.full_name,
        hashed_password=get_password_hash(user_data.password),
        role=user_data.role.value if hasattr(user_data.role, 'value') else str(user_data.role),
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    # Log user registration
    await create_audit_log(
        db=db,
        action=AuditAction.USER_REGISTER,
        user=new_user,
        resource_type="user",
        resource_id=new_user.id,
        details={"role": new_user.role},
        request=request,
    )
    
    return new_user


@router.post("/login", response_model=Token)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[AsyncSession, Depends(get_db)],
    request: Request,
):
    """
    Login with email and password to get access token.
    
    OAuth2 compatible token login, get an access token for future requests.
    """
    from app.core.audit import create_audit_log, AuditAction
    
    # Find user by email
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        # Log failed login attempt
        if user:
            await create_audit_log(
                db=db,
                action="user.login_failed",
                user=user,
                details={"reason": "incorrect_password"},
                request=request,
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )
    
    # Check account status (for approval workflow)
    if hasattr(user, 'account_status'):
        if user.account_status == "pending":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account is pending approval. Please wait for admin verification.",
            )
        elif user.account_status == "rejected":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your application was rejected. Please contact support for more information.",
            )
        elif user.account_status == "suspended":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been suspended. Please contact support.",
            )
    
    # Create access and refresh tokens
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    refresh_token = create_refresh_token(data={"sub": str(user.id), "email": user.email})
    
    # Update last login
    from datetime import datetime
    user.last_login = datetime.utcnow()
    await db.commit()
    
    # Log successful login
    await create_audit_log(
        db=db,
        action=AuditAction.USER_LOGIN,
        user=user,
        details={"method": "oauth2_form"},
        request=request,
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "role": user.role.value if hasattr(user.role, 'value') else str(user.role)
    }


@router.post("/login/json", response_model=Token)
async def login_json(
    login_data: LoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Login with JSON payload (alternative to OAuth2 form).
    
    - **email**: User email
    - **password**: User password
    """
    # Find user by email
    result = await db.execute(select(User).where(User.email == login_data.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )
    
    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    refresh_token = create_refresh_token(data={"sub": str(user.id), "email": user.email})
    
    # Update last login
    from datetime import datetime
    user.last_login = datetime.utcnow()
    await db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "role": user.role.value if hasattr(user.role, 'value') else str(user.role)
    }


@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_token: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Refresh access token using refresh token.
    
    - **refresh_token**: Valid refresh token
    """
    payload = decode_token(refresh_token)
    
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    
    # Verify user exists and is active
    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    
    # Create new tokens
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    new_refresh_token = create_refresh_token(data={"sub": str(user.id), "email": user.email})
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "role": user.role.value if hasattr(user.role, 'value') else str(user.role)
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Get current user information.
    
    Requires authentication.
    """
    return current_user


@router.post("/password-reset/request", response_model=MessageResponse)
async def request_password_reset(
    request_data: PasswordResetRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Request password reset email.
    
    - **email**: User email address
    
    Note: This endpoint always returns success to prevent email enumeration.
    """
    # Find user
    result = await db.execute(select(User).where(User.email == request_data.email))
    user = result.scalar_one_or_none()
    
    if user:
        # TODO: Send password reset email with token
        # For now, just return success
        pass
    
    # Always return success to prevent email enumeration
    return {
        "message": "If the email exists, a password reset link has been sent",
    }


@router.post("/logout", response_model=MessageResponse)
async def logout(
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Logout current user.
    
    Note: With JWT, logout is handled client-side by removing the token.
    This endpoint is provided for consistency and can be extended for token blacklisting.
    """
    return {
        "message": "Successfully logged out",
    }
