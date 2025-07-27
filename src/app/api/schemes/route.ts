
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export async function GET() {
    try {
        const schemesCollection = collection(db, 'schemes');
        const q = query(schemesCollection, orderBy('id'));
        const querySnapshot = await getDocs(q);
        
        const schemesArray = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(schemesArray);
    } catch (error) {
        console.error("Firestore read error:", error);
        return NextResponse.json({ message: 'Failed to fetch schemes from Firestore' }, { status: 500 });
    }
}
