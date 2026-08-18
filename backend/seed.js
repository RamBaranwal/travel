const mongoose = require('mongoose');
require('dotenv').config();

const DestinationCatalog = require('./models/DestinationCatalog');
const PredefinedPackage = require('./models/PredefinedPackage');

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/voyagecraft';

const ladakhPlaces = [
  { name: 'Pangong Lake', category: 'place-to-visit', tags: ['nature', 'lake'], estimatedCost: 10 },
  { name: 'Nubra Valley', category: 'place-to-visit', tags: ['nature', 'valley'], estimatedCost: 15 },
  { name: 'Khardung La Pass', category: 'place-to-visit', tags: ['landmark', 'mountain'], estimatedCost: 5 },
  { name: 'Magnetic Hill', category: 'place-to-visit', tags: ['landmark', 'curiosity'], estimatedCost: 0 },
  { name: 'Shanti Stupa', category: 'place-to-visit', tags: ['culture', 'temple'], estimatedCost: 2 },
  { name: 'Leh Palace', category: 'place-to-visit', tags: ['culture', 'history'], estimatedCost: 5 },
  { name: 'Thiksey Monastery', category: 'place-to-visit', tags: ['culture', 'monastery'], estimatedCost: 3 },
  { name: 'Diskit Monastery', category: 'place-to-visit', tags: ['culture', 'monastery'], estimatedCost: 3 },
  { name: 'Tso Moriri Lake', category: 'place-to-visit', tags: ['nature', 'lake'], estimatedCost: 10 },
  { name: 'Hemis Monastery', category: 'place-to-visit', tags: ['culture', 'monastery'], estimatedCost: 4 },
  { name: 'Zanskar Valley', category: 'place-to-visit', tags: ['nature', 'valley'], estimatedCost: 20 },
  { name: 'Sangam (Indus & Zanskar)', category: 'place-to-visit', tags: ['landmark', 'river'], estimatedCost: 0 },
  { name: 'Hall of Fame', category: 'place-to-visit', tags: ['history', 'museum'], estimatedCost: 2 },
  { name: 'SECMOL', category: 'place-to-visit', tags: ['community', 'education'], estimatedCost: 5 },
  { name: 'Chang La Pass', category: 'place-to-visit', tags: ['landmark', 'mountain'], estimatedCost: 5 },
].map(p => ({ ...p, location: 'Ladakh, India' }));

const kolkataPlaces = [
  { name: 'Victoria Memorial', category: 'place-to-visit', tags: ['history', 'architecture'], estimatedCost: 4 },
  { name: 'Howrah Bridge', category: 'place-to-visit', tags: ['landmark', 'architecture'], estimatedCost: 0 },
  { name: 'Dakshineswar Kali Temple', category: 'place-to-visit', tags: ['culture', 'temple'], estimatedCost: 0 },
  { name: 'Belur Math', category: 'place-to-visit', tags: ['culture', 'architecture'], estimatedCost: 0 },
  { name: 'Indian Museum', category: 'place-to-visit', tags: ['history', 'museum'], estimatedCost: 2 },
  { name: 'Prinsep Ghat', category: 'place-to-visit', tags: ['landmark', 'river'], estimatedCost: 0 },
  { name: 'Science City', category: 'place-to-visit', tags: ['entertainment', 'science'], estimatedCost: 8 },
  { name: 'Eco Park', category: 'place-to-visit', tags: ['nature', 'park'], estimatedCost: 3 },
  { name: 'St. Paul\'s Cathedral', category: 'place-to-visit', tags: ['culture', 'church'], estimatedCost: 0 },
  { name: 'Marble Palace', category: 'place-to-visit', tags: ['history', 'architecture'], estimatedCost: 0 },
  { name: 'Mother House', category: 'place-to-visit', tags: ['culture', 'history'], estimatedCost: 0 },
  { name: 'Kumartuli', category: 'place-to-visit', tags: ['artisan', 'community'], estimatedCost: 0 },
  { name: 'South Park Street Cemetery', category: 'place-to-visit', tags: ['history', 'cemetery'], estimatedCost: 1 },
  { name: 'College Street', category: 'place-to-visit', tags: ['community', 'books'], estimatedCost: 0 },
  { name: 'Nicco Park', category: 'place-to-visit', tags: ['entertainment', 'amusement'], estimatedCost: 10 },
].map(p => ({ ...p, location: 'Kolkata, India' }));

