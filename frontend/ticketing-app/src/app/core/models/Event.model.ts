    
    /** Separem les direccións (Venue) */
    export interface Venue {
        name: string;
        address: string;
        capacity: number;
    }
    /** Representa un esdeveniment */
    export interface Event {
        _id: string;
        name: string;
        slug: string;
        description: string;
        date: Date;
        venue: Venue;
        totalCapacity: number;
        availableSeats: number;
        basePrice: number;
        status: 'published' | 'draft' | 'cancelled';
        imageUrl: string;
    }