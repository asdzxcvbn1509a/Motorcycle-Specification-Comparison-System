import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ราคา ณ ปี 2024-2025 จากเว็บผู้ผลิตทางการไทย (อาจเปลี่ยนแปลงได้)
// รูปภาพดึงจากเว็บผู้ผลิตทางการไทย (URL อาจมีการเปลี่ยนแปลงตามการอัปเดตเว็บผู้ผลิต)
const motorcycles = [
  {
    brand: 'Honda', model: 'CBR650R', year: 2024, type: 'Sport', price: 351990,
    imageUrl: 'https://www.thaihonda.co.th/hondabigbike/uploads/product_list_image/photos/shares/2025_CBR650RACT/THHonda_CBR650RE-Clutch_ThumbnailProduct_620x399-RBW.jpg',
    engineCc: 649, engineType: 'Inline-4, 4-stroke, Liquid-cooled DOHC 16-valve', horsepower: 95, torque: 63, transmission: '6-speed manual + E-Clutch',
    frontBrake: 'Dual 310mm hydraulic discs with radial-mount calipers, ABS', rearBrake: 'Single 240mm hydraulic disc, ABS',
    frontSuspension: 'Showa 41mm SFF-BP USD fork', rearSuspension: 'Pro-Link mono-shock with preload adjustment',
    weightKg: 211, seatHeightMm: 810, fuelCapacityL: 15.4,
    description: 'Sport bike four-cylinder รุ่นปี 2024 มาพร้อมเทคโนโลยี Honda E-Clutch หน้าจอ TFT 5 นิ้ว เหมาะกับใช้งานทั้งในเมืองและทริปทางไกล',
  },
  {
    brand: 'Honda', model: 'CB650R', year: 2024, type: 'Naked', price: 336580,
    imageUrl: 'https://www.thaihonda.co.th/hondabigbike/uploads/product_list_image/photos/shares/2025_CB650RAC/THHonda_CB650RE-Clutch_ThumbnailProduct_620x399-RB.jpg',
    engineCc: 649, engineType: 'Inline-4, 4-stroke, Liquid-cooled DOHC 16-valve', horsepower: 95, torque: 63, transmission: '6-speed manual + E-Clutch',
    frontBrake: 'Dual 310mm hydraulic discs with radial-mount calipers, ABS', rearBrake: 'Single 240mm hydraulic disc, ABS',
    frontSuspension: 'Showa 41mm SFF-BP USD fork', rearSuspension: 'Pro-Link mono-shock with preload adjustment',
    weightKg: 205, seatHeightMm: 810, fuelCapacityL: 15.4,
    description: 'Naked sport ดีไซน์ Neo Sports Café รุ่นปี 2024 มาพร้อมระบบ Honda E-Clutch และจอ TFT 5 นิ้ว เครื่อง 4 สูบเสียงโหดเร้าใจ',
  },
  {
    brand: 'Honda', model: 'Forza 350', year: 2024, type: 'Scooter', price: 185340,
    imageUrl: 'https://www.thaihonda.co.th/honda/uploads/cache/1920/photos/shares/NewForza3502024/L1-KV-W1920xH768-PX.jpg',
    engineCc: 330, engineType: 'eSP+ Single-cylinder, 4-valve, Liquid-cooled SOHC', horsepower: 29, torque: 31.5, transmission: 'V-Matic CVT',
    frontBrake: '256mm wave disc, 2-piston caliper, ABS', rearBrake: '240mm wave disc, single piston, ABS',
    frontSuspension: '33mm telescopic fork', rearSuspension: 'Twin shock with 5-step preload',
    weightKg: 184, seatHeightMm: 780, fuelCapacityL: 11.7,
    description: 'Maxi-scooter พรีเมียม RoadSync เชื่อม Bluetooth สั่งงานด้วยเสียง จอ TFT 5 นิ้ว มี HSTC traction control เหมาะกับเดินทางในเมืองและทริประยะกลาง',
  },
  {
    brand: 'Yamaha', model: 'YZF-R3', year: 2024, type: 'Sport', price: 208200,
    imageUrl: 'https://storagetym.blob.core.windows.net/www2021/images/product-2021/commuter/model-year-2024/yzf-r3-2024/banner/yamaha-yzf-r3-2024_1900x550-pc.jpg',
    engineCc: 321, engineType: 'Parallel-twin, 4-stroke, Liquid-cooled DOHC 8-valve', horsepower: 42, torque: 29.5, transmission: '6-speed manual',
    frontBrake: '298mm hydraulic single disc with ABS', rearBrake: '220mm hydraulic single disc with ABS',
    frontSuspension: 'KYB 37mm USD telescopic fork', rearSuspension: 'Monocross swingarm with linkage',
    weightKg: 169, seatHeightMm: 780, fuelCapacityL: 14,
    description: 'Supersport ระดับเริ่มต้นที่ออกแบบจากเทคโนโลยี YZF-R1 ดีไซน์ R-Series เต็มรูปแบบ ตัวเล็กแต่จัดเต็ม',
  },
  {
    brand: 'Yamaha', model: 'MT-09', year: 2024, type: 'Naked', price: 447000,
    imageUrl: 'https://storagetym.blob.core.windows.net/www2021/images/product-2021/bigbike/model-2024/mt-09/banner-yamaha-mt-09-2024-1900x550.jpg',
    engineCc: 889, engineType: 'CP3 Inline-3, 4-stroke, Liquid-cooled DOHC', horsepower: 117.4, torque: 93, transmission: '6-speed manual with quickshifter',
    frontBrake: 'Dual 298mm hydraulic discs, radial 4-piston calipers, ABS', rearBrake: '245mm hydraulic single disc, ABS',
    frontSuspension: 'KYB 41mm USD fork, fully adjustable', rearSuspension: 'KYB swingarm mono-shock, fully adjustable',
    weightKg: 193, seatHeightMm: 825, fuelCapacityL: 14,
    description: 'Hyper Naked เจน 4 เครื่อง CP3 สามสูบ ดีไซน์ Y-AMT (Automated Manual Transmission) ขับสนุกเต็มย่าน',
  },
  {
    brand: 'Yamaha', model: 'YZF-R1', year: 2024, type: 'Sport', price: 899000,
    imageUrl: 'https://storagetym.blob.core.windows.net/www2021/images/%E0%B8%BAbigbike_event_images_2021/bigbike/product-2022/r1-2022/banner-opening-new-r1-2022-1900x550.jpg',
    engineCc: 998, engineType: 'CP4 Inline-4 Crossplane, 4-stroke, Liquid-cooled DOHC', horsepower: 200, torque: 112.4, transmission: '6-speed manual with quickshifter',
    frontBrake: 'Dual 320mm hydraulic discs, monobloc 4-piston calipers, ABS', rearBrake: '220mm hydraulic single disc, ABS',
    frontSuspension: 'KYB 43mm USD fork, fully adjustable', rearSuspension: 'KYB mono-shock with linkage, fully adjustable',
    weightKg: 201, seatHeightMm: 855, fuelCapacityL: 17,
    description: 'Flagship Supersport เทคโนโลยีจากสนาม MotoGP เครื่อง CP4 หัวใจสุดดุ พร้อมระบบ Electronic ครบเครื่อง',
  },
  {
    brand: 'Kawasaki', model: 'Ninja 500 SE', year: 2024, type: 'Sport', price: 219800,
    imageUrl: 'https://www.kawasaki.co.th/uploads/products/ninja500se/menu.png',
    engineCc: 451, engineType: 'Parallel-twin, 4-stroke, Liquid-cooled DOHC 8-valve', horsepower: 45, torque: 42.6, transmission: '6-speed manual with assist & slipper clutch',
    frontBrake: '310mm semi-floating disc, dual-piston caliper, ABS', rearBrake: '220mm petal disc, dual-piston caliper, ABS',
    frontSuspension: '41mm telescopic fork', rearSuspension: 'Bottom-Link Uni-Trak with adjustable preload',
    weightKg: 171, seatHeightMm: 785, fuelCapacityL: 14,
    description: 'Sport bike คลาส 500cc รุ่นใหม่แทน Ninja 400 ดีไซน์เหมือน Ninja ZX-10R พร้อมจอ TFT 4.3 นิ้ว และ Smartphone connectivity',
  },
  {
    brand: 'Kawasaki', model: 'Z900', year: 2024, type: 'Naked', price: 349000,
    imageUrl: 'https://www.kawasaki.co.th/uploads/products/z900/graphenesteel-2026-01.jpg',
    engineCc: 948, engineType: 'Inline-4, 4-stroke, Liquid-cooled DOHC 16-valve', horsepower: 125, torque: 98.6, transmission: '6-speed manual with assist & slipper clutch',
    frontBrake: 'Dual 300mm petal discs, radial 4-piston calipers, ABS', rearBrake: '250mm petal disc, single-piston caliper, ABS',
    frontSuspension: '41mm USD fork with rebound damping & preload', rearSuspension: 'Horizontal Back-Link with linkage, preload & rebound',
    weightKg: 212, seatHeightMm: 795, fuelCapacityL: 17,
    description: 'Sugomi Naked เครื่อง 4 สูบ 948cc พลังเต็มขอบ พร้อมจอ TFT 4.3 นิ้ว และ Smartphone connectivity',
  },
  {
    brand: 'Kawasaki', model: 'Ninja ZX-10R', year: 2024, type: 'Sport', price: 859000,
    imageUrl: 'https://www.kawasaki.co.th/uploads/products/ninjazx10r/menu.png',
    engineCc: 998, engineType: 'Inline-4, 4-stroke, Liquid-cooled DOHC 16-valve', horsepower: 200, torque: 114.9, transmission: '6-speed manual with KQS quickshifter',
    frontBrake: 'Dual 330mm semi-floating discs, monobloc 4-piston Brembo calipers, ABS', rearBrake: '220mm disc, single-piston caliper, ABS',
    frontSuspension: 'Showa BFF (Balance Free Front) 43mm USD fork', rearSuspension: 'Showa BFRC-lite mono-shock with linkage',
    weightKg: 207, seatHeightMm: 835, fuelCapacityL: 17,
    description: 'Superbike จากสนาม WSBK พร้อมเทคโนโลยีอิเล็กทรอนิกส์เต็มระบบ KCMF, KIBS, KTRC, KLCM, KEBC',
  },
  {
    brand: 'Ducati', model: 'Panigale V4 S', year: 2025, type: 'Sport', price: 1479000,
    imageUrl: 'https://placehold.co/800x600/cc0000/ffffff?text=Ducati+Panigale+V4+S',
    engineCc: 1103, engineType: 'Desmosedici Stradale 90° V4, 4-stroke, Liquid-cooled', horsepower: 215.5, torque: 123.6, transmission: '6-speed DQS (Ducati Quick Shift) 2.0',
    frontBrake: 'Dual 330mm Brembo Hypure monobloc 4-piston calipers, ABS Cornering EVO', rearBrake: '245mm disc with 2-piston caliper',
    frontSuspension: 'Öhlins NIX-30 43mm USD fork with electronic adjustment', rearSuspension: 'Öhlins TTX36 mono-shock with electronic adjustment',
    weightKg: 187, seatHeightMm: 850, fuelCapacityL: 17,
    description: 'Italian Superbike เจเนอเรชั่นที่ 7 เครื่อง V4 จาก Desmosedici MotoGP พร้อม Öhlins Smart EC 3.0 และระบบอิเล็กทรอนิกส์ Race eCBS',
  },
  {
    brand: 'Ducati', model: 'Monster 937', year: 2024, type: 'Naked', price: 595000,
    imageUrl: 'https://placehold.co/800x600/cc0000/ffffff?text=Ducati+Monster+937',
    engineCc: 937, engineType: 'Testastretta 11° L-Twin, 4-stroke, Liquid-cooled', horsepower: 111, torque: 93, transmission: '6-speed manual with up/down quickshifter (optional)',
    frontBrake: 'Dual 320mm Brembo M4.32 monobloc 4-piston calipers, ABS Cornering', rearBrake: '245mm disc, 2-piston caliper, ABS',
    frontSuspension: '43mm USD fork', rearSuspension: 'Progressive monoshock with adjustable preload & rebound',
    weightKg: 188, seatHeightMm: 820, fuelCapacityL: 14,
    description: 'ตำนาน Naked สายพันธุ์ Ducati รูปทรงคลาสสิคแบบใหม่ เครื่อง Testastretta 11° แรงและคล่อง',
  },
  {
    brand: 'BMW', model: 'S1000RR', year: 2024, type: 'Sport', price: 1029000,
    imageUrl: 'https://placehold.co/800x600/0066b2/ffffff?text=BMW+S1000RR',
    engineCc: 999, engineType: 'Inline-4, 4-stroke, Liquid-cooled DOHC with BMW ShiftCam', horsepower: 210, torque: 113, transmission: '6-speed manual with HP Shift Assistant Pro',
    frontBrake: 'Dual 320mm discs, Hayes radial 4-piston calipers, BMW Motorrad ABS Pro', rearBrake: '220mm single disc, single-piston floating caliper',
    frontSuspension: 'Marzocchi 45mm USD fork, fully adjustable', rearSuspension: 'Marzocchi central spring strut with Full Floater Pro kinematics',
    weightKg: 196.5, seatHeightMm: 824, fuelCapacityL: 16.5,
    description: 'German Superbike ปี 2024 ปรับโฉมใหม่ aerodynamics พร้อม winglet ใหม่และ M Lightweight battery เทคโนโลยี ShiftCam และ Dynamic Damping Control',
  },
  {
    brand: 'BMW', model: 'R1300GS Adventure', year: 2024, type: 'Adventure', price: 1395000,
    imageUrl: 'https://placehold.co/800x600/0066b2/ffffff?text=BMW+R1300GS+Adventure',
    engineCc: 1300, engineType: 'Air/Liquid-cooled Boxer-twin, 4-stroke with ShiftCam', horsepower: 145, torque: 149, transmission: '6-speed manual',
    frontBrake: 'Dual 310mm discs, radial 4-piston calipers, BMW Motorrad Integral ABS Pro', rearBrake: '285mm disc with 2-piston caliper',
    frontSuspension: 'EVO Telelever with central spring strut', rearSuspension: 'EVO Paralever with central spring strut',
    weightKg: 269, seatHeightMm: 870, fuelCapacityL: 30,
    description: 'Adventure tourer รุ่นใหม่แทน R1250GS Adventure เครื่อง Boxer 1300cc ใหม่ที่เบาขึ้นและทรงพลังมากขึ้น พร้อมระบบอิเล็กทรอนิกส์ครบ',
  },
  {
    brand: 'KTM', model: '390 Duke', year: 2024, type: 'Naked', price: 189800,
    imageUrl: 'https://placehold.co/800x600/ff6600/ffffff?text=KTM+390+Duke',
    engineCc: 399, engineType: 'Single-cylinder, 4-stroke, Liquid-cooled DOHC 4-valve', horsepower: 45, torque: 39, transmission: '6-speed manual with PASC anti-hopping clutch',
    frontBrake: '320mm disc with 4-piston radial caliper, ByBre, ABS', rearBrake: '240mm disc with floating single-piston caliper, ByBre, ABS',
    frontSuspension: 'WP APEX 43mm USD fork with adjustable compression & rebound', rearSuspension: 'WP APEX monoshock with adjustable preload & rebound',
    weightKg: 168, seatHeightMm: 820, fuelCapacityL: 15,
    description: 'Naked street fighter เจเนอเรชั่นใหม่ปี 2024 น้ำหนักเบา จอ TFT 5 นิ้ว ขับสนุกในเมือง สีส้มดุดันแบบฉบับ KTM',
  },
  {
    brand: 'KTM', model: '1390 Super Adventure S Evo', year: 2024, type: 'Adventure', price: 989000,
    imageUrl: 'https://placehold.co/800x600/ff6600/ffffff?text=KTM+1390+Super+Adventure+S',
    engineCc: 1350, engineType: 'V-twin LC8, 4-stroke, Liquid-cooled DOHC 8-valve', horsepower: 173, torque: 145, transmission: '6-speed manual with PASC slipper clutch (Optional AMT)',
    frontBrake: 'Dual 320mm Brembo Stylema discs, radial 4-piston monobloc calipers, MTC Cornering ABS', rearBrake: '267mm disc, 2-piston caliper, ABS',
    frontSuspension: 'WP APEX semi-active 48mm USD fork', rearSuspension: 'WP APEX semi-active mono-shock with linkage',
    weightKg: 250, seatHeightMm: 849, fuelCapacityL: 23,
    description: 'Adventure ตัวท็อปรุ่นปี 2024 เครื่อง V-twin LC8 ใหม่ 1350cc พร้อมระบบ Automated Manual Transmission (AMT) และ semi-active suspension',
  },
  {
    brand: 'Triumph', model: 'Street Triple 765 RS', year: 2024, type: 'Naked', price: 549000,
    imageUrl: 'https://media.triumphmotorcycles.co.uk/image/upload/t_triumph_square/c_limit,w_3840/f_auto/q_auto:eco/v1761910419/Triumph_Street_Triple_765_RX_MY26_3727_JP_yrvw7s',
    engineCc: 765, engineType: 'Inline-3, 4-stroke, Liquid-cooled DOHC 12-valve', horsepower: 128.2, torque: 80, transmission: '6-speed manual with up/down quickshifter',
    frontBrake: 'Dual 310mm floating discs, Brembo Stylema 4-piston monobloc radial calipers, ABS', rearBrake: '220mm fixed disc, single-piston caliper, ABS',
    frontSuspension: 'Showa 41mm BPF (Big Piston Fork) USD, fully adjustable', rearSuspension: 'Öhlins STX40 mono-shock, fully adjustable',
    weightKg: 188, seatHeightMm: 836, fuelCapacityL: 15,
    description: 'British Naked เครื่อง 3 สูบเสียงไพเราะ เทคโนโลยีจาก Moto2 พร้อม Brembo Stylema และ Öhlins STX40 ได้รับรางวัล MCN Bike of the Year 2023',
  },
  {
    brand: 'Suzuki', model: 'GSX-R1000R', year: 2024, type: 'Sport', price: 829000,
    imageUrl: 'https://placehold.co/800x600/003399/ffffff?text=Suzuki+GSX-R1000R',
    engineCc: 999.8, engineType: 'Inline-4, 4-stroke, Liquid-cooled DOHC 16-valve with VVT', horsepower: 199.2, torque: 117.6, transmission: '6-speed manual with quickshifter',
    frontBrake: 'Dual 320mm Brembo T-drive discs, 4-piston monobloc calipers, ABS', rearBrake: '220mm disc, single-piston caliper, ABS',
    frontSuspension: 'Showa BFF (Balance Free Front) 43mm USD fork', rearSuspension: 'Showa BFRC (Balance Free Rear Cushion) mono-shock',
    weightKg: 203, seatHeightMm: 825, fuelCapacityL: 16,
    description: 'Gixxer ตัวจริง เครื่อง 4 สูบ Variable Valve Timing พร้อมระบบอิเล็กทรอนิกส์ครบ Motion Track ABS, Motion Track Brake System',
  },
  {
    brand: 'Harley-Davidson', model: 'Sportster S', year: 2024, type: 'Cruiser', price: 638000,
    imageUrl: 'https://www.harley-davidsonbangkok.com/photos/2024/sportster-s/24_rh1250s_m02b_r.jpg',
    engineCc: 1252, engineType: 'Revolution Max 1250T V-Twin, 4-stroke, Liquid-cooled DOHC', horsepower: 121, torque: 125, transmission: '6-speed manual',
    frontBrake: '320mm floating disc, radial monobloc 4-piston caliper, ABS', rearBrake: '260mm disc, single-piston floating caliper, ABS',
    frontSuspension: 'Showa 43mm BPF (Big Piston Fork) USD with adjustable compression, rebound & preload', rearSuspension: 'Linkage piggyback monoshock with hydraulic preload adjuster',
    weightKg: 221, seatHeightMm: 753, fuelCapacityL: 11.8,
    description: 'Cruiser ยุคใหม่จาก Harley-Davidson เครื่อง V-twin Revolution Max แรงและคล่อง พร้อมจอกลม 4 นิ้ว TFT และ Harley-Davidson App',
  },
];

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', passwordHash, role: 'admin' },
  });
  console.log('Admin user created: username=admin password=admin123');

  await prisma.motorcycle.deleteMany({});
  await prisma.motorcycle.createMany({ data: motorcycles });
  console.log(`Inserted ${motorcycles.length} motorcycles`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
