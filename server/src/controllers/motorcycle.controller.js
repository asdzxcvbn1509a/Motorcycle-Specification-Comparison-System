import prisma from '../config/prisma.js';
import { motorcycleSchema, compareSchema } from '../utils/validators.js';

function buildWhere(query) {
  const where = {};
  const { search, brand, type, minCc, maxCc, minPrice, maxPrice } = query;

  if (search) {
    where.OR = [
      { brand: { contains: search } },
      { model: { contains: search } },
    ];
  }

  if (brand) {
    const brands = Array.isArray(brand) ? brand : String(brand).split(',');
    where.brand = { in: brands };
  }

  if (type) {
    const types = Array.isArray(type) ? type : String(type).split(',');
    where.type = { in: types };
  }

  if (minCc || maxCc) {
    where.engineCc = {};
    if (minCc) where.engineCc.gte = Number(minCc);
    if (maxCc) where.engineCc.lte = Number(maxCc);
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }

  return where;
}

function normalizeOptionalStrings(data) {
  const out = { ...data };
  for (const key of Object.keys(out)) {
    if (out[key] === '') out[key] = null;
  }
  return out;
}

const SORTABLE_FIELDS = new Set(['price', 'engineCc', 'horsepower', 'torque', 'year', 'weightKg', 'brand', 'model']);

function buildOrderBy(sort, order) {
  const direction = order === 'desc' ? 'desc' : 'asc';
  if (sort && SORTABLE_FIELDS.has(sort)) {
    return [{ [sort]: direction }];
  }
  return [{ brand: 'asc' }, { model: 'asc' }];
}

export async function list(req, res, next) {
  try {
    const where = buildWhere(req.query);
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(1000, Math.max(1, Number(req.query.limit) || 12));
    const orderBy = buildOrderBy(req.query.sort, req.query.order);

    const [total, motorcycles] = await Promise.all([
      prisma.motorcycle.count({ where }),
      prisma.motorcycle.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    res.json({
      data: motorcycles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const motorcycle = await prisma.motorcycle.findUnique({ where: { id } });
    if (!motorcycle) {
      return res.status(404).json({ message: 'Motorcycle not found' });
    }
    res.json(motorcycle);
  } catch (err) {
    next(err);
  }
}

export async function compare(req, res, next) {
  try {
    const { ids } = compareSchema.parse(req.body);
    const motorcycles = await prisma.motorcycle.findMany({
      where: { id: { in: ids } },
    });
    const ordered = ids
      .map((id) => motorcycles.find((m) => m.id === id))
      .filter(Boolean);
    res.json(ordered);
  } catch (err) {
    next(err);
  }
}

export async function getFilterMeta(req, res, next) {
  try {
    const brandsRaw = await prisma.motorcycle.findMany({
      select: { brand: true },
      distinct: ['brand'],
      orderBy: { brand: 'asc' },
    });

    const priceAgg = await prisma.motorcycle.aggregate({
      _min: { price: true, engineCc: true },
      _max: { price: true, engineCc: true },
    });

    res.json({
      brands: brandsRaw.map((b) => b.brand),
      types: ['Sport', 'Naked', 'Adventure', 'Touring', 'Cruiser', 'Scooter'],
      priceRange: {
        min: Number(priceAgg._min.price ?? 0),
        max: Number(priceAgg._max.price ?? 2000000),
      },
      ccRange: {
        min: priceAgg._min.engineCc ?? 0,
        max: priceAgg._max.engineCc ?? 2000,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const data = normalizeOptionalStrings(motorcycleSchema.parse(req.body));
    const motorcycle = await prisma.motorcycle.create({ data });
    res.status(201).json(motorcycle);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    const data = normalizeOptionalStrings(motorcycleSchema.parse(req.body));
    const motorcycle = await prisma.motorcycle.update({
      where: { id },
      data,
    });
    res.json(motorcycle);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    await prisma.motorcycle.delete({ where: { id } });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    next(err);
  }
}
