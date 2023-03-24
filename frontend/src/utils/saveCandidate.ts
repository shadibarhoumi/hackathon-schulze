import { clientDb } from '@/lib/firebaseClient'
import { doc, setDoc } from 'firebase/firestore'

interface CandidateInput {
  address: string | undefined
  electionAddress: string
  name: string
  description: string
  imageUrl: string
  chainId: number | undefined
}

export const saveCandidate = async ({
  address,
  electionAddress,
  name,
  description,
  imageUrl,
  chainId,
}: CandidateInput) => {
  try {
    await setDoc(
      doc(clientDb, `candidates-${chainId}-${electionAddress}/${address}`),
      {
        name,
        description,
        address,
        image_url: imageUrl,
        election_address: electionAddress,
        chain_id: chainId,
      },
    )
  } catch (err) {
    return false
  }
  return true
  // const response = await fetch(
  //   process.env.NEXT_PUBLIC_BACKEND_URL! + '/candidate',
  //   {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       name,
  //       description,
  //       address,
  //       image_url: imageUrl,
  //       election_address: electionAddress,
  //       chain_id: chainId,
  //     }),
  //   },
  // )
  // return response.status === 200
}
