// Import the functions you need from the SDKs you need
import { getApps, initializeApp } from 'firebase/app'
import { GoogleAuthProvider, getAuth } from 'firebase/auth'
import {
  CollectionReference,
  DocumentData,
  collection,
  getFirestore,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCNyQBG4_cQEV_7B3vouw0CTtu6F9weTr0',
  authDomain: 'schulze-elections.firebaseapp.com',
  projectId: 'schulze-elections',
  storageBucket: 'schulze-elections.appspot.com',
  messagingSenderId: '958015182467',
  appId: '1:958015182467:web:ce4583c094c2eec213adb6',
}

if (!getApps().length) {
  initializeApp(firebaseConfig)
}

export const clientDb = getFirestore(getApps()[0])

const createCollection = <T = DocumentData>(collectionName: string) => {
  return collection(clientDb, collectionName) as CollectionReference<T>
}

export const electionsCol = createCollection('elections')
