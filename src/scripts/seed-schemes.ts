
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Define the structure of your scheme data
interface Scheme {
  id: number;
  title: string;
  description: string;
  category: string;
  ministry: string;
  state: string;
  age: [number, number];
  link: string;
}

// Path to your JSON data
const dataPath = path.join(__dirname, '../data/schemes.json');
// The name of the collection in Firestore
const collectionName = 'schemes';

async function seedDatabase() {
  console.log('Starting to seed database...');

  try {
    // Check if the collection is empty
    const schemesCollection = collection(db, collectionName);
    const snapshot = await getDocs(schemesCollection);

    if (!snapshot.empty) {
      console.log(`Collection "${collectionName}" is not empty. Seeding is not required.`);
      return;
    }

    console.log(`Collection "${collectionName}" is empty. Proceeding with seeding.`);

    // Read the JSON file
    const fileContents = fs.readFileSync(dataPath, 'utf8');
    const schemesData: Scheme[] = JSON.parse(fileContents);

    // Add each scheme to the Firestore collection
    for (const scheme of schemesData) {
      await addDoc(schemesCollection, scheme);
      console.log(`Added: ${scheme.title}`);
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1); // Exit with an error code
  }
}

seedDatabase();
