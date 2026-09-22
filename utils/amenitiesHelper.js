const ALL_AMENITIES = [
  // Available Amenities
  { name: "Wifi", icon: "fa-solid fa-wifi", available: true, tags: ["general", "all"] },
  { name: "Free parking on premises", icon: "fa-solid fa-square-parking", available: true, tags: ["general", "car", "suburban"] },
  { name: "Pets allowed", icon: "fa-solid fa-paw", available: true, tags: ["nature", "cottage", "cabin", "farm"] },
  { name: "Air conditioning", icon: "fa-solid fa-snowflake", available: true, tags: ["tropical", "city", "beach", "luxury"] },
  { name: "Private patio or balcony", icon: "fa-solid fa-door-open", available: true, tags: ["balcony", "nature", "view"] },
  { name: "Private back garden – Fully fenced", icon: "fa-solid fa-tree", available: true, tags: ["garden", "nature", "house", "villa"] },
  { name: "Bluetooth sound system", icon: "fa-solid fa-radio", available: true, tags: ["luxury", "beach", "entertainment"] },
  { name: "Dedicated workspace", icon: "fa-solid fa-laptop", available: true, tags: ["work", "city", "modern"] },
  { name: "Kitchen", icon: "fa-solid fa-kitchen-set", available: true, tags: ["general", "house", "villa", "apartment"] },
  { name: "Swimming pool", icon: "fa-solid fa-water-ladder", available: true, tags: ["pool", "luxury", "villa", "resort"] },
  { name: "Private hot tub", icon: "fa-solid fa-hot-tub-person", available: true, tags: ["mountain", "luxury", "chalet", "spa"] },
  { name: "65\" 4K HDTV with Netflix", icon: "fa-solid fa-tv", available: true, tags: ["entertainment", "loft", "apartment"] },
  { name: "Indoor fireplace", icon: "fa-solid fa-fire", available: true, tags: ["mountain", "winter", "cabin", "retreat"] },
  { name: "BBQ grill", icon: "fa-solid fa-utensils", available: true, tags: ["outdoor", "patio", "garden", "cottage"] },
  { name: "Beach access", icon: "fa-solid fa-umbrella-beach", available: true, tags: ["beach", "ocean", "coast"] },
  { name: "Mountain view", icon: "fa-solid fa-mountain", available: true, tags: ["mountain", "nature", "scenic"] },
  { name: "Lake access", icon: "fa-solid fa-water", available: true, tags: ["lake", "water", "nature"] },
  { name: "Washing machine", icon: "fa-solid fa-soap", available: true, tags: ["general", "longstay"] },
  { name: "Dryer", icon: "fa-solid fa-wind", available: true, tags: ["general", "luxury"] },
  { name: "EV charger", icon: "fa-solid fa-charging-station", available: true, tags: ["luxury", "modern", "eco"] },
  { name: "Elevator in building", icon: "fa-solid fa-elevator", available: true, tags: ["city", "apartment", "loft"] },
  { name: "Gym / Fitness center", icon: "fa-solid fa-dumbbell", available: true, tags: ["luxury", "condo", "city"] },

  // Disclosures / Unavailable Amenities
  { name: "Carbon monoxide alarm", icon: "fa-solid fa-triangle-exclamation", available: false, isSafety: true },
  { name: "Smoke alarm", icon: "fa-solid fa-ban", available: false, isSafety: true },
  { name: "Air conditioning", icon: "fa-solid fa-snowflake", available: false, isSafety: false },
  { name: "Washing machine", icon: "fa-solid fa-soap", available: false, isSafety: false },
  { name: "Free parking on premises", icon: "fa-solid fa-square-parking", available: false, isSafety: false },
  { name: "Television", icon: "fa-solid fa-tv", available: false, isSafety: false },
  { name: "Pool", icon: "fa-solid fa-water-ladder", available: false, isSafety: false },
  { name: "Heating", icon: "fa-solid fa-fire", available: false, isSafety: false },
];

/**
 * Deterministic hash from string to get consistent variety per listing
 */