const goaPlaces = [
  { name: 'Baga Beach', category: 'place-to-visit', tags: ['beach', 'party'], estimatedCost: 0 },
  { name: 'Calangute Beach', category: 'place-to-visit', tags: ['beach', 'water-sports'], estimatedCost: 0 },
  { name: 'Fort Aguada', category: 'place-to-visit', tags: ['history', 'fort'], estimatedCost: 3 },
  { name: 'Dudhsagar Falls', category: 'place-to-visit', tags: ['nature', 'waterfall'], estimatedCost: 15 },
  { name: 'Basilica of Bom Jesus', category: 'place-to-visit', tags: ['culture', 'church'], estimatedCost: 0 },
  { name: 'Chapora Fort', category: 'place-to-visit', tags: ['history', 'fort'], estimatedCost: 0 },
  { name: 'Anjuna Flea Market', category: 'place-to-visit', tags: ['community', 'market'], estimatedCost: 0 },
  { name: 'Palolem Beach', category: 'place-to-visit', tags: ['beach', 'relax'], estimatedCost: 0 },
  { name: 'Tito\'s Lane', category: 'place-to-visit', tags: ['club', 'nightlife'], estimatedCost: 20 },
  { name: 'Curlies Beach Shack', category: 'place-to-visit', tags: ['club', 'shack'], estimatedCost: 15 },
  { name: 'Spice Plantation', category: 'place-to-visit', tags: ['farm', 'tour'], estimatedCost: 10 },
  { name: 'Dona Paula', category: 'place-to-visit', tags: ['landmark', 'viewpoint'], estimatedCost: 0 },
  { name: 'Se Cathedral', category: 'place-to-visit', tags: ['culture', 'church'], estimatedCost: 0 },
  { name: 'Vagator Beach', category: 'place-to-visit', tags: ['beach', 'relax'], estimatedCost: 0 },
  { name: 'Mangueshi Temple', category: 'place-to-visit', tags: ['culture', 'temple'], estimatedCost: 0 },
].map(p => ({ ...p, location: 'Goa, India' }));

const transports = [
  // Ladakh
  { location: 'Ladakh, India', category: 'transport', type: 'flight', name: 'Flight + Airport Taxi', estimatedCost: 120 },
  { location: 'Ladakh, India', category: 'transport', type: 'bus', name: 'Volvo Bus (via Manali)', estimatedCost: 40 },
  { location: 'Ladakh, India', category: 'transport', type: 'bike', name: 'Royal Enfield Rental (Karol Bagh)', estimatedCost: 80 },
  
  // Kolkata
  { location: 'Kolkata, India', category: 'transport', type: 'flight', name: 'Flight + Yellow Taxi', estimatedCost: 90 },
  { location: 'Kolkata, India', category: 'transport', type: 'train', name: 'Rajdhani Express + Auto', estimatedCost: 60 },
  { location: 'Kolkata, India', category: 'transport', type: 'bus', name: 'AC Sleeper Bus', estimatedCost: 35 },

  // Goa
  { location: 'Goa, India', category: 'transport', type: 'flight', name: 'Flight + Airport Cab', estimatedCost: 100 },
  { location: 'Goa, India', category: 'transport', type: 'train', name: 'Goa Express + Local Auto', estimatedCost: 45 },
  { location: 'Goa, India', category: 'transport', type: 'bus', name: 'AC Sleeper Bus', estimatedCost: 30 }
];

