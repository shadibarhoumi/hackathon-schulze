import { Candidate } from '@/types/Candidate'
import { useEffect, useState } from 'react'
import { useCandidateAddresses } from './useCandidateAddresses'
import { fetchCandidates } from '@/utils/fetchCandidates'
import { useEthers } from '@usedapp/core'

export const useCandidates = (electionAddress: string) => {
  const { chainId } = useEthers()
  const candidateAddresses = useCandidateAddresses(electionAddress)
  const [candidates, setCandidates] = useState<Candidate[]>()

  useEffect(() => {
    const fetchData = async () => {
      if (candidateAddresses && candidateAddresses.length) {
        const candidates = await fetchCandidates(
          candidateAddresses,
          chainId,
          electionAddress,
        )
        setCandidates(candidates)
      }
    }
    fetchData()
  }, [candidateAddresses])

  return candidates
}
