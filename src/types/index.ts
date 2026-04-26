export type SpotWithAvgRating = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  imageUrl: string | null;
  lat: number | null;
  lng: number | null;
  createdAt: Date;
  avgOverall: number | null;
  avgSauce: number | null;
  totalRatings: number;
  latestRating: Date | null;
};
