import { Candidate } from '@/types/Candidate'
import { PLACEHOLDER_IMAGE } from './placeholderImage'

export const fetchCandidates = async (candidateAddresses: string[]) => {
  console.log({ candidateAddresses })
  const candidateMap: Record<string, Candidate> = {}
  const req = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/candidates/all`,
  )
  const candidatesMetadata = await req.json()
  candidatesMetadata.forEach((candidate: Candidate) => {
    candidateMap[candidate.address] = candidate
  })
  console.log({ candidateMap })

  const candidates: Candidate[] = candidateAddresses.map((address: string) => {
    return candidateMap[address]
  })
  return candidates
}
