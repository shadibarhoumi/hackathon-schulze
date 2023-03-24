import { useRegistrationStatus } from '@/hooks/useRegistrationStatus'
import { ParticipantType, Election } from '@/types/Election'
import { saveCandidate } from '@/utils/saveCandidate'
import { fetchCandidates } from '@/utils/fetchCandidates'

import {
  Alert,
  AlertIcon,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Textarea,
} from '@chakra-ui/react'
import { useEthers } from '@usedapp/core'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { saveVoter } from '@/utils/saveVoter'

interface Props {
  electionAddress: string
}

export interface CandidateFormSchema {
  name: string
  description: string
  imageUrl: string
}

export function Registration({ electionAddress }: Props) {
  const { account, chainId } = useEthers()
  const { handleSubmit, register } = useForm<CandidateFormSchema>({
    defaultValues: {},
  })
  const [type, setType] = useState<ParticipantType>('voter')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isRegisteredAsVoter = useRegistrationStatus(
    account,
    electionAddress,
    'voter',
  )
  const isRegisteredAsCandidate = useRegistrationStatus(
    account,
    electionAddress,
    'candidate',
  )

  const onSubmit = async (candidateData: CandidateFormSchema) => {
    console.log('submitted', candidateData)
    setIsSubmitting(true)
    let success
    if (type === 'candidate') {
      success = await saveCandidate({
        address: account,
        electionAddress,
        chainId,
        ...candidateData,
      })
    } else {
      success = await saveVoter({
        address: account,
        electionAddress,
        chainId,
      })
    }
    if (success) {
      toast(`You have successfully registered as a ${type}!`)
    }
    setIsSubmitting(false)
    console.log(`Registering ${account} as ${type}`)
  }

  return (
    <Stack spacing={5}>
      <Heading>Register for Election</Heading>
      {isRegisteredAsVoter && (
        <Alert status="success">
          <AlertIcon />
          You&apos;re registered as a voter, cast your vote when the election
          begins!
        </Alert>
      )}
      {isRegisteredAsCandidate && (
        <Alert status="success">
          <AlertIcon />
          You&apos;re registered as a candidate, good luck!
        </Alert>
      )}
      {(isRegisteredAsCandidate || isRegisteredAsVoter) && (
        <Heading>Get ready to vote!</Heading>
      )}
      {(!isRegisteredAsCandidate || !isRegisteredAsVoter) && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={5}>
            <FormControl>
              <FormLabel>Address</FormLabel>
              <Input value={account} disabled />
            </FormControl>
            <RadioGroup
              onChange={(e: ParticipantType) => setType(e)}
              value={type}
            >
              <Stack spacing={5} direction="row">
                {!isRegisteredAsVoter && <Radio value="voter">Voter</Radio>}
                {!isRegisteredAsCandidate && (
                  <Radio value="candidate">Candidate</Radio>
                )}
              </Stack>
            </RadioGroup>
            {type === 'candidate' && (
              <>
                <FormControl>
                  <FormLabel>Project Name</FormLabel>
                  <Input {...register('name')} placeholder="Name" />
                </FormControl>
                <FormControl>
                  <FormLabel>Project Description</FormLabel>
                  <Textarea
                    {...register('description')}
                    placeholder="Description"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Image Url</FormLabel>
                  <Input
                    {...register('imageUrl')}
                    placeholder="https://funnyimage.com/image.jpeg"
                  />
                </FormControl>
              </>
            )}
            <Button
              isLoading={isSubmitting}
              loadingText="Registering..."
              colorScheme="blue"
              type="submit"
            >
              Register
            </Button>
          </Stack>
        </form>
      )}
    </Stack>
  )
}
