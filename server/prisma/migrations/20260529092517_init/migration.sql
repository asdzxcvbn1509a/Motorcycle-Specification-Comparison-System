-- CreateEnum
CREATE TYPE "MotorcycleType" AS ENUM ('Sport', 'Naked', 'Adventure', 'Touring', 'Cruiser', 'Scooter');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" VARCHAR(20) NOT NULL DEFAULT 'admin',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "motorcycles" (
    "id" SERIAL NOT NULL,
    "brand" VARCHAR(50) NOT NULL,
    "model" VARCHAR(100) NOT NULL,
    "year" INTEGER NOT NULL,
    "type" "MotorcycleType" NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "image_url" VARCHAR(500),
    "engine_cc" INTEGER NOT NULL,
    "engine_type" VARCHAR(100),
    "horsepower" DECIMAL(6,2),
    "torque" DECIMAL(6,2),
    "transmission" VARCHAR(100),
    "front_brake" VARCHAR(100),
    "rear_brake" VARCHAR(100),
    "front_suspension" VARCHAR(100),
    "rear_suspension" VARCHAR(100),
    "weight_kg" DECIMAL(6,2),
    "seat_height_mm" INTEGER,
    "fuel_capacity_l" DECIMAL(4,2),
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "motorcycles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "motorcycles_brand_idx" ON "motorcycles"("brand");

-- CreateIndex
CREATE INDEX "motorcycles_type_idx" ON "motorcycles"("type");

-- CreateIndex
CREATE INDEX "motorcycles_engine_cc_idx" ON "motorcycles"("engine_cc");

-- CreateIndex
CREATE INDEX "motorcycles_price_idx" ON "motorcycles"("price");
