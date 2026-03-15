export type SpotWithAvgRating = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  imageUrl: string | null;
  createdAt: Date;
  avgOverall: number | null;
  totalRatings: number;
};
