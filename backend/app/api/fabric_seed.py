"""Fabric seeding endpoint for browser access."""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from collections import Counter

from app.core.database import get_db
from app.models.fabric import Fabric

router = APIRouter()

# Sample fabric data
FABRIC_DATA = [
    {
        "name": "Premium Cotton",
        "type": "Cotton",
        "color": "White",
        "pattern": "Solid",
        "price_per_meter": 500,
        "description": "High-quality breathable cotton fabric, perfect for shirts and casual wear.",
        "in_stock": True
    },
    {
        "name": "Egyptian Cotton",
        "type": "Cotton",
        "color": "Cream",
        "pattern": "Solid",
        "price_per_meter": 800,
        "description": "Luxurious Egyptian cotton with superior softness and durability.",
        "in_stock": True
    },
    {
        "name": "Blue Striped Cotton",
        "type": "Cotton",
        "color": "Blue",
        "pattern": "Striped",
        "price_per_meter": 600,
        "description": "Classic blue and white striped cotton, ideal for formal shirts.",
        "in_stock": True
    },
    {
        "name": "Pure Silk",
        "type": "Silk",
        "color": "Ivory",
        "pattern": "Solid",
        "price_per_meter": 1500,
        "description": "100% pure silk fabric with natural sheen and smooth texture.",
        "in_stock": True
    },
    {
        "name": "Silk Brocade",
        "type": "Silk",
        "color": "Gold",
        "pattern": "Brocade",
        "price_per_meter": 2500,
        "description": "Ornate silk brocade with intricate patterns, perfect for special occasions.",
        "in_stock": True
    },
    {
        "name": "Charcoal Wool",
        "type": "Wool",
        "color": "Charcoal",
        "pattern": "Solid",
        "price_per_meter": 1200,
        "description": "Premium wool fabric for suits and formal wear.",
        "in_stock": True
    },
    {
        "name": "Navy Pinstripe Wool",
        "type": "Wool",
        "color": "Navy",
        "pattern": "Pinstripe",
        "price_per_meter": 1400,
        "description": "Classic navy wool with subtle pinstripes for business suits.",
        "in_stock": True
    },
    {
        "name": "Natural Linen",
        "type": "Linen",
        "color": "Beige",
        "pattern": "Solid",
        "price_per_meter": 800,
        "description": "Breathable linen fabric, perfect for summer clothing.",
        "in_stock": True
    },
    {
        "name": "Polyester Blend",
        "type": "Synthetic",
        "color": "Black",
        "pattern": "Solid",
        "price_per_meter": 400,
        "description": "Durable polyester blend, wrinkle-resistant and easy to maintain.",
        "in_stock": True
    },
    {
        "name": "Velvet Luxury",
        "type": "Velvet",
        "color": "Burgundy",
        "pattern": "Solid",
        "price_per_meter": 2000,
        "description": "Rich velvet fabric with deep pile, perfect for luxury garments.",
        "in_stock": True
    },
    {
        "name": "Denim Classic",
        "type": "Denim",
        "color": "Indigo",
        "pattern": "Solid",
        "price_per_meter": 600,
        "description": "Classic indigo denim, sturdy and versatile.",
        "in_stock": True
    },
    {
        "name": "Satin Finish",
        "type": "Satin",
        "color": "Silver",
        "pattern": "Solid",
        "price_per_meter": 1100,
        "description": "Smooth satin with elegant sheen.",
        "in_stock": True
    },
]


@router.get("/seed-fabrics")
async def seed_fabrics_browser(db: AsyncSession = Depends(get_db)):
    """Browser-accessible endpoint to seed fabric catalog. Just visit this URL!"""
    try:
        # Check existing fabrics
        result = await db.execute(select(Fabric))
        existing_fabrics = result.scalars().all()
        
        if existing_fabrics:
            # Clear existing fabrics
            for fabric in existing_fabrics:
                await db.delete(fabric)
            await db.flush()
        
        # Add new fabrics
        added_fabrics = []
        for fabric_data in FABRIC_DATA:
            fabric = Fabric(**fabric_data)
            db.add(fabric)
            added_fabrics.append(fabric_data["name"])
        
        await db.commit()
        
        # Get summary
        result = await db.execute(select(Fabric))
        all_fabrics = result.scalars().all()
        types = Counter(f.type for f in all_fabrics)
        
        return {
            "status": "success",
            "total_fabrics": len(all_fabrics),
            "added_fabrics": added_fabrics,
            "fabrics_by_type": dict(types),
            "message": "✅ Fabric catalog seeded successfully! Refresh your catalog page."
        }
    except Exception as e:
        await db.rollback()
        return {
            "status": "error",
            "error": str(e),
            "message": "Failed to seed fabrics"
        }
