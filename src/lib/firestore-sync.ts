import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Mission } from "./gauntlet/types";

const MISSIONS_COLLECTION = "missions";
const MEMORIES_COLLECTION = "user_memories";

/**
 * Save or update a mission in Cloud Firestore
 */
export async function syncMissionToFirestore(mission: Mission, userId: string): Promise<void> {
  if (!userId || userId === "dev-user") return;
  try {
    const docRef = doc(db, MISSIONS_COLLECTION, mission.id);
    const serialized = {
      ...mission,
      userId,
      updatedAt: mission.updatedAt || Date.now(),
      // Ensure attachments do not store heavy raw base64 in Firestore doc
      attachments: mission.attachments?.map((a) => ({
        id: a.id,
        mimeType: a.mimeType,
        data: "",
        preview: a.preview?.slice(0, 200) || "",
      })) || [],
    };
    await setDoc(docRef, serialized, { merge: true });
  } catch (error) {
    console.error("Firestore sync error:", error);
  }
}

/**
 * Delete a mission from Cloud Firestore
 */
export async function deleteMissionFromFirestore(missionId: string, userId: string): Promise<void> {
  if (!userId || userId === "dev-user") return;
  try {
    const docRef = doc(db, MISSIONS_COLLECTION, missionId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Firestore delete error:", error);
  }
}

/**
 * Load all missions for the current user
 */
export async function loadUserMissions(userId: string): Promise<Mission[]> {
  if (!userId || userId === "dev-user") return [];
  try {
    const q = query(
      collection(db, MISSIONS_COLLECTION),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc")
    );
    const snap = await getDocs(q);
    const items: Mission[] = [];
    snap.forEach((d) => {
      items.push(d.data() as Mission);
    });
    return items;
  } catch (error) {
    console.error("Failed to load missions from Firestore:", error);
    return [];
  }
}

/**
 * Subscribe to real-time updates for user missions
 */
export function subscribeUserMissions(
  userId: string,
  onUpdate: (missions: Mission[]) => void
): () => void {
  if (!userId || userId === "dev-user") return () => {};
  try {
    const q = query(
      collection(db, MISSIONS_COLLECTION),
      where("userId", "==", userId)
    );
    return onSnapshot(q, (snapshot) => {
      const missions: Mission[] = [];
      snapshot.forEach((d) => {
        missions.push(d.data() as Mission);
      });
      missions.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      onUpdate(missions);
    }, (error) => {
      console.warn("Firestore snapshot error:", error);
    });
  } catch (err) {
    console.warn("Could not subscribe to missions:", err);
    return () => {};
  }
}

/**
 * Persist knowledge graph memories to Firestore
 */
export async function syncMemoryToFirestore(
  memoryId: string,
  key: string,
  value: string,
  category: string,
  userId: string
): Promise<void> {
  if (!userId || userId === "dev-user") return;
  try {
    const docRef = doc(db, MEMORIES_COLLECTION, `${userId}_${memoryId}`);
    await setDoc(docRef, {
      id: memoryId,
      userId,
      key,
      value,
      category,
      updatedAt: Date.now(),
    }, { merge: true });
  } catch (err) {
    console.error("Firestore memory sync error:", err);
  }
}