function hashStr(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Returns a diverse, customized list of amenities tailored for any given listing.
 */
function getAmenitiesForListing(listing) {
  const title = (listing && listing.title) ? listing.title.toLowerCase() : "";
  const desc = (listing && listing.description) ? listing.description.toLowerCase() : "";
  const idStr = (listing && listing._id) ? listing._id.toString() : title;
  const hash = hashStr(idStr + title);

  const selectedAvailable = [];
  const selectedUnavailable = [];

  // Helper to add unique available amenity
  function addAvailable(name, icon) {
    if (!selectedAvailable.some(a => a.name === name)) {
      selectedAvailable.push({ name, icon, available: true });
    }
  }

  // Helper to add unique unavailable amenity
  function addUnavailable(name, icon = "fa-solid fa-ban") {
    if (!selectedUnavailable.some(a => a.name === name) && !selectedAvailable.some(a => a.name === name)) {
      selectedUnavailable.push({ name, icon, available: false });
    }
  }

  // 1. Context-specific features based on title & description
  const isBeach = title.includes("beach") || desc.includes("ocean") || desc.includes("beach") || title.includes("island") || title.includes("coastal");
  const isMountain = title.includes("mountain") || title.includes("cabin") || title.includes("retreat") || title.includes("chalet") || title.includes("treehouse");
  const isCity = title.includes("loft") || title.includes("downtown") || title.includes("apartment") || title.includes("penthouse") || title.includes("city");
  const isVilla = title.includes("villa") || title.includes("luxury") || title.includes("historic") || title.includes("oasis") || title.includes("castle");
  const isLake = title.includes("lake") || desc.includes("lake");

  // General essentials
  addAvailable("Wifi", "fa-solid fa-wifi");

  if (isBeach) {
    addAvailable("Beach access", "fa-solid fa-umbrella-beach");
    addAvailable("Air conditioning", "fa-solid fa-snowflake");
    addAvailable("Free parking on premises", "fa-solid fa-square-parking");
    addAvailable("Private patio or balcony", "fa-solid fa-door-open");
    addAvailable("Private back garden – Fully fenced", "fa-solid fa-tree");
    addAvailable("Bluetooth sound system", "fa-solid fa-radio");
    addAvailable("Pets allowed", "fa-solid fa-paw");
    addAvailable("Kitchen", "fa-solid fa-kitchen-set");
    addAvailable("Outdoor dining area", "fa-solid fa-utensils");
  } else if (isMountain) {
    addAvailable("Indoor fireplace", "fa-solid fa-fire");
    addAvailable("Mountain view", "fa-solid fa-mountain");
    addAvailable("Private hot tub", "fa-solid fa-hot-tub-person");
    addAvailable("Pets allowed", "fa-solid fa-paw");
    addAvailable("Free parking on premises", "fa-solid fa-square-parking");
    addAvailable("Private patio or balcony", "fa-solid fa-door-open");
    addAvailable("BBQ grill", "fa-solid fa-utensils");
    addAvailable("Dedicated workspace", "fa-solid fa-laptop");
    addAvailable("Bluetooth sound system", "fa-solid fa-radio");
  } else if (isCity) {
    addAvailable("Fast Wifi (500 Mbps)", "fa-solid fa-wifi");
    addAvailable("Air conditioning", "fa-solid fa-snowflake");
    addAvailable("Dedicated workspace", "fa-solid fa-laptop");
    addAvailable("65\" 4K HDTV with Netflix", "fa-solid fa-tv");
    addAvailable("Elevator in building", "fa-solid fa-elevator");
    addAvailable("Bluetooth sound system", "fa-solid fa-radio");
    addAvailable("Kitchen", "fa-solid fa-kitchen-set");
    addAvailable("Washing machine", "fa-solid fa-soap");
    addAvailable("Gym / Fitness center", "fa-solid fa-dumbbell");
  } else if (isVilla) {
    addAvailable("Swimming pool", "fa-solid fa-water-ladder");
    addAvailable("Air conditioning", "fa-solid fa-snowflake");
    addAvailable("Free parking on premises", "fa-solid fa-square-parking");
    addAvailable("Private back garden – Fully fenced", "fa-solid fa-tree");
    addAvailable("Private patio or balcony", "fa-solid fa-door-open");
    addAvailable("Bluetooth sound system", "fa-solid fa-radio");
    addAvailable("Chef's kitchen", "fa-solid fa-kitchen-set");
    addAvailable("EV charger", "fa-solid fa-charging-station");
    addAvailable("Pets allowed", "fa-solid fa-paw");
  } else if (isLake) {
    addAvailable("Lake access", "fa-solid fa-water");
    addAvailable("Free parking on premises", "fa-solid fa-square-parking");
    addAvailable("Private back garden – Fully fenced", "fa-solid fa-tree");
    addAvailable("Indoor fireplace", "fa-solid fa-fire");
    addAvailable("Private patio or balcony", "fa-solid fa-door-open");
    addAvailable("BBQ grill", "fa-solid fa-utensils");
    addAvailable("Pets allowed", "fa-solid fa-paw");
    addAvailable("Bluetooth sound system", "fa-solid fa-radio");
  } else {
    // Balanced preset
    addAvailable("Free parking on premises", "fa-solid fa-square-parking");
    addAvailable("Air conditioning", "fa-solid fa-snowflake");
    addAvailable("Pets allowed", "fa-solid fa-paw");
    addAvailable("Private patio or balcony", "fa-solid fa-door-open");
    addAvailable("Private back garden – Fully fenced", "fa-solid fa-tree");
    addAvailable("Bluetooth sound system", "fa-solid fa-radio");
    addAvailable("Kitchen", "fa-solid fa-kitchen-set");
    addAvailable("Dedicated workspace", "fa-solid fa-laptop");
  }

  // Ensure diversity by adding 1-2 random items based on hash
  const bonusItems = [
    { name: "Private back garden – Fully fenced", icon: "fa-solid fa-tree" },
    { name: "Bluetooth sound system", icon: "fa-solid fa-radio" },
    { name: "Pets allowed", icon: "fa-solid fa-paw" },
    { name: "Air conditioning", icon: "fa-solid fa-snowflake" },
    { name: "Private patio or balcony", icon: "fa-solid fa-door-open" },
    { name: "Free parking on premises", icon: "fa-solid fa-square-parking" },
    { name: "Washing machine", icon: "fa-solid fa-soap" },
    { name: "EV charger", icon: "fa-solid fa-charging-station" },
    { name: "Swimming pool", icon: "fa-solid fa-water-ladder" },
    { name: "Dedicated workspace", icon: "fa-solid fa-laptop" },
  ];

  const bonus1 = bonusItems[hash % bonusItems.length];
  const bonus2 = bonusItems[(hash + 3) % bonusItems.length];
  addAvailable(bonus1.name, bonus1.icon);
  addAvailable(bonus2.name, bonus2.icon);

  // Safety & Unavailable Disclosures (Airbnb-style)
  // Vary unavailable disclosures between listings
  const safetyVariant = hash % 4;
  if (safetyVariant === 0) {
    addUnavailable("Carbon monoxide alarm", "fa-solid fa-triangle-exclamation");
    addUnavailable("Smoke alarm", "fa-solid fa-ban");
  } else if (safetyVariant === 1) {
    addUnavailable("Smoke alarm", "fa-solid fa-ban");
    if (!selectedAvailable.some(a => a.name.includes("parking"))) {
      addUnavailable("Free parking on premises", "fa-solid fa-square-parking");
    } else {
      addUnavailable("Carbon monoxide alarm", "fa-solid fa-triangle-exclamation");
    }
  } else if (safetyVariant === 2) {
    addUnavailable("Carbon monoxide alarm", "fa-solid fa-triangle-exclamation");
    if (!isBeach && !isVilla) {
      addUnavailable("Swimming pool", "fa-solid fa-water-ladder");
    } else {
      addUnavailable("Smoke alarm", "fa-solid fa-ban");
    }
  } else {
    addUnavailable("Carbon monoxide alarm", "fa-solid fa-triangle-exclamation");
    addUnavailable("Smoke alarm", "fa-solid fa-ban");
  }

  // Combine available + unavailable (typically 7-10 available + 2 unavailable)
  return [...selectedAvailable, ...selectedUnavailable];
}

export {
  ALL_AMENITIES,
  getAmenitiesForListing,
};

export default {
  ALL_AMENITIES,
  getAmenitiesForListing,
};

