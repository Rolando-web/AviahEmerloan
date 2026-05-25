import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAjRholwZiXfsUPACtLgdJRzOE1ExwmF_Q",
  authDomain: "webaviahemerloan.firebaseapp.com",
  projectId: "webaviahemerloan",
  storageBucket: "webaviahemerloan.firebasestorage.app",
  messagingSenderId: "657576512096",
  appId: "1:657576512096:web:162769ae8910483abed105",
  measurementId: "G-T3Y3WB31X0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let cachedLoans = [];
let isLoaded = false;

export async function initStorage() {
  if (isLoaded) return;
  try {
    const snapshot = await getDocs(collection(db, "loans"));
    cachedLoans = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    // Sort by createdAt descending initially
    cachedLoans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Firebase read error. Make sure your Firestore rules allow reads:", error);
    // If it fails (e.g., rules), just start with empty array so UI doesn't crash
    cachedLoans = [];
  }
  isLoaded = true;
}

export function getLoans() {
  return cachedLoans;
}

export async function upsertLoan(updatedLoan) {
  const idx = cachedLoans.findIndex((l) => l.id === updatedLoan.id);
  if (idx >= 0) {
    cachedLoans[idx] = updatedLoan;
  } else {
    cachedLoans.unshift(updatedLoan);
  }
  // Sync to Firestore asynchronously
  await setDoc(doc(db, "loans", updatedLoan.id), updatedLoan);
  return updatedLoan;
}

export async function updateLoan(id, patch) {
  const idx = cachedLoans.findIndex((l) => l.id === id);
  if (idx < 0) return null;
  cachedLoans[idx] = { ...cachedLoans[idx], ...patch };
  // Sync to Firestore asynchronously
  await setDoc(doc(db, "loans", id), cachedLoans[idx]);
  return cachedLoans[idx];
}

export function getLoanById(id) {
  return cachedLoans.find((l) => l.id === id) ?? null;
}

export async function deleteLoan(id) {
  const initialLength = cachedLoans.length;
  cachedLoans = cachedLoans.filter((l) => l.id !== id);
  await deleteDoc(doc(db, "loans", id));
  return cachedLoans.length !== initialLength;
}

export function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `loan_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
