import { clientDb } from '@/lib/firebaseClient'
import { doc, setDoc } from 'firebase/firestore'

interface VoterInput {
  address: string | undefined
  electionAddress: string
  chainId: number | undefined
}

export const saveVoter = async ({
  address,
  electionAddress,
  chainId,
}: VoterInput) => {
  try {
    await setDoc(
      doc(clientDb, `voter-${chainId}-${electionAddress}/${address}`),
      {
        address,
        election_address: electionAddress,
        chain_id: chainId,
      },
    )
  } catch (err) {
    return false
  }
  return true
  // const response = await fetch(
  //   process.env.NEXT_PUBLIC_BACKEND_URL! + '/voter',
  //   {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       address,
  //       election_address: electionAddress,
  //       chain_id: chainId,
  //     }),
  //   },
  // )
  // return response.status === 200
}
