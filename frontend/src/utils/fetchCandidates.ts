import { Candidate } from '@/types/Candidate'

import { collection, getDocs } from 'firebase/firestore'
import { clientDb } from '@/lib/firebaseClient'

const useFirebase = true

export const fetchCandidates = async (
  candidateAddresses: string[],
  chainId: number | undefined,
  electionAddress: string,
) => {
  const candidateMap: Record<string, Candidate> = {}
  if (useFirebase) {
    const querySnapshot = await getDocs(
      collection(clientDb, `candidates-${chainId}-${electionAddress}`),
    )
    querySnapshot.forEach((doc) => {
      const candidate = doc.data()
      candidateMap[candidate.address] = candidate as Candidate
    })
  } else {
    const req = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/candidates/all`,
    )
    const candidatesMetadata = await req.json()
    candidatesMetadata.forEach((candidate: Candidate) => {
      candidateMap[candidate.address] = candidate
    })
  }

  const candidates: Candidate[] = candidateAddresses.map((address: string) => {
    return candidateMap[address]
  })
  return candidates
}
