"""Seed fabric data for the catalog."""

import asyncio
from sqlalchemy import select
from collections import Counter
from app.core.database import AsyncSessionLocal
from app.models.fabric import Fabric

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
        "name": "White Linen",
        "type": "Linen",
        "color": "White",
        "pattern": "Solid",
        "price_per_meter": 750,
        "description": "Crisp white linen for elegant summer wear.",
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
        "name": "Checked Polyester",
        "type": "Synthetic",
        "color": "Multi",
        "pattern": "Checked",
        "price_per_meter": 450,
        "description": "Colorful checked pattern on polyester base.",
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
        "name": "Green Velvet",
        "type": "Velvet",
        "color": "Emerald",
        "pattern": "Solid",
        "price_per_meter": 1800,
        "description": "Stunning emerald green velvet for statement pieces.",
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
        "name": "Black Denim",
        "type": "Denim",
        "color": "Black",
        "pattern": "Solid",
        "price_per_meter": 650,
        "description": "Sleek black denim for modern casual wear.",
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
    {
        "name": "Red Satin",
        "type": "Satin",
        "color": "Red",
        "pattern": "Solid",
        "price_per_meter": 1000,
        "description": "Vibrant red satin for bold fashion statements.",
        "in_stock": False  # Out of stock
    },
    {
        "name": "Tweed Heritage",
        "type": "Tweed",
        "color": "Brown",
        "pattern": "Herringbone",
        "price_per_meter": 1600,
        "description": "Traditional tweed with herringbone pattern.",
        "in_stock": True
    },
    {
        "name": "Floral Print Cotton",
        "type": "Cotton",
        "color": "Multi",
        "pattern": "Floral",
        "price_per_meter": 550,
        "description": "Beautiful floral print on cotton base.",
        "in_stock": True
    },
    {
        "name": "Khaki Canvas",
        "type": "Canvas",
        "color": "Khaki",
        "pattern": "Solid",
        "price_per_meter": 700,
        "description": "Heavy-duty canvas fabric for durable clothing.",
        "in_stock": True
    }
]


async def seed_fabrics():
    """Seed the database with fabric data."""
    async with AsyncSessionLocal() as db:
        try:
            # Check if fabrics already exist
            result = await db.execute(select(Fabric))
            existing_fabrics = result.scalars().all()
            
            if existing_fabrics:
                print(f"Database already has {len(existing_fabrics)} fabrics.")
                print("Adding new fabrics anyway...")
            
            # Add fabrics
            for fabric_data in FABRIC_DATA:
                fabric = Fabric(**fabric_data)
                db.add(fabric)
            
            await db.commit()
            print(f"✅ Successfully seeded {len(FABRIC_DATA)} fabrics!")
            
            # Display summary
            result = await db.execute(select(Fabric))
            all_fabrics = result.scalars().all()
            print(f"\nTotal fabrics in database: {len(all_fabrics)}")
            
            # Group by type
            types = Counter(f.type for f in all_fabrics)
            print("\nFabrics by type:")
            for fabric_type, count in types.items():
                print(f"  - {fabric_type}: {count}")
                
        except Exception as e:
            await db.rollback()
            print(f"❌ Error seeding fabrics: {e}")
            import traceback
            traceback.print_exc()
            raise


if __name__ == "__main__":
    print("🌟 Fabric Catalog Seeding Script")
    print("=" * 50)
    asyncio.run(seed_fabrics())
