import { db } from "../firebase/firebase.config";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

export async function addOrUpdateReview({
  orderId,
  restaurantId,
  customerId,
  rating,
  comment = "",
}) {
  const reviewRef = doc(db, "reviews", orderId);          // one review per order
  const restRef   = doc(db, "restaurants", restaurantId);

  rating = Number(rating);

  await runTransaction(db, async (tx) => {
    const restSnap   = await tx.get(restRef);
    if (!restSnap.exists()) throw new Error("Restaurant not found");

    const reviewSnap = await tx.get(reviewRef);
    const restData   = restSnap.data();

    const currentTotal = Number(restData.totalReviews || 0);
    const currentAvg   = Number(restData.rating || 0);

    let newTotal = currentTotal;
    let newAvg   = currentAvg;

    if (reviewSnap.exists()) {
      // Replace old rating with the new one (don’t double count)
      const old = Number(reviewSnap.data().rating || 0);
      const sum = currentAvg * currentTotal - old + rating;
      newAvg    = currentTotal > 0 ? sum / currentTotal : 0;
    } else {
      // First time this order is being reviewed
      const sum = currentAvg * currentTotal + rating;
      newTotal  = currentTotal + 1;
      newAvg    = sum / newTotal;
    }

    // Upsert the review
    tx.set(reviewRef, {
      orderId,
      restaurantId,
      customerId,
      rating,
      comment,
      createdAt: serverTimestamp(),
    }, { merge: true });

    // Update aggregates on restaurant
    tx.update(restRef, {
      totalReviews: newTotal,
      rating: Number(newAvg.toFixed(2)),
    });
  });
}

/** Live subscribe to latest reviews for a restaurant (for display) */
export function subscribeRestaurantReviews(restaurantId, onData, onError) {
  const q = query(
    collection(db, "reviews"),
    where("restaurantId", "==", restaurantId),
    orderBy("createdAt", "desc"),
    limit(20)
  );
  return onSnapshot(q, (snap) => {
    onData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, onError);
}
