import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  QueryConstraint,
  CollectionReference,
  DocumentReference,
  SetOptions,
  setDoc,
} from 'firebase/firestore'
import { getFirebaseDb } from './firebase'

/**
 * Get a reference to a collection
 * @param collectionName Name of the collection
 * @returns CollectionReference
 */
export const getCollectionRef = (collectionName: string): CollectionReference => {
  const db = getFirebaseDb()
  return collection(db, collectionName)
}

/**
 * Get a reference to a document
 * @param collectionName Name of the collection
 * @param docId Document ID
 * @returns DocumentReference
 */
export const getDocRef = (collectionName: string, docId: string): DocumentReference => {
  const db = getFirebaseDb()
  return doc(db, collectionName, docId)
}

/**
 * Get a single document by ID
 * @param collectionName Name of the collection
 * @param docId Document ID
 * @returns Document data with ID or null if not found
 */
export const getDocument = async <T = DocumentData>(
  collectionName: string,
  docId: string
): Promise<(T & { id: string }) | null> => {
  const docRef = getDocRef(collectionName, docId)
  const docSnap = await getDoc(docRef)
  if (!docSnap.exists()) return null

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as T & { id: string }
}

/**
 * Get all documents from a collection
 * @param collectionName Name of the collection
 * @param queryConstraints Optional query constraints (where, orderBy, limit, etc.)
 * @returns Array of documents with their IDs
 */
export const getDocuments = async <T = DocumentData>(
  collectionName: string,
  ...queryConstraints: QueryConstraint[]
): Promise<Array<T & { id: string }>> => {
  const collectionRef = getCollectionRef(collectionName)
  const q = queryConstraints.length > 0 ? query(collectionRef, ...queryConstraints) : collectionRef
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Array<T & { id: string }>
}

/**
 * Add a new document to a collection
 * @param collectionName Name of the collection
 * @param data Document data
 * @returns Document ID of the created document
 */
export const addDocument = async <T = DocumentData>(
  collectionName: string,
  data: T
): Promise<string> => {
  const collectionRef = getCollectionRef(collectionName)
  const docRef = await addDoc(collectionRef, data as DocumentData)
  return docRef.id
}

/**
 * Set a document (create or overwrite)
 * @param collectionName Name of the collection
 * @param docId Document ID
 * @param data Document data
 * @param options Set options (e.g., { merge: true })
 */
export const setDocument = async <T = DocumentData>(
  collectionName: string,
  docId: string,
  data: T,
  options?: SetOptions
): Promise<void> => {
  const docRef = getDocRef(collectionName, docId)
  await setDoc(docRef, data as DocumentData, options || {})
}

/**
 * Update an existing document
 * @param collectionName Name of the collection
 * @param docId Document ID
 * @param data Partial document data to update
 */
export const updateDocument = async <T = DocumentData>(
  collectionName: string,
  docId: string,
  data: Partial<T>
): Promise<void> => {
  const docRef = getDocRef(collectionName, docId)
  await updateDoc(docRef, data as DocumentData)
}

/**
 * Delete a document
 * @param collectionName Name of the collection
 * @param docId Document ID
 */
export const deleteDocument = async (collectionName: string, docId: string): Promise<void> => {
  const docRef = getDocRef(collectionName, docId)
  await deleteDoc(docRef)
}

// Re-export commonly used query helpers for convenience
export { where, orderBy, limit, query }
