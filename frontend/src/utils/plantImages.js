/**
 * Plant image map — 50 most common garden plants
 * Uses Wikimedia Commons images (stable, no API key needed)
 * Keyed by lowercase common name (also handles partials via lookup)
 */
const PLANT_IMAGE_MAP = {
  // ── Vegetables ──
  'tomato':        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Salad_garden.jpg/640px-Salad_garden.jpg',
  'tomatoes':      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Salad_garden.jpg/640px-Salad_garden.jpg',
  'potato':        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Potato_and_cross_section.jpg/640px-Potato_and_cross_section.jpg',
  'carrot':        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Vegetarian-dragon-bowl-dipping-sauce%2C-Jason-Ingram-%285%29-%28cropped%29.jpg/640px-Vegetarian-dragon-bowl-dipping-sauce%2C-Jason-Ingram-%285%29-%28cropped%29.jpg',
  'onion':         'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Onions.jpg/640px-Onions.jpg',
  'garlic':        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Garlic_bulbs.jpg/640px-Garlic_bulbs.jpg',
  'pepper':        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Capsicum_annuum_2.jpg/640px-Capsicum_annuum_2.jpg',
  'bell pepper':   'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Capsicum_annuum_2.jpg/640px-Capsicum_annuum_2.jpg',
  'chili':         'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Cayenne_pepper_2.jpg/640px-Cayenne_pepper_2.jpg',
  'chilli':        'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Cayenne_pepper_2.jpg/640px-Cayenne_pepper_2.jpg',
  'cucumber':      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/A_small_cup_of_coffee.JPG/640px-A_small_cup_of_coffee.JPG',
  'spinach':       'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Spinach_in_a_bowl.jpg/640px-Spinach_in_a_bowl.jpg',
  'lettuce':       'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Salad_garden.jpg/640px-Salad_garden.jpg',
  'cabbage':       'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Broccoli_and_cross_section_edit.jpg/640px-Broccoli_and_cross_section_edit.jpg',
  'broccoli':      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Fresh_broccoli_in_a_dish.jpg/640px-Fresh_broccoli_in_a_dish.jpg',
  'cauliflower':   'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Cauliflower_2.jpg/640px-Cauliflower_2.jpg',
  'eggplant':      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Eggplant_with_leaves.jpg/640px-Eggplant_with_leaves.jpg',
  'brinjal':       'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Eggplant_with_leaves.jpg/640px-Eggplant_with_leaves.jpg',
  'zucchini':      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Zucchini_%28Cucurbita_pepo%29.jpg/640px-Zucchini_%28Cucurbita_pepo%29.jpg',
  'courgette':     'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Zucchini_%28Cucurbita_pepo%29.jpg/640px-Zucchini_%28Cucurbita_pepo%29.jpg',
  'pumpkin':       'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/A_Pumpkin.jpg/640px-A_Pumpkin.jpg',
  'sweet potato':  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Ipomoea_batatas_006.jpg/640px-Ipomoea_batatas_006.jpg',
  'beans':         'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Phaseolus_vulgaris016.jpg/640px-Phaseolus_vulgaris016.jpg',
  'peas':          'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Peas_in_pods_-_Studio.jpg/640px-Peas_in_pods_-_Studio.jpg',
  'corn':          'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Maize_field.jpg/640px-Maize_field.jpg',
  'maize':         'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Maize_field.jpg/640px-Maize_field.jpg',
  'radish':        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Radish_dn.jpg/640px-Radish_dn.jpg',
  'beetroot':      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Beetroot_collage.jpg/640px-Beetroot_collage.jpg',

  // ── Herbs ──
  'basil':         'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Basil-Basilico-Ocimum_basilicum-albahaca.jpg/640px-Basil-Basilico-Ocimum_basilicum-albahaca.jpg',
  'mint':          'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Mint-leaves-2007.jpg/640px-Mint-leaves-2007.jpg',
  'coriander':     'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Coriandrum_sativum_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-198.jpg/640px-Coriandrum_sativum_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-198.jpg',
  'cilantro':      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Coriandrum_sativum_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-198.jpg/640px-Coriandrum_sativum_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-198.jpg',
  'parsley':       'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Petroselinum_crispum_20091030_002.jpg/640px-Petroselinum_crispum_20091030_002.jpg',
  'rosemary':      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Rosemary_bush.jpg/640px-Rosemary_bush.jpg',
  'thyme':         'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Thymus_vulgaris_blossoms.jpg/640px-Thymus_vulgaris_blossoms.jpg',
  'oregano':       'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Origanum_vulgare_-_harilik_pune.jpg/640px-Origanum_vulgare_-_harilik_pune.jpg',
  'lavender':      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Bee_and_lavender.jpg/640px-Bee_and_lavender.jpg',
  'chamomile':     'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Blato_Slovenija.jpg/640px-Blato_Slovenija.jpg',
  'lemongrass':    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Cymbopogon_citratus_philippines.jpg/640px-Cymbopogon_citratus_philippines.jpg',

  // ── Flowers ──
  'rose':          'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Gatto_europeo4.jpg/640px-Gatto_europeo4.jpg',
  'roses':         'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sunflower_from_Silesia2.jpg/640px-Sunflower_from_Silesia2.jpg',
  'sunflower':     'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sunflower_from_Silesia2.jpg/640px-Sunflower_from_Silesia2.jpg',
  'marigold':      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Marigold_flower_02.jpg/640px-Marigold_flower_02.jpg',
  'petunia':       'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Petunia_x_hybrida_-a.jpg/640px-Petunia_x_hybrida_-a.jpg',
  'dahlia':        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Dahlia_x_hybrida.jpg/640px-Dahlia_x_hybrida.jpg',
  'hibiscus':      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/China_rose_%28Hibiscus_rosa-sinensis%29.jpg/640px-China_rose_%28Hibiscus_rosa-sinensis%29.jpg',
  'jasmine':       'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/JasminumPolyanthum.jpg/640px-JasminumPolyanthum.jpg',
  'tulip':         'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sunflower_from_Silesia2.jpg/640px-Sunflower_from_Silesia2.jpg',

  // ── Fruits ──
  'strawberry':    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/PerfectStrawberry.jpg/640px-PerfectStrawberry.jpg',
  'mango':         'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Mango_Aamra_Beel.JPG/640px-Mango_Aamra_Beel.JPG',
  'lemon':         'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Lemon-Whole-Split.jpg/640px-Lemon-Whole-Split.jpg',
  'lime':          'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Khvamli_mountain.jpg/640px-Khvamli_mountain.jpg',
  'watermelon':    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/640px-PNG_transparency_demonstration_1.png',
  'grape':         'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Table_grapes_on_white.jpg/640px-Table_grapes_on_white.jpg',
  'grapes':        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Table_grapes_on_white.jpg/640px-Table_grapes_on_white.jpg',

  // ── Succulents & Others ──
  'aloe vera':     'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Aloe_vera_flower_inset.png/640px-Aloe_vera_flower_inset.png',
  'aloe':          'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Aloe_vera_flower_inset.png/640px-Aloe_vera_flower_inset.png',
  'cactus':        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Two_Golden_Barrels.jpg/640px-Two_Golden_Barrels.jpg',
  'bamboo':        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Bambu_guinle_fbotanico_sp.jpg/640px-Bambu_guinle_fbotanico_sp.jpg',
  'fern':          'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Cinnamon_fern.jpg/640px-Cinnamon_fern.jpg',
  'monstera':      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Monstera_deliciosa3.jpg/640px-Monstera_deliciosa3.jpg',
};

// Generic botanical fallback (high quality)
const GENERIC_PLANT_IMAGE = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Ash_Tree_-_geograph.org.uk_-_590710.jpg/640px-Ash_Tree_-_geograph.org.uk_-_590710.jpg';

/**
 * Returns the best matching plant image URL for a given plant name.
 * @param {string} plantName - common name from user input
 * @returns {string|null} image URL or null (use generic)
 */
export function getPlantImage(plantName) {
  if (!plantName) return null;

  const key = plantName.toLowerCase().trim();

  // Exact match
  if (PLANT_IMAGE_MAP[key]) return PLANT_IMAGE_MAP[key];

  // Partial match — check if any known key is contained in name or vice versa
  for (const [mapKey, url] of Object.entries(PLANT_IMAGE_MAP)) {
    if (key.includes(mapKey) || mapKey.includes(key)) {
      return url;
    }
  }

  return null; // triggers generic in component
}

export { GENERIC_PLANT_IMAGE };
export default PLANT_IMAGE_MAP;
