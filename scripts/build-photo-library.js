const fs = require('fs');
const path = require('path');
const sharp = require('C:/Users/AB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

const sourceRoot = 'D:/货架外贸网站/货架图片素材';
const outputRoot = path.resolve(__dirname, '../images/field-projects');
const photos = {
  'drive-in-warehouse-1': '微信图片_20250711163335.jpg', 'drive-in-warehouse-2': '微信图片_20250711163402.jpg',
  'industrial-shelving-1': '微信图片_20250711163414.jpg', 'longspan-racking-1': '微信图片_20250724162300.jpg',
  'longspan-racking-2': '微信图片_20250724162344.jpg', 'carton-flow-rack-1': '微信图片_20250808112039_52.jpg',
  'mobile-pallet-racking-1': '微信图片_20260818152414_330_39.jpg', 'selective-pallet-racking-1': '微信图片_20260818155638_346_39.jpg',
  'selective-pallet-racking-2': '微信图片_20260818155639_347_39.jpg', 'selective-pallet-racking-3': '微信图片_20260819101359_517_15.jpg',
  'selective-pallet-racking-4': '微信图片_20260819101405_518_15.jpg', 'medium-duty-shelving-1': '中型货架/微信图片_20260616140800_101_15.jpg',
  'medium-duty-shelving-2': '中型货架/微信图片_20260616140806_102_15.jpg', 'stacking-rack-1': '堆垛架/微信图片_20260819104927_1733_2.jpg',
  'stacking-rack-2': '堆垛架/微信图片_20260819104928_1734_2.jpg', 'cantilever-racking-1': '悬臂货架/微信图片_20260616141403_134_15.jpg',
  'cantilever-racking-2': '悬臂货架/微信图片_20260616141403_135_15.jpg', 'cable-reel-racking-1': '线缆货架/微信图片_20260616141404_136_15.jpg',
  'cable-reel-racking-2': '线缆货架/微信图片_20260709102337_1023_2.jpg', 'steel-mezzanine-1': '钢平台/微信图片_20250728153948.jpg',
  'steel-mezzanine-2': '钢平台/微信图片_20260831103840_1909_2.jpg', 'steel-mezzanine-3': '钢平台/原素材1225 (1).jpg'
};

async function main() {
  fs.mkdirSync(outputRoot, { recursive: true });
  for (const [name, source] of Object.entries(photos)) {
    await sharp(path.join(sourceRoot, source)).rotate().resize({ width: 1600, height: 1100, fit: 'cover', position: 'attention' }).webp({ quality: 80, effort: 5 }).toFile(path.join(outputRoot, `${name}.webp`));
  }
  console.log(JSON.stringify({ created: Object.keys(photos).length }));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