const hotels = [
  { location: 'Ladakh, India', category: 'accommodation', name: 'The Grand Dragon', estimatedCost: 150, rating: 5, tags: ['luxury'] },
  { location: 'Ladakh, India', category: 'accommodation', name: 'Gomang Boutique', estimatedCost: 60, rating: 4, tags: ['standard'] },
  { location: 'Ladakh, India', category: 'accommodation', name: 'Zostel Leh', estimatedCost: 15, rating: 4, tags: ['budget'] },

  { location: 'Kolkata, India', category: 'accommodation', name: 'The Oberoi Grand', estimatedCost: 120, rating: 5, tags: ['luxury'] },
  { location: 'Kolkata, India', category: 'accommodation', name: 'The Elgin Fairlawn', estimatedCost: 50, rating: 4, tags: ['standard'] },
  { location: 'Kolkata, India', category: 'accommodation', name: 'Backpackers Park', estimatedCost: 12, rating: 4, tags: ['budget'] },

  { location: 'Goa, India', category: 'accommodation', name: 'Taj Exotica', estimatedCost: 200, rating: 5, tags: ['luxury'] },
  { location: 'Goa, India', category: 'accommodation', name: 'Acron Waterfront', estimatedCost: 80, rating: 4, tags: ['standard'] },
  { location: 'Goa, India', category: 'accommodation', name: 'Jungle Hostel', estimatedCost: 15, rating: 4, tags: ['budget'] },
];

const foodStops = [
  { location: 'Ladakh, India', category: 'food', name: 'Tibetan Kitchen', estimatedCost: 10 },
  { location: 'Ladakh, India', category: 'food', name: 'Highway Dhaba (Thali)', estimatedCost: 4 },
  { location: 'Kolkata, India', category: 'food', name: 'Peter Cat (Chelo Kebab)', estimatedCost: 12 },
  { location: 'Kolkata, India', category: 'food', name: 'K.C. Das (Rosogolla)', estimatedCost: 2 },
  { location: 'Goa, India', category: 'food', name: 'Thalassa (Greek/Seafood)', estimatedCost: 25 },
  { location: 'Goa, India', category: 'food', name: 'Local Goan Fish Thali', estimatedCost: 5 },
];

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding');

    await DestinationCatalog.deleteMany({});
    await PredefinedPackage.deleteMany({});

    console.log('Cleared existing collections');

    const allItems = [
      ...ladakhPlaces, ...kolkataPlaces, ...goaPlaces,
      ...transports, ...hotels, ...foodStops
    ];

    await DestinationCatalog.insertMany(allItems);
    console.log('Inserted Destination Catalog (' + allItems.length + ' items)');

    // Mock Packages (optional, mostly for Mode 3)
    const packages = [
      {
        title: 'Ladakh Bike Expedition',
        description: 'Epic 8-day road trip from Delhi to Leh.',
        destination: 'Ladakh, India',
        durationDays: 8,
        comfortTier: 'standard',
        baselineCost: 400,
        itinerary: [],
        includedItems: ['Bike Rental', 'Fuel', 'Accommodation', 'Permits']
      },
      {
        title: 'Kolkata Heritage Tour',
        description: '7-day deep dive into the City of Joy.',
        destination: 'Kolkata, India',
        durationDays: 7,
        comfortTier: 'standard',
        baselineCost: 250,
        itinerary: [],
        includedItems: ['Train Fare', 'Hotel', 'Guided Tours']
      },
      {
        title: 'Goa Beach Hop',
        description: '7 days of sun, sand, and nightlife.',
        destination: 'Goa, India',
        durationDays: 7,
        comfortTier: 'budget',
        baselineCost: 180,
        itinerary: [],
        includedItems: ['Bus Fare', 'Hostel', 'Pub Crawl']
      }
    ];

    await PredefinedPackage.insertMany(packages);
    console.log('Inserted Predefined Packages');

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
