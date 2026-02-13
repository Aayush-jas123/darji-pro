import asyncio
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

# Add the backend directory to the python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from sqlalchemy import select
from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.models.fabric import Fabric

print(f"🔌 Connecting to: {settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else 'INVALID_URL'}")

async def seed_fabrics():
    print("🌱 Seeding fabrics...")
    
    async with AsyncSessionLocal() as db:
        # Check if fabrics already exist
        result = await db.execute(select(Fabric))
        if result.scalars().first():
            print("⚠️ Fabrics already exist. Skipping seed.")
            return

        fabrics = [
            {
                "name": "Raymond Fine Wool",
                "type": "Wool",
                "color": "Navy Blue",
                "pattern": "Solid",
                "price_per_meter": 2500.0,
                "description": "Premium 100% merino wool suitable for business suits.",
                "image_url": "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=2565&auto=format&fit=crop",
                "in_stock": True
            },
            {
                "name": "Italian Silk Blend",
                "type": "Silk",
                "color": "Charcoal Grey",
                "pattern": "Textured",
                "price_per_meter": 4500.0,
                "description": "Luxurious silk-wool blend with a subtle sheen for evening wear.",
                "image_url": "https://images.unsplash.com/photo-1620799140408-ed5341cd2431?q=80&w=2572&auto=format&fit=crop",
                "in_stock": True
            },
            {
                "name": "Linen Breeze",
                "type": "Linen",
                "color": "Beige",
                "pattern": "Solid",
                "price_per_meter": 1800.0,
                "description": "Breathable pure linen, perfect for summer jackets and trousers.",
                "image_url": "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=2572&auto=format&fit=crop",
                "in_stock": True
            },
            {
                "name": "Egyptian Cotton Crisp",
                "type": "Cotton",
                "color": "White",
                "pattern": "Self-Check",
                "price_per_meter": 1200.0,
                "description": "High thread count Egyptian cotton for crisp formal shirts.",
                "image_url": "https://images.unsplash.com/photo-1605218427306-635b681990e6?q=80&w=2574&auto=format&fit=crop",
                "in_stock": True
            },
            {
                "name": "Royal Velvet",
                "type": "Velvet",
                "color": "Deep Maroon",
                "pattern": "Solid",
                "price_per_meter": 3500.0,
                "description": "Rich, plush velvet for smoking jackets and festive wear.",
                "image_url": "https://images.unsplash.com/photo-1612459792193-41bb7ba59eb2?q=80&w=2525&auto=format&fit=crop",
                "in_stock": True
            }
        ]

        for fabric_data in fabrics:
            fabric = Fabric(**fabric_data)
            db.add(fabric)
            print(f"   - Added {fabric.name}")

        await db.commit()
        print("✅ Fabric seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_fabrics())
