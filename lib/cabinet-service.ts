import {
  cabinets as mockCabinets,
  type Cabinet as MockCabinet,
} from "@/lib/mock-data";
import { getSupabaseClient } from "@/lib/supabase";

export type CabinetReview = {
  id: string;
  patient: string;
  rating: number;
  comment: string;
  reported?: boolean;
};

export type Cabinet = {
  id: string;
  name: string;
  category: MockCabinet["category"];
  specialty: string;
  wilaya: string;
  address: string;
  phone: string;
  rating: number;
  price: number;
  description: string;
  image: string;
  gallery: string[];
  reviews: CabinetReview[];
};

type CabinetRow = {
  id: string;
  name: string;
  category: Cabinet["category"];
  specialty: string;
  wilaya: string;
  address: string;
  phone: string;
  consultation_price: number;
  description: string | null;
  image_url: string | null;
  gallery_urls: string[] | null;
};

type ReviewRow = {
  id: string;
  cabinet_id: string;
  rating: number;
  comment: string;
  status: "pending" | "published" | "hidden";
};

function normalizeGallery(row: CabinetRow, fallbackImage: string) {
  const gallery = row.gallery_urls?.filter(Boolean) ?? [];
  return gallery.length > 0 ? gallery : [fallbackImage];
}

function averageRating(reviews: CabinetReview[]) {
  if (reviews.length === 0) {
    return 0;
  }

  return Number(
    (
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    ).toFixed(1),
  );
}

function fallbackCabinets() {
  return mockCabinets.map((cabinet) => ({
    id: cabinet.id,
    name: cabinet.name,
    category: cabinet.category,
    specialty: cabinet.specialty,
    wilaya: cabinet.wilaya,
    address: cabinet.address,
    phone: cabinet.phone,
    rating: cabinet.rating,
    price: cabinet.price,
    description: cabinet.description,
    image: cabinet.image,
    gallery: cabinet.gallery,
    reviews: cabinet.reviews.map((review) => ({
      id: String(review.id),
      patient: review.patient,
      rating: review.rating,
      comment: review.comment,
      reported: review.reported,
    })),
  }));
}

export async function getCabinets(): Promise<Cabinet[]> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return fallbackCabinets();
  }

  const { data: cabinetRows, error: cabinetError } = await supabase
    .from("cabinets")
    .select(
      "id, name, category, specialty, wilaya, address, phone, consultation_price, description, image_url, gallery_urls",
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (cabinetError || !cabinetRows?.length) {
    return fallbackCabinets();
  }

  const cabinetIds = cabinetRows.map((row) => row.id);
  const { data: reviewRows, error: reviewError } = await supabase
    .from("reviews")
    .select("id, cabinet_id, rating, comment, status")
    .in("cabinet_id", cabinetIds)
    .eq("status", "published");

  if (reviewError) {
    return cabinetRows.map((row) => {
      const fallbackImage = row.image_url ?? mockCabinets[0]?.image ?? "";

      return {
        id: row.id,
        name: row.name,
        category: row.category,
        specialty: row.specialty,
        wilaya: row.wilaya,
        address: row.address,
        phone: row.phone,
        rating: 0,
        price: row.consultation_price,
        description: row.description ?? "",
        image: fallbackImage,
        gallery: normalizeGallery(row, fallbackImage),
        reviews: [],
      };
    });
  }

  const reviewsByCabinet = new Map<string, CabinetReview[]>();

  for (const review of reviewRows ?? []) {
    const currentReviews = reviewsByCabinet.get(review.cabinet_id) ?? [];

    currentReviews.push({
      id: review.id,
      patient: "Patient",
      rating: review.rating,
      comment: review.comment,
    });

    reviewsByCabinet.set(review.cabinet_id, currentReviews);
  }

  return cabinetRows.map((row) => {
    const fallbackImage = row.image_url ?? mockCabinets[0]?.image ?? "";
    const reviews = reviewsByCabinet.get(row.id) ?? [];

    return {
      id: row.id,
      name: row.name,
      category: row.category,
      specialty: row.specialty,
      wilaya: row.wilaya,
      address: row.address,
      phone: row.phone,
      rating: averageRating(reviews),
      price: row.consultation_price,
      description: row.description ?? "",
      image: fallbackImage,
      gallery: normalizeGallery(row, fallbackImage),
      reviews,
    };
  });
}

export async function getCabinetById(id: string): Promise<Cabinet | null> {
  const cabinets = await getCabinets();

  return cabinets.find((cabinet) => cabinet.id === id) ?? null;
}
