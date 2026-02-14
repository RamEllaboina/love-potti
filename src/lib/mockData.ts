export interface Report {
  id: string;
  category: "Waste" | "Water" | "Road";
  location: { lat: number; lng: number };
  address: string;
  imageUrl: string;
  status: "not_solved" | "in_progress" | "solved";
  upvotes: number;
  timestamp: string;
  description: string;
}

export const mockReports: Report[] = [
  {
    id: "1",
    category: "Waste",
    location: { lat: 17.385, lng: 78.4867 },
    address: "Charminar, Hyderabad",
    imageUrl: "",
    status: "not_solved",
    upvotes: 24,
    timestamp: "2026-02-10T08:30:00Z",
    description: "Large pile of garbage dumped near the main road causing severe odor.",
  },
  {
    id: "2",
    category: "Water",
    location: { lat: 17.4399, lng: 78.4983 },
    address: "Secunderabad Railway Station",
    imageUrl: "",
    status: "in_progress",
    upvotes: 18,
    timestamp: "2026-02-08T14:15:00Z",
    description: "Sewage overflow flooding the pedestrian walkway.",
  },
  {
    id: "3",
    category: "Road",
    location: { lat: 17.4156, lng: 78.4347 },
    address: "Banjara Hills, Road No. 12",
    imageUrl: "",
    status: "solved",
    upvotes: 42,
    timestamp: "2026-02-05T10:00:00Z",
    description: "Deep pothole causing vehicle damage and accidents.",
  },
  {
    id: "4",
    category: "Waste",
    location: { lat: 17.3616, lng: 78.4747 },
    address: "Falaknuma, Old City",
    imageUrl: "",
    status: "not_solved",
    upvotes: 31,
    timestamp: "2026-02-12T09:45:00Z",
    description: "Medical waste found in open drain near residential area.",
  },
  {
    id: "5",
    category: "Water",
    location: { lat: 17.4486, lng: 78.3908 },
    address: "Kukatpally Housing Board",
    imageUrl: "",
    status: "in_progress",
    upvotes: 15,
    timestamp: "2026-02-11T16:20:00Z",
    description: "Stagnant water breeding mosquitoes near children's park.",
  },
];
